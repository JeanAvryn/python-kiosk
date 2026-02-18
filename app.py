from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

DB = "database.db"

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    
    # News
    c.execute("""
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            image TEXT,
            date TEXT
        )
    """)
    
    # Research
    c.execute("""
        CREATE TABLE IF NOT EXISTS research (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            authors TEXT NOT NULL,
            year INTEGER NOT NULL,
            field TEXT NOT NULL,
            abstract TEXT NOT NULL,
            keywords TEXT
        )
    """)
    
    # Faculty
    c.execute("""
        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            department TEXT NOT NULL
        )
    """
    )

    # Analytics
    c.execute("""
    CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        module_first TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL
        )
    """
    )

    conn.commit()
    conn.close()

init_db()

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.commit()
    conn.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/')
def index_page():
    return render_template('index.html')

@app.route('/role-selector')
def role_selector_page():
    return render_template('role-selector.html')

@app.route('/modules')
def modules_page():
    return render_template('modules.html')

@app.route('/faculty')
def faculty_page():
    return render_template('faculty.html')

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

@app.route('/news')
def news_page():
    return render_template('news.html')

@app.route('/research')
def research_page():
    return render_template('research.html')

@app.route('/history')
def history_page():
    return render_template('history.html')

@app.route('/map')
def map_page():
    return render_template('campus-map.html')

@app.route("/api/news", methods=["GET", "POST"])
def news():
    if request.method == "GET":
        data = query_db("SELECT * FROM news ORDER BY date DESC")
        return jsonify([dict(row) for row in data])
    
    data = request.json
    if "id" in data:
        query_db("""
            UPDATE news SET title=?, category=?, content=?, image=? WHERE id=?
        """, (data['title'], data['category'], data['content'], data['image'], data['id']))
    else:
        query_db("""
            INSERT INTO news (title, category, content, image, date) VALUES (?, ?, ?, ?, ?)
        """, (data['title'], data['category'], data['content'], data['image'], data['date']))
    return jsonify({"status":"success"})

@app.route("/api/news/<int:id>", methods=["DELETE"])
def delete_news(id):
    query_db("DELETE FROM news WHERE id=?", (id,))
    return jsonify({"status":"deleted"})

@app.route("/api/research", methods=["GET", "POST"])
def research():
    if request.method == "GET":
        data = query_db("SELECT * FROM research ORDER BY year DESC")
        return jsonify([dict(row) for row in data])
    
    data = request.json
    if "id" in data:
        query_db("""
            UPDATE research SET title=?, authors=?, year=?, field=?, abstract=?, keywords=? WHERE id=?
        """, (data['title'], data['authors'], data['year'], data['field'], data['abstract'], data['keywords'], data['id']))
    else:
        query_db("""
            INSERT INTO research (title, authors, year, field, abstract, keywords) VALUES (?, ?, ?, ?, ?, ?)
        """, (data['title'], data['authors'], data['year'], data['field'], data['abstract'], data['keywords']))
    return jsonify({"status":"success"})

@app.route("/api/research/<int:id>", methods=["DELETE"])
def delete_research(id):
    query_db("DELETE FROM research WHERE id=?", (id,))
    return jsonify({"status":"deleted"})

# API route for faculty data
@app.route("/api/faculty", methods=["GET", "POST"])
def faculty_api():
    if request.method == "GET":
        data = query_db("SELECT * FROM faculty ORDER BY department")
        return jsonify([dict(row) for row in data])
    
    data = request.json
    if "id" in data:
        query_db("""
            UPDATE faculty SET name=?, position=?, email=?, department=? WHERE id=?
        """, (data['name'], data['position'], data['email'], data['department'], data['id']))
    else:
        query_db("""
            INSERT INTO faculty (name, position, email, department) VALUES (?, ?, ?, ?)
        """, (data['name'], data['position'], data['email'], data['department']))
    return jsonify({"status":"success"})

@app.route("/api/faculty/<int:id>", methods=["DELETE"])
def delete_faculty(id):
    query_db("DELETE FROM faculty WHERE id=?", (id,))
    return jsonify({"status":"deleted"})

@app.route("/api/analytics", methods=["GET", "POST"])
def analytics_api():
    if request.method == "GET":
        data = query_db("SELECT * FROM analytics ORDER BY date DESC, time DESC")
        return jsonify([dict(row) for row in data])

    # Record a new analytics event
    data = request.json
    query_db(
        "INSERT INTO analytics (role, module_first, date, time) VALUES (?, ?, ?, ?)",
        (data['role'], data['module_first'], data['date'], data['time'])
    )
    return jsonify({"status": "success"})



if __name__ == "__main__":
    app.run(debug=True)
