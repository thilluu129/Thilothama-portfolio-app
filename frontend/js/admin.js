const API_BASE = 'http://127.0.0.1:8000/api';
let adminPasscode = sessionStorage.getItem('vt_admin_passcode') || null;

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;
const savedTheme = localStorage.getItem('vt-theme') || 'dark';
rootElement.setAttribute('data-theme', savedTheme);
themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = rootElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    rootElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('vt-theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// Admin Auth logic
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');

if (adminPasscode) {
    showDashboard();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-password').value;
    
    // Test the password by making a simple request
    try {
        // Projects list is public, but we can try to do an OPTIONS request or just try to use the password
        adminPasscode = pass;
        // In a real app we'd verify token. Here we'll just show dashboard. 
        // Actual CRUD actions will fail if password is wrong.
        sessionStorage.setItem('vt_admin_passcode', pass);
        showDashboard();
    } catch (e) {
        loginStatus.textContent = 'Verification failed.';
    }
});

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    fetchAdminProjects();
}

// Fetch Projects for Admin
async function fetchAdminProjects() {
    const tbody = document.getElementById('projects-tbody');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/projects/`);
        const projects = await response.json();
        
        tbody.innerHTML = '';
        projects.forEach(proj => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${proj.id}</td>
                <td>${proj.title}</td>
                <td>${proj.category}</td>
                <td>${proj.featured ? 'Yes' : 'No'}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteProject(${proj.id})">🗑️ Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger-color)">Failed to load projects</td></tr>`;
    }
}

// Delete Project
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/projects/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-Admin-Password': adminPasscode
            }
        });
        
        if (response.ok || response.status === 204) {
            alert('Project deleted successfully');
            fetchAdminProjects();
        } else {
            alert('Failed to delete. Incorrect Admin Password?');
            sessionStorage.removeItem('vt_admin_passcode');
            location.reload();
        }
    } catch (err) {
        alert('API Error');
    }
}
