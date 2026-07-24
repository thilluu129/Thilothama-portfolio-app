// ── API base: auto-detects localhost vs production ────────────────────────────
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000/api'
    : 'https://thilothama-portfolio-backend.onrender.com/api'; // ← update with your Render URL

// ── Theme Toggle ─────────────────────────────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement    = document.documentElement;
const savedTheme     = localStorage.getItem('vt-theme') || 'dark';

rootElement.setAttribute('data-theme', savedTheme);
themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggleBtn.addEventListener('click', () => {
    const cur = rootElement.getAttribute('data-theme');
    const nxt = cur === 'dark' ? 'light' : 'dark';
    rootElement.setAttribute('data-theme', nxt);
    localStorage.setItem('vt-theme', nxt);
    themeToggleBtn.textContent = nxt === 'dark' ? '☀️' : '🌙';
});

// ── Navbar Scroll Effect ──────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Scroll Reveal Observer ────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Hero Content (from /api/hero/) ────────────────────────────────────────────
async function fetchHeroContent() {
    try {
        const res = await fetch(`${API_BASE}/hero/`);
        if (!res.ok) return;            // keep static fallback if API unavailable
        const hero = await res.json();

        // Badge
        const badge = document.getElementById('hero-badge');
        if (badge) {
            badge.textContent    = hero.badge_text || 'Available for Hire';
            badge.style.display  = hero.is_available ? 'inline-block' : 'none';
        }

        // Name + description
        const nameEl = document.getElementById('hero-name');
        const descEl = document.getElementById('hero-desc');
        if (nameEl && hero.name)        nameEl.textContent = hero.name;
        if (descEl && hero.description) descEl.textContent = hero.description;

        // Update page <title>
        if (hero.name) document.title = `${hero.name} | ${hero.tagline || 'Portfolio'}`;

        // Social links row
        const socialsEl = document.getElementById('hero-socials');
        if (socialsEl) {
            socialsEl.innerHTML = '';
            if (hero.github_url)   socialsEl.innerHTML += `<a href="${hero.github_url}"   target="_blank" class="social-link">🐙 GitHub</a>`;
            if (hero.linkedin_url) socialsEl.innerHTML += `<a href="${hero.linkedin_url}" target="_blank" class="social-link">💼 LinkedIn</a>`;
            if (hero.email)        socialsEl.innerHTML += `<a href="mailto:${hero.email}"               class="social-link">✉️ Email</a>`;
            if (hero.resume_url)   socialsEl.innerHTML += `<a href="${hero.resume_url}"   target="_blank" class="social-link">📄 Resume</a>`;
        }
    } catch {
        // Fail silently — static HTML acts as a fallback
    }
}

// ── Skills ────────────────────────────────────────────────────────────────────
async function fetchSkills() {
    const container = document.getElementById('skills-container');
    try {
        const res = await fetch(`${API_BASE}/skills/`);
        if (!res.ok) throw new Error('Failed to load skills');
        const skills = await res.json();

        container.innerHTML = '';
        skills.forEach((skill, i) => {
            const card = document.createElement('div');
            card.className = 'skill-card reveal';
            card.style.transitionDelay = `${i * 0.06}s`;
            card.innerHTML = `
                <h3>${skill.icon || '⚡'} ${skill.name}</h3>
                <div class="skill-info">
                    <span>${skill.category.toUpperCase()}</span>
                    <span>${skill.level}%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width:${skill.level}%"></div>
                </div>
            `;
            container.appendChild(card);
            revealObserver.observe(card);
        });
    } catch {
        container.innerHTML = `<p style="color:var(--danger-color)">⚠️ Could not load skills. Is Django running?</p>`;
    }
}

// ── Projects ──────────────────────────────────────────────────────────────────
async function fetchProjects() {
    const container = document.getElementById('projects-container');
    try {
        const res = await fetch(`${API_BASE}/projects/`);
        if (!res.ok) throw new Error('Failed to load projects');
        const projects = await res.json();

        container.innerHTML = '';
        projects.forEach((proj, i) => {
            const card = document.createElement('div');
            card.className = 'project-card reveal';
            card.style.transitionDelay = `${i * 0.08}s`;

            const techTags = Array.isArray(proj.tech_stack)
                ? proj.tech_stack.map(t => `<span class="tech-tag">${t}</span>`).join('')
                : '';

            let links = '';
            if (proj.github_url) links += `<a href="${proj.github_url}" target="_blank">GitHub ↗</a>`;
            if (proj.live_url)   links += `<a href="${proj.live_url}"   target="_blank">Live Demo ↗</a>`;

            card.innerHTML = `
                <h3>${proj.title}</h3>
                <div class="tech-stack">${techTags}</div>
                <p class="project-desc">${proj.description}</p>
                <div class="project-links">${links}</div>
            `;
            container.appendChild(card);
            revealObserver.observe(card);
        });
    } catch {
        container.innerHTML = `<p style="color:var(--danger-color)">⚠️ Could not load projects.</p>`;
    }
}

// ── Contact Form ──────────────────────────────────────────────────────────────
const contactForm   = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('contact-name').value;
    const email   = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    const submitBtn  = contactForm.querySelector('button[type="submit"]');
    const origText   = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled    = true;

    try {
        const res = await fetch(`${API_BASE}/contact/`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name, email, message }),
        });
        const data = await res.json();

        if (res.ok) {
            contactStatus.textContent = '✅ Message sent! I\'ll get back to you soon.';
            contactStatus.style.color = 'var(--success-color)';
            contactForm.reset();
        } else {
            throw new Error(data.message || 'Error');
        }
    } catch {
        contactStatus.textContent = '⚠️ Failed to send. Please try again.';
        contactStatus.style.color = 'var(--danger-color)';
    } finally {
        submitBtn.textContent = origText;
        submitBtn.disabled    = false;
    }
});

// ── Initialize ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    fetchHeroContent();
    fetchSkills();
    fetchProjects();
});
