const API_BASE = 'http://127.0.0.1:8000/api';

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

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll Reveal Observer
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// Fetch and Render Skills
async function fetchSkills() {
    const container = document.getElementById('skills-container');
    try {
        const response = await fetch(`${API_BASE}/skills/`);
        if (!response.ok) throw new Error('Failed to load skills');
        const skills = await response.json();
        
        container.innerHTML = '';
        skills.forEach((skill, index) => {
            const card = document.createElement('div');
            card.className = 'skill-card reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <h3>${skill.icon || '⚡'} ${skill.name}</h3>
                <div class="skill-info">
                    <span>${skill.category.toUpperCase()}</span>
                    <span>${skill.level}%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                </div>
            `;
            container.appendChild(card);
            revealObserver.observe(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="color: var(--danger-color);">⚠️ Could not load skills from API. Is Django running?</p>`;
    }
}

// Fetch and Render Projects
async function fetchProjects() {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch(`${API_BASE}/projects/`);
        if (!response.ok) throw new Error('Failed to load projects');
        const projects = await response.json();
        
        container.innerHTML = '';
        projects.forEach((proj, index) => {
            const card = document.createElement('div');
            card.className = 'project-card reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            
            const techTags = Array.isArray(proj.tech_stack) 
                ? proj.tech_stack.map(t => `<span class="tech-tag">${t}</span>`).join('') 
                : '';
                
            let linksHtml = '';
            if (proj.github_url) linksHtml += `<a href="${proj.github_url}" target="_blank">GitHub ↗</a>`;
            if (proj.live_url) linksHtml += `<a href="${proj.live_url}" target="_blank">Live Demo ↗</a>`;

            card.innerHTML = `
                <h3>${proj.title}</h3>
                <div class="tech-stack">${techTags}</div>
                <p class="project-desc">${proj.description}</p>
                <div class="project-links">${linksHtml}</div>
            `;
            container.appendChild(card);
            revealObserver.observe(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="color: var(--danger-color);">⚠️ Could not load projects from API.</p>`;
    }
}

// Handle Contact Form
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/contact/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            contactStatus.textContent = 'Message sent successfully! I will get back to you soon.';
            contactStatus.style.color = 'var(--success-color)';
            contactForm.reset();
        } else {
            throw new Error(data.message || 'Error sending message');
        }
    } catch (error) {
        console.error(error);
        contactStatus.textContent = '⚠️ Failed to send message. Please try again.';
        contactStatus.style.color = 'var(--danger-color)';
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSkills();
    fetchProjects();
});
