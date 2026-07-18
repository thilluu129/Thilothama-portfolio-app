/**
 * V THILOTHAMA — Portfolio JavaScript
 * Dynamic data fetching, full CRUD via Django REST API,
 * UI animations, filtering, contact form, and manage panel.
 */

/* ============================================================
   0. API BASE URL — loads from localStorage or defaults to localhost
   ============================================================ */
function getApiBaseUrl() {
  return localStorage.getItem('vt_api_url') || 'http://127.0.0.1:8000/api';
}
// Alias for compatibility
function getApiBase() { return getApiBaseUrl(); }

function getAdminPasscode() {
  return localStorage.getItem('vt_admin_passcode') || '';
}
// Alias for compatibility
function getAdminPassword() { return getAdminPasscode(); }

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initNavbar();
  initScrollReveal();
  initTypewriter();
  initStatsCounter();
  
  // Data fetching
  fetchSkills();
  fetchProjects();
  
  // Event listeners
  initProjectFilters();
  initContactForm();
  initManageModal();
  
  // Set current year in footer
  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  window.addEventListener('mousemove', (e) => {
    dot.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    setTimeout(() => {
      ring.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
    }, 40);
  });

  document.querySelectorAll('a, button, input, textarea, select, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

/* ============================================================
   2. NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    let current = '';
    document.querySelectorAll('.section').forEach(section => {
      if (scrollY >= section.offsetTop - 200) current = section.getAttribute('id');
    });
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });
    allNavLinks.forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
  }
}

/* ============================================================
   3. SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* ============================================================
   4. TYPEWRITER
   ============================================================ */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const texts = [
    'Full-Stack Applications',
    'REST APIs with Django',
    'Java Spring Boot Apps',
    'Beautiful Frontends',
    'Database Solutions',
  ];

  let count = 0, index = 0, isDeleting = false, letter = '';

  function type() {
    const currentText = texts[count % texts.length];
    letter = isDeleting ? currentText.slice(0, --index) : currentText.slice(0, ++index);
    el.textContent = letter;

    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && letter === currentText) { speed = 2000; isDeleting = true; }
    else if (isDeleting && letter === '') { isDeleting = false; count++; speed = 500; }

    setTimeout(type, speed);
  }
  setTimeout(type, 1000);
}

/* ============================================================
   5. STATS COUNTER
   ============================================================ */
function initStatsCounter() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else el.textContent = current;
      }, 40);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => observer.observe(el));
}

/* ============================================================
   6. FETCH & RENDER SKILLS
   ============================================================ */
async function fetchSkills() {
  const loading = document.getElementById('skills-loading');
  const errorEl = document.getElementById('skills-error');
  const grid = document.getElementById('skills-grid');

  try {
    const res = await fetch(`${getApiBase()}/skills/`);
    if (!res.ok) throw new Error('API Error');
    const skills = await res.json();

    const grouped = {
      language: { label: 'Languages', items: [] },
      frontend:  { label: 'Frontend', items: [] },
      backend:   { label: 'Backend', items: [] },
      database:  { label: 'Database', items: [] },
      tools:     { label: 'Tools & DevOps', items: [] },
    };

    skills.forEach(s => { if (grouped[s.category]) grouped[s.category].items.push(s); });

    let html = '';
    Object.keys(grouped).forEach(key => {
      const cat = grouped[key];
      if (!cat.items.length) return;
      html += `<div class="skill-category-block reveal-up"><h3 class="skill-category-label">${cat.label}</h3><div class="skill-list">`;
      cat.items.forEach(s => {
        html += `
          <div class="skill-item">
            <div class="skill-meta">
              <span class="skill-name"><span class="skill-icon">${s.icon || ''}</span> ${s.name}</span>
              <span class="skill-pct">${s.level}%</span>
            </div>
            <div class="skill-bar-track">
              <div class="skill-bar-fill" data-width="${s.level}%" style="width:0%"></div>
            </div>
          </div>`;
      });
      html += `</div></div>`;
    });

    loading.classList.add('hidden');
    grid.innerHTML = html;
    grid.classList.remove('hidden');

    // Animate bars
    const bars = grid.querySelectorAll('.skill-bar-fill');
    const barObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.width; obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    bars.forEach(b => barObs.observe(b));
    initScrollReveal();

  } catch (err) {
    console.error('Fetch skills error:', err);
    loading.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

/* ============================================================
   7. FETCH & RENDER PROJECTS
   ============================================================ */
let allProjects = [];

async function fetchProjects() {
  const loading = document.getElementById('projects-loading');
  const errorEl = document.getElementById('projects-error');

  try {
    const res = await fetch(`${getApiBase()}/projects/`);
    if (!res.ok) throw new Error('API Error');
    allProjects = await res.json();
    loading.classList.add('hidden');
    renderProjects(allProjects);
  } catch (err) {
    console.error('Fetch projects error:', err);
    loading.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const empty = document.getElementById('projects-empty');
  grid.innerHTML = '';

  if (!projects.length) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  const catMap = {
    fullstack: { label: 'Full-Stack', class: 'cat-fullstack', icon: '⚡' },
    frontend:  { label: 'Frontend',   class: 'cat-frontend',  icon: '🎨' },
    backend:   { label: 'Backend',    class: 'cat-backend',   icon: '⚙️' },
    data:      { label: 'Data',       class: 'cat-data',      icon: '📊' },
    game:      { label: 'Game',       class: 'cat-game',      icon: '🎮' },
  };

  projects.forEach((proj, i) => {
    const cat = catMap[proj.category] || catMap.fullstack;
    const tags = Array.isArray(proj.tech_stack)
      ? proj.tech_stack.slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('')
      : '';
    const extra = Array.isArray(proj.tech_stack) && proj.tech_stack.length > 4
      ? `<span class="tech-tag">+${proj.tech_stack.length - 4}</span>` : '';

    let links = '';
    if (proj.github_url && proj.github_url !== '#') {
      links += `<a href="${proj.github_url}" target="_blank" rel="noopener" class="card-link link-github" onclick="event.stopPropagation()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        Code
      </a>`;
    }
    if (proj.live_url && proj.live_url !== '#') {
      links += `<a href="${proj.live_url}" target="_blank" rel="noopener" class="card-link link-live" onclick="event.stopPropagation()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Live Demo
      </a>`;
    }
    links += `<button class="card-link link-details" onclick="openProjectModal(${proj.id}); event.stopPropagation()">Details →</button>`;

    const card = document.createElement('div');
    card.className = `project-card${proj.featured ? ' featured' : ''}`;
    card.style.animationDelay = `${i * 0.08}s`;
    card.onclick = () => openProjectModal(proj.id);
    card.innerHTML = `
      <div class="card-top">
        <div class="card-icon-wrap">${cat.icon}</div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          ${proj.featured ? `<span class="card-featured-badge">★ Featured</span>` : ''}
          <span class="card-category ${cat.class}">${cat.label}</span>
        </div>
      </div>
      <h3 class="card-title">${proj.title}</h3>
      <p class="card-desc">${proj.description}</p>
      <div class="card-tech">${tags}${extra}</div>
      <div class="card-links">${links}</div>`;

    grid.appendChild(card);
  });
}

function initProjectFilters() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const f = btn.dataset.filter;
      renderProjects(f === 'all' ? allProjects : allProjects.filter(p => p.category === f));
    });
  });
}

/* ============================================================
   8. PROJECT DETAIL MODAL
   ============================================================ */
function openProjectModal(id) {
  const proj = allProjects.find(p => p.id === id);
  if (!proj) return;

  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-project-content');

  const tags = Array.isArray(proj.tech_stack)
    ? proj.tech_stack.map(t => `<span class="tech-tag">${t}</span>`).join('') : '';

  let links = '';
  if (proj.github_url && proj.github_url !== '#') {
    links += `<a href="${proj.github_url}" target="_blank" rel="noopener" class="btn btn-outline">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
      View Source
    </a>`;
  }
  if (proj.live_url && proj.live_url !== '#') {
    links += `<a href="${proj.live_url}" target="_blank" rel="noopener" class="btn btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Live Demo
    </a>`;
  }

  const imageHtml = proj.image_url
    ? `<img src="${proj.image_url}" alt="${proj.title} screenshot" class="modal-project-image" onerror="this.style.display='none'" />` : '';

  content.innerHTML = `
    ${imageHtml}
    <h2 id="modal-project-title">${proj.title}</h2>
    <div class="modal-tech">${tags}</div>
    <div class="modal-desc">${proj.long_description ? proj.long_description.replace(/\n/g, '<br>') : proj.description}</div>
    <div class="modal-links">${links}</div>`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('close-project-modal').onclick = closeProjectModal;
  modal.onclick = e => { if (e.target === modal) closeProjectModal(); };
  document.addEventListener('keydown', handleEsc);
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.add('hidden');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEsc);
}

function handleEsc(e) { if (e.key === 'Escape') closeProjectModal(); }

/* ============================================================
   9. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const msgInput = document.getElementById('contact-message');
  const charCount = document.getElementById('char-count');
  if (!form) return;

  msgInput?.addEventListener('input', () => {
    const len = msgInput.value.length;
    charCount.textContent = `${len} / 2000`;
    charCount.style.color = len >= 2000 ? 'var(--clr-danger)' : 'var(--clr-text-dim)';
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn');
    const btnText = document.getElementById('submit-btn-text');
    btn.disabled = true;
    btnText.textContent = 'Sending…';

    try {
      const response = await fetch(`${getApiBase()}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('contact-name').value,
          email: document.getElementById('contact-email').value,
          subject: document.getElementById('contact-subject').value,
          message: msgInput.value,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        showToast('Message sent successfully! I\'ll get back to you soon. ✓', 'success');
        form.reset();
        if (charCount) charCount.textContent = '0 / 2000';
      } else {
        showToast('Failed to send. Please check the fields.', 'error');
      }
    } catch {
      showToast('Network error. Is the Django server running?', 'error');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Send Message';
    }
  });
}

/* ============================================================
   10. MANAGE MODAL — full CRUD
   ============================================================ */
function initManageModal() {
  const modal = document.getElementById('manage-modal');
  const openBtn = document.getElementById('open-manage-modal');
  const closeBtn = document.getElementById('close-manage-modal');

  openBtn.onclick = () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Pre-fill saved settings
    const passEl = document.getElementById('admin-passcode');
    const urlEl  = document.getElementById('api-base-url');
    if (passEl) passEl.value = getAdminPasscode();
    if (urlEl)  urlEl.value  = localStorage.getItem('vt_api_url') || '';
    loadManageProjects();
    loadManageSkills();
  };

  closeBtn.onclick = () => closeManageModal();
  modal.onclick = e => { if (e.target === modal) closeManageModal(); };

  // Save settings
  document.getElementById('save-settings-btn').onclick = () => {
    const passcode = document.getElementById('admin-passcode').value.trim();
    const url = document.getElementById('api-base-url').value.trim();
    if (passcode) localStorage.setItem('vt_admin_passcode', passcode);
    if (url) localStorage.setItem('vt_api_url', url);
    showToast('Settings saved! ✓', 'success');
  };

  // Toggle passcode visibility
  document.getElementById('toggle-passcode').onclick = () => {
    const input = document.getElementById('admin-passcode');
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  // Skill level range display
  document.getElementById('skill-level').addEventListener('input', e => {
    document.getElementById('skill-level-display').textContent = e.target.value;
  });

  // Tab switching
  document.querySelectorAll('.manage-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.manage-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.manage-tab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`manage-${tab.dataset.manageTab}-tab`).classList.remove('hidden');
    };
  });

  // Show/cancel project form
  document.getElementById('show-add-project-form').onclick = () => showProjectForm();
  document.getElementById('cancel-project-form').onclick = () => hideProjectForm();

  // Show/cancel skill form
  document.getElementById('show-add-skill-form').onclick = () => showSkillForm();
  document.getElementById('cancel-skill-form').onclick = () => hideSkillForm();

  // Project form submit
  document.getElementById('project-form').addEventListener('submit', submitProjectForm);

  // Skill form submit
  document.getElementById('skill-form').addEventListener('submit', submitSkillForm);
}

function closeManageModal() {
  document.getElementById('manage-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

/* --- Project Form --- */
function showProjectForm(proj = null) {
  const wrap = document.getElementById('project-form-wrap');
  const title = document.getElementById('project-form-title');
  const submitText = document.getElementById('project-submit-text');
  wrap.classList.remove('hidden');

  if (proj) {
    title.textContent = 'Edit Project';
    submitText.textContent = 'Update Project';
    document.getElementById('project-edit-id').value = proj.id;
    document.getElementById('proj-title').value = proj.title || '';
    document.getElementById('proj-category').value = proj.category || '';
    document.getElementById('proj-desc').value = proj.description || '';
    document.getElementById('proj-long-desc').value = proj.long_description || '';
    document.getElementById('proj-tech').value = Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : '';
    document.getElementById('proj-github').value = proj.github_url || '';
    document.getElementById('proj-live').value = proj.live_url || '';
    document.getElementById('proj-image').value = proj.image_url || '';
    document.getElementById('proj-featured').checked = proj.featured || false;
    document.getElementById('proj-order').value = proj.order || 0;
  } else {
    title.textContent = 'Add New Project';
    submitText.textContent = 'Save Project';
    document.getElementById('project-edit-id').value = '';
    document.getElementById('project-form').reset();
  }
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideProjectForm() {
  document.getElementById('project-form-wrap').classList.add('hidden');
  document.getElementById('project-form').reset();
  document.getElementById('project-edit-id').value = '';
}

async function submitProjectForm(e) {
  e.preventDefault();
  const id = document.getElementById('project-edit-id').value;
  const isEdit = !!id;

  const techRaw = document.getElementById('proj-tech').value;
  const techStack = techRaw.split(',').map(s => s.trim()).filter(Boolean);

  const data = {
    title: document.getElementById('proj-title').value.trim(),
    category: document.getElementById('proj-category').value,
    description: document.getElementById('proj-desc').value.trim(),
    long_description: document.getElementById('proj-long-desc').value.trim(),
    tech_stack: techStack,
    github_url: document.getElementById('proj-github').value.trim(),
    live_url: document.getElementById('proj-live').value.trim(),
    image_url: document.getElementById('proj-image').value.trim(),
    featured: document.getElementById('proj-featured').checked,
    order: parseInt(document.getElementById('proj-order').value) || 0,
  };

  const btn = document.getElementById('project-submit-btn');
  btn.disabled = true;
  document.getElementById('project-submit-text').textContent = isEdit ? 'Updating…' : 'Saving…';

  try {
    const url = isEdit ? `${getApiBaseUrl()}/projects/${id}/` : `${getApiBaseUrl()}/projects/`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Password': getAdminPasscode() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast(isEdit ? 'Project updated! ✓' : 'Project added! ✓', 'success');
      hideProjectForm();
      await fetchProjects();
      await loadManageProjects();
    } else if (res.status === 403) {
      showToast('Permission denied. Check your passcode.', 'error');
    } else {
      const err = await res.json();
      showToast('Failed: ' + JSON.stringify(err), 'error');
    }
  } catch {
    showToast('Network error. Is Django running?', 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('project-submit-text').textContent = isEdit ? 'Update Project' : 'Save Project';
  }
}

async function deleteProject(id, title) {
  if (!confirm(`Delete project "${title}"?\n\nThis action cannot be undone.`)) return;

  try {
    const res = await fetch(`${getApiBaseUrl()}/projects/${id}/`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': getAdminPasscode() },
    });
    if (res.ok || res.status === 204) {
      showToast('Project deleted. ✓', 'success');
      await fetchProjects();
      await loadManageProjects();
    } else if (res.status === 403) {
      showToast('Permission denied. Check your passcode.', 'error');
    } else {
      showToast('Failed to delete project.', 'error');
    }
  } catch {
    showToast('Network error.', 'error');
  }
}

async function loadManageProjects() {
  const listEl = document.getElementById('manage-projects-list');
  const loading = document.getElementById('manage-projects-loading');
  loading.classList.remove('hidden');
  listEl.innerHTML = '';

  try {
    const res = await fetch(`${getApiBaseUrl()}/projects/`);
    const projects = await res.json();
    loading.classList.add('hidden');

    if (!projects.length) {
      listEl.innerHTML = '<p class="manage-empty">No projects yet. Click "Add Project" to start.</p>';
      return;
    }

    const catLabels = { fullstack: 'Full-Stack', frontend: 'Frontend', backend: 'Backend', data: 'Data/ML', game: 'Game' };

    listEl.innerHTML = projects.map(p => `
      <div class="manage-list-item" id="manage-proj-${p.id}">
        <div class="manage-item-info">
          <span class="manage-item-title">${p.featured ? '⭐ ' : ''}${p.title}</span>
          <span class="manage-item-meta">${catLabels[p.category] || p.category} • ${Array.isArray(p.tech_stack) ? p.tech_stack.slice(0,3).join(', ') : ''}</span>
          <div class="manage-item-links">
            ${p.github_url && p.github_url !== '#' ? `<a href="${p.github_url}" target="_blank" class="manage-item-link">GitHub ↗</a>` : ''}
            ${p.live_url && p.live_url !== '#' ? `<a href="${p.live_url}" target="_blank" class="manage-item-link live">Live ↗</a>` : ''}
          </div>
        </div>
        <div class="manage-item-actions">
          <button class="manage-edit-btn" onclick="editProjectById(${p.id})" aria-label="Edit ${p.title}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="manage-delete-btn" onclick="deleteProject(${p.id}, '${p.title.replace(/'/g, "\\'")}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      </div>`).join('');
  } catch {
    loading.classList.add('hidden');
    listEl.innerHTML = '<p class="manage-empty" style="color:var(--clr-danger)">Could not load projects. Is Django running?</p>';
  }
}

async function editProjectById(id) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/projects/${id}/`);
    const proj = await res.json();
    showProjectForm(proj);
  } catch {
    showToast('Could not load project data.', 'error');
  }
}

/* --- Skill Form --- */
function showSkillForm(skill = null) {
  const wrap = document.getElementById('skill-form-wrap');
  const title = document.getElementById('skill-form-title');
  const submitText = document.getElementById('skill-submit-text');
  wrap.classList.remove('hidden');

  if (skill) {
    title.textContent = 'Edit Skill';
    submitText.textContent = 'Update Skill';
    document.getElementById('skill-edit-id').value = skill.id;
    document.getElementById('skill-name').value = skill.name || '';
    document.getElementById('skill-category').value = skill.category || '';
    document.getElementById('skill-icon').value = skill.icon || '';
    document.getElementById('skill-level').value = skill.level || 80;
    document.getElementById('skill-level-display').textContent = skill.level || 80;
    document.getElementById('skill-order').value = skill.order || 0;
  } else {
    title.textContent = 'Add New Skill';
    submitText.textContent = 'Save Skill';
    document.getElementById('skill-edit-id').value = '';
    document.getElementById('skill-form').reset();
    document.getElementById('skill-level').value = 80;
    document.getElementById('skill-level-display').textContent = 80;
  }
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideSkillForm() {
  document.getElementById('skill-form-wrap').classList.add('hidden');
  document.getElementById('skill-form').reset();
  document.getElementById('skill-edit-id').value = '';
}

async function submitSkillForm(e) {
  e.preventDefault();
  const id = document.getElementById('skill-edit-id').value;
  const isEdit = !!id;

  const data = {
    name: document.getElementById('skill-name').value.trim(),
    category: document.getElementById('skill-category').value,
    icon: document.getElementById('skill-icon').value.trim(),
    level: parseInt(document.getElementById('skill-level').value),
    order: parseInt(document.getElementById('skill-order').value) || 0,
  };

  const btn = document.getElementById('skill-submit-btn');
  btn.disabled = true;
  document.getElementById('skill-submit-text').textContent = isEdit ? 'Updating…' : 'Saving…';

  try {
    const url = isEdit ? `${getApiBaseUrl()}/skills/${id}/` : `${getApiBaseUrl()}/skills/`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Password': getAdminPasscode() },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast(isEdit ? 'Skill updated! ✓' : 'Skill added! ✓', 'success');
      hideSkillForm();
      await fetchSkills();
      await loadManageSkills();
    } else if (res.status === 403) {
      showToast('Permission denied. Check your passcode.', 'error');
    } else {
      showToast('Failed to save skill.', 'error');
    }
  } catch {
    showToast('Network error. Is Django running?', 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('skill-submit-text').textContent = isEdit ? 'Update Skill' : 'Save Skill';
  }
}

async function deleteSkill(id, name) {
  if (!confirm(`Delete skill "${name}"?\n\nThis action cannot be undone.`)) return;

  try {
    const res = await fetch(`${getApiBaseUrl()}/skills/${id}/`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': getAdminPasscode() },
    });
    if (res.ok || res.status === 204) {
      showToast('Skill deleted. ✓', 'success');
      await fetchSkills();
      await loadManageSkills();
    } else if (res.status === 403) {
      showToast('Permission denied. Check your passcode.', 'error');
    } else {
      showToast('Failed to delete skill.', 'error');
    }
  } catch {
    showToast('Network error.', 'error');
  }
}

async function loadManageSkills() {
  const listEl = document.getElementById('manage-skills-list');
  const loading = document.getElementById('manage-skills-loading');
  loading.classList.remove('hidden');
  listEl.innerHTML = '';

  const catLabels = {
    language: 'Languages', frontend: 'Frontend', backend: 'Backend', database: 'Database', tools: 'Tools'
  };

  try {
    const res = await fetch(`${getApiBaseUrl()}/skills/`);
    const skills = await res.json();
    loading.classList.add('hidden');

    if (!skills.length) {
      listEl.innerHTML = '<p class="manage-empty">No skills yet. Click "Add Skill" to start.</p>';
      return;
    }

    listEl.innerHTML = skills.map(s => `
      <div class="manage-list-item" id="manage-skill-${s.id}">
        <div class="manage-item-info">
          <span class="manage-item-title">${s.icon || ''} ${s.name}</span>
          <span class="manage-item-meta">${catLabels[s.category] || s.category} • ${s.level}%</span>
          <div class="skill-bar-track" style="margin-top:4px;height:4px">
            <div class="skill-bar-fill" style="width:${s.level}%;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--clr-accent),var(--clr-accent-alt));transition:width .3s"></div>
          </div>
        </div>
        <div class="manage-item-actions">
          <button class="manage-edit-btn" onclick="editSkillById(${s.id})" aria-label="Edit ${s.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="manage-delete-btn" onclick="deleteSkill(${s.id}, '${s.name.replace(/'/g, "\\'")}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      </div>`).join('');
  } catch {
    loading.classList.add('hidden');
    listEl.innerHTML = '<p class="manage-empty" style="color:var(--clr-danger)">Could not load skills.</p>';
  }
}

async function editSkillById(id) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/skills/${id}/`);
    const skill = await res.json();
    showSkillForm(skill);
  } catch {
    showToast('Could not load skill data.', 'error');
  }
}

/* ============================================================
   11. TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
