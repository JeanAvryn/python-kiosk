// admin.js
const ADMIN_PASSWORD = 'admin123';
let currentSection = 'news';
let editingId = null;

// Login Function
function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        showAdminSection('news');
    } else {
        alert('Incorrect password. Default password is: admin123');
    }
}

// Logout Function
function logout() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// Show Admin Section
function showAdminSection(section, event) {
    currentSection = section;
    editingId = null; // reset editingId on tab switch
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    switch(section) {
        case 'news': renderNewsAdmin(); break;
        case 'research': renderResearchAdmin(); break;
        case 'faculty': showFacultyAdmin(); break;
        case 'analytics': renderAnalytics(); break;
    }
}

// -------------------
// NEWS
// -------------------
async function fetchNews() {
    const res = await fetch('/api/news');
    return await res.json();
}

async function renderNewsAdmin() {
    const newsData = await fetchNews();
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h2>Manage News</h2>
        <div class="admin-form">
            <input id="newsTitle" placeholder="Title">
            <input id="newsCategory" placeholder="Category">
            <textarea id="newsContent" placeholder="Content"></textarea>
            <input id="newsImage" placeholder="Image URL">
            <button id="saveNewsBtn">${editingId ? 'Update News' : 'Add News'}</button>
            ${editingId ? '<button id="cancelNewsBtn">Cancel</button>' : ''}
        </div>
        <h3>Existing News</h3>
        <div id="newsList"></div>
    `;
    displayNewsList();

    document.getElementById('saveNewsBtn').addEventListener('click', saveNews);
    if(editingId) {
        document.getElementById('cancelNewsBtn').addEventListener('click', () => {
            editingId = null;
            renderNewsAdmin();
        });
    }
}

async function displayNewsList() {
    const newsData = await fetchNews();
    const newsList = document.getElementById('newsList');
    if(!newsData.length) { newsList.innerHTML = '<p>No news yet.</p>'; return; }

    newsList.innerHTML = newsData.map(n => `
        <div class="admin-item">
            <h3>${n.title}</h3>
            <p>${n.category} - ${n.date}</p>
            <p>${n.content.substring(0,100)}...</p>
            <button onclick="editNews(${n.id})">Edit</button>
            <button onclick="deleteNews(${n.id})">Delete</button>
        </div>
    `).join('');
}

async function saveNews() {
    const payload = {
        title: document.getElementById('newsTitle').value,
        category: document.getElementById('newsCategory').value,
        content: document.getElementById('newsContent').value,
        image: document.getElementById('newsImage').value,
        date: new Date().toISOString().split('T')[0]
    };
    if(editingId) payload.id = editingId;

    await fetch('/api/news', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });

    editingId = null;
    renderNewsAdmin();
}

async function editNews(id) {
    const newsData = await fetchNews();
    const article = newsData.find(n => n.id === id);
    if(article){
        editingId = id;
        await renderNewsAdmin();
        document.getElementById('newsTitle').value = article.title;
        document.getElementById('newsCategory').value = article.category;
        document.getElementById('newsContent').value = article.content;
        document.getElementById('newsImage').value = article.image;
    }
}

async function deleteNews(id) {
    if(!confirm('Delete this news?')) return;
    await fetch(`/api/news/${id}`, {method:'DELETE'});
    renderNewsAdmin();
}

// -------------------
// RESEARCH
// -------------------
async function fetchResearch() {
    const res = await fetch('/api/research');
    return await res.json();
}

async function renderResearchAdmin() {
    const data = await fetchResearch();
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h2>Manage Research</h2>
        <div class="admin-form">
            <input id="researchTitle" placeholder="Title">
            <input id="researchAuthors" placeholder="Authors (comma-separated)">
            <input id="researchYear" type="number" placeholder="Year">
            <select id="researchField">
                <option value="STEM">STEM</option>
                <option value="Humanities">Humanities</option>
                <option value="Social Science">Social Science</option>
                <option value="Applied Arts">Applied Arts</option>
            </select>
            <textarea id="researchAbstract" placeholder="Abstract"></textarea>
            <input id="researchKeywords" placeholder="Keywords (comma-separated)">
            <button id="saveResearchBtn">${editingId ? 'Update' : 'Add'}</button>
            ${editingId ? '<button id="cancelResearchBtn">Cancel</button>' : ''}
        </div>
        <h3>Existing Research</h3>
        <div id="researchList"></div>
    `;

    displayResearchList();

    document.getElementById('saveResearchBtn').addEventListener('click', saveResearch);
    if(editingId) {
        document.getElementById('cancelResearchBtn').addEventListener('click', () => {
            editingId = null;
            renderResearchAdmin();
        });
    }
}

async function displayResearchList() {
    const data = await fetchResearch();
    const list = document.getElementById('researchList');
    if(!data.length){ list.innerHTML='<p>No research yet.</p>'; return; }
    list.innerHTML = data.map(r => `
        <div class="admin-item">
            <h3>${r.title}</h3>
            <p>${r.field} - ${r.year}</p>
            <p>By: ${r.authors}</p>
            <p>${r.abstract.substring(0,100)}...</p>
            <button onclick="editResearch(${r.id})">Edit</button>
            <button onclick="deleteResearch(${r.id})">Delete</button>
        </div>
    `).join('');
}

async function saveResearch() {
    const payload = {
        title: document.getElementById('researchTitle').value,
        authors: document.getElementById('researchAuthors').value,
        year: parseInt(document.getElementById('researchYear').value),
        field: document.getElementById('researchField').value,
        abstract: document.getElementById('researchAbstract').value,
        keywords: document.getElementById('researchKeywords').value
    };
    if(editingId) payload.id = editingId;

    await fetch('/api/research', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    editingId = null;
    renderResearchAdmin();
}

async function editResearch(id) {
    const data = await fetchResearch();
    const paper = data.find(r => r.id === id);
    if(paper){
        editingId = id;
        await renderResearchAdmin();
        document.getElementById('researchTitle').value = paper.title;
        document.getElementById('researchAuthors').value = paper.authors;
        document.getElementById('researchYear').value = paper.year;
        document.getElementById('researchField').value = paper.field;
        document.getElementById('researchAbstract').value = paper.abstract;
        document.getElementById('researchKeywords').value = paper.keywords;
    }
}

async function deleteResearch(id) {
    if(!confirm('Delete this research?')) return;
    await fetch(`/api/research/${id}`, {method:'DELETE'});
    renderResearchAdmin();
}

// -------------------
// FACULTY
// -------------------
async function fetchFaculty() {
    const res = await fetch('/api/faculty');
    return await res.json();
}

async function showFacultyAdmin() {
    const facultyData = await fetchFaculty();
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h2>Manage Faculty Directory</h2>
        <div class="admin-form">
            <input type="text" id="facultyName" placeholder="Full Name">
            <input type="text" id="facultyPosition" placeholder="Position">
            <input type="email" id="facultyEmail" placeholder="Email">
            <select id="facultyDept">
                <option value="administration">Administration</option>
                <option value="science">Science</option>
                <option value="math">Mathematics</option>
                <option value="english">English</option>
                <option value="techvoc">TechVoc</option>
                <option value="mapeh">MAPEH</option>
                <option value="values">Values Education</option>
                <option value="filipino">Filipino</option>
                <option value="socsci">Social Sciences</option>
                <option value="shs">Senior High School</option>
            </select>
            <button id="saveFacultyBtn">${editingId ? 'Update Faculty' : 'Add Faculty'}</button>
            ${editingId ? '<button id="cancelFacultyBtn">Cancel</button>' : ''}
        </div>
        <h3>Existing Faculty Members</h3>
        <div id="facultyList" class="admin-list"></div>
    `;

    displayFacultyList();

    document.getElementById('saveFacultyBtn').addEventListener('click', saveFaculty);
    if(editingId) {
        document.getElementById('cancelFacultyBtn').addEventListener('click', () => {
            editingId = null;
            showFacultyAdmin();
        });
    }
}

async function displayFacultyList() {
    const facultyData = await fetchFaculty();
    const facultyList = document.getElementById('facultyList');
    if(!facultyData.length){ facultyList.innerHTML='<p>No faculty members yet.</p>'; return; }

    facultyList.innerHTML = facultyData.map((member,index) => `
        <div class="admin-item">
            <div class="admin-item-content">
                <h3>${member.name}</h3>
                <p><strong>${member.position}</strong></p>
                <p>${member.email}</p>
                <p>Department: ${member.department}</p>
            </div>
            <div class="admin-item-actions">
                <button onclick="editFaculty(${member.id})">Edit</button>
                <button onclick="deleteFaculty(${member.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function saveFaculty() {
    const name = document.getElementById('facultyName').value;
    const position = document.getElementById('facultyPosition').value;
    const email = document.getElementById('facultyEmail').value;
    const dept = document.getElementById('facultyDept').value;

    if(!name || !position || !email){ alert('Please fill in all fields'); return; }

    const payload = { name, position, email, department: dept };
    if(editingId) payload.id = editingId;

    await fetch('/api/faculty', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });

    editingId = null;
    showFacultyAdmin();
}

async function editFaculty(id) {
    const facultyData = await fetchFaculty();
    const member = facultyData.find(f => f.id===id);
    if(!member) return;
    editingId = id;
    await showFacultyAdmin();
    document.getElementById('facultyName').value = member.name;
    document.getElementById('facultyPosition').value = member.position;
    document.getElementById('facultyEmail').value = member.email;
    document.getElementById('facultyDept').value = member.department;
}

async function deleteFaculty(id) {
    if(!confirm('Delete this faculty member?')) return;
    await fetch(`/api/faculty/${id}`,{method:'DELETE'});
    showFacultyAdmin();
}

// -------------------
// ANALYTICS
// -------------------
async function renderAnalytics() {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    const content = document.getElementById('adminContent');

    content.innerHTML = `
        <h2>Kiosk Analytics</h2>
        <table>
            <thead>
                <tr>
                    <th>ROLE</th>
                    <th>MODULE CLICKED FIRST</th>
                    <th>DATE OF USE</th>
                    <th>TIME OF USE</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.role}</td>
                        <td>${row.module_first}</td>
                        <td>${row.date}</td>
                        <td>${row.time}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Allow Enter key for login
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('adminPassword');
    if(passwordInput){
        passwordInput.addEventListener('keypress', e=>{
            if(e.key==='Enter') login();
        });
    }
});
