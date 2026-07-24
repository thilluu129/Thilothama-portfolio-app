// ── API Base URL (auto-detects local vs production) ──────────────────────────
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000/api'
    : 'https://thilothama-portfolio-backend.onrender.com/api';

let adminPasscode = sessionStorage.getItem('vt_admin_passcode') || null;

// ── Theme Toggle ─────────────────────────────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement    = document.documentElement;
const savedTheme     = localStorage.getItem('vt-theme') || 'dark';
rootElement.setAttribute('data-theme', savedTheme);
if (themeToggleBtn) themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const cur = rootElement.getAttribute('data-theme');
        const nxt = cur === 'dark' ? 'light' : 'dark';
        rootElement.setAttribute('data-theme', nxt);
        localStorage.setItem('vt-theme', nxt);
        themeToggleBtn.textContent = nxt === 'dark' ? '☀️' : '🌙';
    });
}

// ── Auth ─────────────────────────────────────────────────────────────────────
const loginSection    = document.getElementById('login-section');
const dashboardSection= document.getElementById('dashboard-section');
const loginForm       = document.getElementById('login-form');
const loginStatus     = document.getElementById('login-status');
const logoutBtn       = document.getElementById('logout-btn');

if (adminPasscode) showDashboard();

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-password').value.trim();
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        loginStatus.textContent = 'Verifying...';
        loginStatus.style.color = 'var(--text-muted)';
        submitBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/projects/`, {
                headers: { 'X-Admin-Password': pass }
            });
            if (res.ok) {
                adminPasscode = pass;
                sessionStorage.setItem('vt_admin_passcode', pass);
                loginStatus.textContent = '';
                showDashboard();
            } else {
                loginStatus.textContent = '❌ Wrong password. Try again.';
                loginStatus.style.color = 'var(--danger-color)';
            }
        } catch {
            adminPasscode = pass;
            sessionStorage.setItem('vt_admin_passcode', pass);
            showDashboard();
        } finally {
            submitBtn.disabled = false;
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('vt_admin_passcode');
        adminPasscode = null;
        loginSection.style.display  = 'block';
        dashboardSection.style.display = 'none';
        logoutBtn.style.display = 'none';
        document.getElementById('admin-password').value = '';
    });
}

function showDashboard() {
    loginSection.style.display    = 'none';
    dashboardSection.style.display= 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    fetchAdminHero();
    fetchAdminProjects();
    fetchAdminSkills();
    fetchAdminMessages();
}

// ── Tab Navigation ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(`tab-${btn.dataset.tab}`);
        if (target) target.classList.add('active');
    });
});

// ═══════════════════════════════════════════════════════════════════
// 1. HOME / HERO SECTION CRUD
// ═══════════════════════════════════════════════════════════════════
async function fetchAdminHero() {
    try {
        const res = await fetch(`${API_BASE}/hero/`);
        if (!res.ok) return;
        const hero = await res.json();
        
        document.getElementById('hero-name-inp').value      = hero.name || '';
        document.getElementById('hero-tagline-inp').value   = hero.tagline || '';
        document.getElementById('hero-desc-inp').value      = hero.description || '';
        document.getElementById('hero-badge-inp').value     = hero.badge_text || '';
        document.getElementById('hero-available-inp').checked = Boolean(hero.is_available);
        document.getElementById('hero-github-inp').value    = hero.github_url || '';
        document.getElementById('hero-linkedin-inp').value  = hero.linkedin_url || '';
        document.getElementById('hero-email-inp').value     = hero.email || '';
        document.getElementById('hero-resume-inp').value    = hero.resume_url || '';
    } catch (err) {
        console.error('Error fetching hero content:', err);
    }
}

const heroForm = document.getElementById('hero-form');
const heroFormStatus = document.getElementById('hero-form-status');

if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('hero-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        heroFormStatus.textContent = '';

        const payload = {
            name:         document.getElementById('hero-name-inp').value.trim(),
            tagline:      document.getElementById('hero-tagline-inp').value.trim(),
            description:  document.getElementById('hero-desc-inp').value.trim(),
            badge_text:   document.getElementById('hero-badge-inp').value.trim(),
            is_available: document.getElementById('hero-available-inp').checked,
            github_url:   document.getElementById('hero-github-inp').value.trim(),
            linkedin_url: document.getElementById('hero-linkedin-inp').value.trim(),
            email:        document.getElementById('hero-email-inp').value.trim(),
            resume_url:   document.getElementById('hero-resume-inp').value.trim(),
        };

        try {
            const res = await fetch(`${API_BASE}/hero/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': adminPasscode
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                heroFormStatus.textContent = '✅ Hero content updated successfully!';
                heroFormStatus.style.color = 'var(--success-color)';
            } else {
                const err = await res.json();
                heroFormStatus.textContent = `❌ Update failed: ${JSON.stringify(err)}`;
                heroFormStatus.style.color = 'var(--danger-color)';
            }
        } catch {
            heroFormStatus.textContent = '❌ Network error. Is Django running?';
            heroFormStatus.style.color = 'var(--danger-color)';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '💾 Save Hero Content';
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// 2. PROJECTS CRUD
// ═══════════════════════════════════════════════════════════════════
async function fetchAdminProjects() {
    const tbody = document.getElementById('projects-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-muted)">Loading projects...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/projects/`);
        if (!res.ok) throw new Error('Failed');
        const projects = await res.json();

        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-muted)">No projects yet. Add your first one!</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        projects.forEach(proj => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${proj.id}</td>
                <td><strong>${proj.title}</strong></td>
                <td>${proj.category}</td>
                <td class="${proj.featured ? 'badge-yes' : 'badge-no'}">${proj.featured ? '★ Yes' : 'No'}</td>
                <td class="action-cell">
                    <button class="action-btn edit" onclick="openEditProject(${proj.id})">✏️ Edit</button>
                    <button class="action-btn delete" onclick="deleteProject(${proj.id})">🗑️ Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--danger-color)">⚠️ Failed to load projects. Is Django running?</td></tr>';
    }
}

const projectModal      = document.getElementById('project-modal');
const projectForm       = document.getElementById('project-form');
const projFormStatus    = document.getElementById('proj-form-status');
const addProjectBtn     = document.getElementById('add-project-btn');
const closeProjectModalBtn = document.getElementById('close-project-modal');

if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => openProjectModal());
}
if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener('click', closeProjectModal);
}
if (projectModal) {
    projectModal.addEventListener('click', (e) => { if (e.target === projectModal) closeProjectModal(); });
}

function openProjectModal(proj = null) {
    document.getElementById('project-modal-title').textContent = proj ? 'Edit Project' : 'Add New Project';
    document.getElementById('proj-submit-btn').textContent    = proj ? '💾 Update Project' : '✅ Save Project';
    document.getElementById('project-id').value             = proj?.id || '';
    document.getElementById('proj-title').value             = proj?.title || '';
    document.getElementById('proj-description').value       = proj?.description || '';
    document.getElementById('proj-long-desc').value          = proj?.long_description || '';
    document.getElementById('proj-tech').value              = Array.isArray(proj?.tech_stack) ? proj.tech_stack.join(', ') : '';
    document.getElementById('proj-category').value          = proj?.category || 'fullstack';
    document.getElementById('proj-order').value             = proj?.order ?? 0;
    document.getElementById('proj-github').value            = proj?.github_url || '';
    document.getElementById('proj-live').value              = proj?.live_url || '';
    document.getElementById('proj-image').value             = proj?.image_url || '';
    document.getElementById('proj-featured').checked        = Boolean(proj?.featured);
    projFormStatus.textContent = '';
    projectModal.classList.add('open');
}

function closeProjectModal() {
    if (projectModal) projectModal.classList.remove('open');
    if (projectForm) projectForm.reset();
}

async function openEditProject(id) {
    try {
        const res = await fetch(`${API_BASE}/projects/${id}/`);
        const proj = await res.json();
        openProjectModal(proj);
    } catch {
        alert('Could not load project details.');
    }
}

if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        const isEdit = Boolean(id);

        const techRaw = document.getElementById('proj-tech').value;
        const techStack = techRaw.split(',').map(t => t.trim()).filter(Boolean);

        const payload = {
            title:            document.getElementById('proj-title').value.trim(),
            description:      document.getElementById('proj-description').value.trim(),
            long_description: document.getElementById('proj-long-desc').value.trim(),
            tech_stack:       techStack,
            category:         document.getElementById('proj-category').value,
            order:            parseInt(document.getElementById('proj-order').value) || 0,
            github_url:       document.getElementById('proj-github').value.trim(),
            live_url:         document.getElementById('proj-live').value.trim(),
            image_url:        document.getElementById('proj-image').value.trim(),
            featured:         document.getElementById('proj-featured').checked,
        };

        const submitBtn = document.getElementById('proj-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        projFormStatus.textContent = '';

        try {
            const url    = isEdit ? `${API_BASE}/projects/${id}/` : `${API_BASE}/projects/`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': adminPasscode
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                projFormStatus.textContent = isEdit ? '✅ Project updated!' : '✅ Project added!';
                projFormStatus.style.color = 'var(--success-color)';
                setTimeout(() => {
                    closeProjectModal();
                    fetchAdminProjects();
                }, 700);
            } else {
                const err = await res.json();
                projFormStatus.textContent = `❌ ${JSON.stringify(err)}`;
                projFormStatus.style.color = 'var(--danger-color)';
            }
        } catch {
            projFormStatus.textContent = '❌ Network error. Is Django running?';
            projFormStatus.style.color = 'var(--danger-color)';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isEdit ? '💾 Update Project' : '✅ Save Project';
        }
    });
}

async function deleteProject(id) {
    if (!confirm('⚠️ Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API_BASE}/projects/${id}/`, {
            method: 'DELETE',
            headers: { 'X-Admin-Password': adminPasscode }
        });
        if (res.ok || res.status === 204) {
            fetchAdminProjects();
        } else {
            alert('❌ Delete failed. Check your admin password.');
        }
    } catch {
        alert('Network error during delete.');
    }
}

// ═══════════════════════════════════════════════════════════════════
// 3. SKILLS CRUD
// ═══════════════════════════════════════════════════════════════════
async function fetchAdminSkills() {
    const tbody = document.getElementById('skills-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-muted)">Loading skills...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/skills/`);
        if (!res.ok) throw new Error('Failed');
        const skills = await res.json();

        if (skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:var(--text-muted)">No skills yet.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        skills.forEach(skill => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${skill.id}</td>
                <td><strong>${skill.icon || ''} ${skill.name}</strong></td>
                <td>${skill.category}</td>
                <td>
                    <div class="skill-bar-mini">
                        <div class="bar">
                            <div class="bar-fill" style="width:${skill.level}%;"></div>
                        </div>
                        <span>${skill.level}%</span>
                    </div>
                </td>
                <td class="action-cell">
                    <button class="action-btn edit" onclick="openEditSkill(${skill.id})">✏️ Edit</button>
                    <button class="action-btn delete" onclick="deleteSkill(${skill.id})">🗑️ Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--danger-color)">⚠️ Failed to load skills.</td></tr>';
    }
}

const skillModal      = document.getElementById('skill-modal');
const skillForm       = document.getElementById('skill-form');
const skillStatus     = document.getElementById('skill-form-status');
const addSkillBtn     = document.getElementById('add-skill-btn');
const closeSkillModalBtn = document.getElementById('close-skill-modal');

if (addSkillBtn) {
    addSkillBtn.addEventListener('click', () => openSkillModal());
}
if (closeSkillModalBtn) {
    closeSkillModalBtn.addEventListener('click', closeSkillModal);
}
if (skillModal) {
    skillModal.addEventListener('click', (e) => { if (e.target === skillModal) closeSkillModal(); });
}

function openSkillModal(skill = null) {
    document.getElementById('skill-modal-title').textContent = skill ? 'Edit Skill' : 'Add New Skill';
    document.getElementById('skill-submit-btn').textContent = skill ? '💾 Update Skill' : '✅ Save Skill';
    document.getElementById('skill-id').value        = skill?.id || '';
    document.getElementById('skill-name-inp').value   = skill?.name || '';
    document.getElementById('skill-cat-inp').value    = skill?.category || 'language';
    document.getElementById('skill-level-inp').value  = skill?.level ?? 75;
    document.getElementById('skill-icon-inp').value   = skill?.icon || '';
    document.getElementById('skill-order-inp').value  = skill?.order ?? 0;
    skillStatus.textContent = '';
    skillModal.classList.add('open');
}

function closeSkillModal() {
    if (skillModal) skillModal.classList.remove('open');
    if (skillForm) skillForm.reset();
}

async function openEditSkill(id) {
    try {
        const res = await fetch(`${API_BASE}/skills/${id}/`);
        const skill = await res.json();
        openSkillModal(skill);
    } catch {
        alert('Could not load skill details.');
    }
}

if (skillForm) {
    skillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('skill-id').value;
        const isEdit = Boolean(id);

        const submitBtn = document.getElementById('skill-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        skillStatus.textContent = '';

        const payload = {
            name:     document.getElementById('skill-name-inp').value.trim(),
            category: document.getElementById('skill-cat-inp').value,
            level:    parseInt(document.getElementById('skill-level-inp').value) || 75,
            icon:     document.getElementById('skill-icon-inp').value.trim(),
            order:    parseInt(document.getElementById('skill-order-inp').value) || 0,
        };

        try {
            const url    = isEdit ? `${API_BASE}/skills/${id}/` : `${API_BASE}/skills/`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': adminPasscode
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                skillStatus.textContent = isEdit ? '✅ Skill updated!' : '✅ Skill added!';
                skillStatus.style.color = 'var(--success-color)';
                setTimeout(() => {
                    closeSkillModal();
                    fetchAdminSkills();
                }, 700);
            } else {
                const err = await res.json();
                skillStatus.textContent = `❌ ${JSON.stringify(err)}`;
                skillStatus.style.color = 'var(--danger-color)';
            }
        } catch {
            skillStatus.textContent = '❌ Network error.';
            skillStatus.style.color = 'var(--danger-color)';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isEdit ? '💾 Update Skill' : '✅ Save Skill';
        }
    });
}

async function deleteSkill(id) {
    if (!confirm('Delete this skill?')) return;
    try {
        const res = await fetch(`${API_BASE}/skills/${id}/`, {
            method: 'DELETE',
            headers: { 'X-Admin-Password': adminPasscode }
        });
        if (res.ok || res.status === 204) {
            fetchAdminSkills();
        } else {
            alert('❌ Delete failed. Check your admin password.');
        }
    } catch {
        alert('Network error.');
    }
}

// ═══════════════════════════════════════════════════════════════════
// 4. CONTACT MESSAGES CRUD (Read & Delete)
// ═══════════════════════════════════════════════════════════════════
async function fetchAdminMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    container.innerHTML = '<p style="color:var(--text-muted)">Loading messages...</p>';
    try {
        const res = await fetch(`${API_BASE}/messages/`, {
            headers: { 'X-Admin-Password': adminPasscode }
        });
        if (!res.ok) throw new Error('Failed');
        const messages = await res.json();

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>No messages received yet.</p>
                </div>`;
            return;
        }
        container.innerHTML = '';
        messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
            const div = document.createElement('div');
            div.className = 'msg-card';
            div.innerHTML = `
                <div class="msg-card-header">
                    <span class="msg-name">👤 ${msg.name}</span>
                    <span class="msg-date">🕐 ${date}</span>
                </div>
                <div class="msg-email">✉️ ${msg.email}</div>
                <div class="msg-text">${msg.message}</div>
                <div class="msg-actions">
                    <button class="action-btn delete" onclick="deleteMessage(${msg.id})">🗑️ Delete Message</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--text-muted);">
                <p style="font-size:2rem; margin-bottom:12px;">⚠️</p>
                <p>Could not load messages. Make sure Django is running.</p>
            </div>`;
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        const res = await fetch(`${API_BASE}/messages/${id}/`, {
            method: 'DELETE',
            headers: { 'X-Admin-Password': adminPasscode }
        });
        if (res.ok || res.status === 204) {
            fetchAdminMessages();
        } else {
            alert('❌ Failed to delete message.');
        }
    } catch {
        alert('Network error.');
    }
}
