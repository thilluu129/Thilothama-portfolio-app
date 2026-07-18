/**
 * V THILOTHAMA — Portfolio JavaScript
 * Handles dynamic data fetching, UI animations, filtering, and form submission
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
  
  // Set current year in footer
  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

/* ---- 1. CUSTOM CURSOR ---- */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  if (!dot || !ring) return;

  // Track mouse movement
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Dot follows instantly
    dot.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    
    // Ring follows with slight delay for smooth effect
    // We use a small timeout to let the browser paint, or just rely on CSS transition
    setTimeout(() => {
      ring.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    }, 40);
  });

  // Hover effects on clickable elements
  const clickables = document.querySelectorAll('a, button, input, textarea, select, .project-card');
  
  clickables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('hovered');
      dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('hovered');
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}

/* ---- 2. NAVBAR & MOBILE MENU ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  const navCta = document.getElementById('nav-hire-btn');
  const allNavLinks = document.querySelectorAll('.nav-link');
  
  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Active section tracking
    let current = '';
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    allNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === current) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Menu Toggle
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('open');
    if (navCta) navCta.classList.toggle('open');
  });

  // Close mobile menu on link click
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      if (navCta) navCta.classList.remove('open');
    });
  });
}

/* ---- 3. SCROLL REVEAL ANIMATIONS ---- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ---- 4. STATS COUNTER ANIMATION ---- */
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-num');
  
  const options = {
    threshold: 0.5
  };
  
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetNumber = parseInt(target.getAttribute('data-target'), 10);
        animateValue(target, 0, targetNumber, 2000);
        observer.unobserve(target);
      }
    });
  }, options);
  
  stats.forEach(stat => statsObserver.observe(stat));
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // easeOutQuart
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    
    obj.innerHTML = Math.floor(easeProgress * (end - start) + start) + (end === 100 ? '%' : '+');
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/* ---- 5. TYPEWRITER EFFECT ---- */
function initTypewriter() {
  const texts = [
    "beautiful web apps",
    "scalable APIs",
    "clean backend logic",
    "interactive UIs",
    "full-stack solutions"
  ];
  
  let count = 0;
  let index = 0;
  let currentText = "";
  let letter = "";
  let isDeleting = false;
  
  const textElement = document.getElementById("typewriter-text");
  if (!textElement) return;

  function type() {
    if (count === texts.length) {
      count = 0;
    }
    currentText = texts[count];

    if (isDeleting) {
      letter = currentText.slice(0, --index);
    } else {
      letter = currentText.slice(0, ++index);
    }

    textElement.textContent = letter;

    let typeSpeed = 100;
    
    if (isDeleting) {
      typeSpeed /= 2; // Delete faster
    }

    if (!isDeleting && letter.length === currentText.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && letter.length === 0) {
      isDeleting = false;
      count++;
      typeSpeed = 500; // Pause before new word
    }

    setTimeout(type, typeSpeed);
  }
  
  setTimeout(type, 1000);
}

/* ---- 6. FETCH & RENDER SKILLS ---- */
async function fetchSkills() {
  const loading = document.getElementById('skills-loading');
  const error = document.getElementById('skills-error');
  const grid = document.getElementById('skills-grid');
  
  try {
    const response = await fetch(`${API_BASE_URL}/skills/`);
    if (!response.ok) throw new Error('API Error');
    
    const skills = await response.json();
    
    // Group skills by category
    const grouped = {
      'language': { label: 'Languages', items: [] },
      'frontend': { label: 'Frontend', items: [] },
      'backend': { label: 'Backend', items: [] },
      'database': { label: 'Database', items: [] },
      'tools': { label: 'Tools & DevOps', items: [] }
    };
    
    skills.forEach(skill => {
      if (grouped[skill.category]) {
        grouped[skill.category].items.push(skill);
      }
    });
    
    // Render grouped skills
    let html = '';
    
    Object.keys(grouped).forEach(catKey => {
      const cat = grouped[catKey];
      if (cat.items.length === 0) return;
      
      html += `
        <div class="skill-category-block reveal-up">
          <h3 class="skill-category-label">${cat.label}</h3>
          <div class="skill-list">
      `;
      
      cat.items.forEach(skill => {
        html += `
            <div class="skill-item">
              <div class="skill-meta">
                <span class="skill-name">
                  <span class="skill-icon">${skill.icon}</span> ${skill.name}
                </span>
                <span class="skill-pct">${skill.level}%</span>
              </div>
              <div class="skill-bar-track">
                <div class="skill-bar-fill" data-width="${skill.level}%" style="width: 0%"></div>
              </div>
            </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    loading.classList.add('hidden');
    grid.innerHTML = html;
    grid.classList.remove('hidden');
    
    // Observe new skill bars to animate them
    const bars = document.querySelectorAll('.skill-bar-fill');
    const barObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.getAttribute('data-width');
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    bars.forEach(bar => barObserver.observe(bar));
    
    // Run reveal observer on new elements
    initScrollReveal();
    
  } catch (err) {
    console.error('Failed to fetch skills:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

/* ---- 7. FETCH & RENDER PROJECTS ---- */
let allProjects = [];

async function fetchProjects() {
  const loading = document.getElementById('projects-loading');
  const error = document.getElementById('projects-error');
  
  try {
    const response = await fetch(`${API_BASE_URL}/projects/`);
    if (!response.ok) throw new Error('API Error');
    
    allProjects = await response.json();
    
    loading.classList.add('hidden');
    renderProjects(allProjects);
    
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const empty = document.getElementById('projects-empty');
  
  grid.innerHTML = '';
  
  if (projects.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  
  grid.classList.remove('hidden');
  empty.classList.add('hidden');
  
  projects.forEach((proj, index) => {
    // Map category to styles
    const catMap = {
      'fullstack': { label: 'Full-Stack', class: 'cat-fullstack', icon: '⚡' },
      'frontend': { label: 'Frontend', class: 'cat-frontend', icon: '🎨' },
      'backend': { label: 'Backend', class: 'cat-backend', icon: '⚙️' },
      'data': { label: 'Data', class: 'cat-data', icon: '📊' },
      'game': { label: 'Game', class: 'cat-game', icon: '🎮' }
    };
    
    const cat = catMap[proj.category] || catMap['fullstack'];
    
    // Tech tags HTML
    const tagsHtml = Array.isArray(proj.tech_stack) 
      ? proj.tech_stack.slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('') 
      : '';
      
    const extraTagCount = Array.isArray(proj.tech_stack) && proj.tech_stack.length > 4 
      ? `<span class="tech-tag">+${proj.tech_stack.length - 4}</span>` 
      : '';

    // Links HTML
    let linksHtml = '';
    if (proj.github_url) {
      linksHtml += `
        <a href="${proj.github_url}" target="_blank" rel="noopener" class="card-link link-github" aria-label="GitHub repo" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          Code
        </a>
      `;
    }
    if (proj.live_url) {
      linksHtml += `
        <a href="${proj.live_url}" target="_blank" rel="noopener" class="card-link link-live" aria-label="Live Demo" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Live
        </a>
      `;
    }
    
    // Add Details button
    linksHtml += `<button class="card-link link-details" onclick="openProjectModal(${proj.id}); event.stopPropagation()">Details →</button>`;

    const card = document.createElement('div');
    card.className = `project-card ${proj.featured ? 'featured' : ''}`;
    // Stagger animation delay
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Allow clicking whole card to open modal
    card.onclick = () => openProjectModal(proj.id);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-icon-wrap">${cat.icon}</div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          ${proj.featured ? `<span class="card-featured-badge">★ Featured</span>` : ''}
          <span class="card-category ${cat.class}">${cat.label}</span>
        </div>
      </div>
      
      <h3 class="card-title">${proj.title}</h3>
      <p class="card-desc">${proj.description}</p>
      
      <div class="card-tech">
        ${tagsHtml}
        ${extraTagCount}
      </div>
      
      <div class="card-links">
        ${linksHtml}
      </div>
    `;
    
    grid.appendChild(card);
  });
}

function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-tab');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      
      // Filter projects
      const filter = btn.getAttribute('data-filter');
      
      if (filter === 'all') {
        renderProjects(allProjects);
      } else {
        const filtered = allProjects.filter(p => p.category === filter);
        renderProjects(filtered);
      }
    });
  });
}

/* ---- 8. PROJECT MODAL ---- */
function openProjectModal(id) {
  const proj = allProjects.find(p => p.id === id);
  if (!proj) return;
  
  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-project-content');
  
  const tagsHtml = Array.isArray(proj.tech_stack) 
      ? proj.tech_stack.map(t => `<span class="tech-tag">${t}</span>`).join('') 
      : '';
      
  let linksHtml = '';
  if (proj.github_url) {
    linksHtml += `
      <a href="${proj.github_url}" target="_blank" rel="noopener" class="btn btn-outline">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        View Source
      </a>
    `;
  }
  if (proj.live_url) {
    linksHtml += `
      <a href="${proj.live_url}" target="_blank" rel="noopener" class="btn btn-primary">
        Live Demo
      </a>
    `;
  }

  content.innerHTML = `
    <h2>${proj.title}</h2>
    
    <div class="modal-tech">
      ${tagsHtml}
    </div>
    
    <div class="modal-desc">
      ${proj.long_description ? proj.long_description.replace(/\n/g, '<br>') : proj.description}
    </div>
    
    <div class="modal-links">
      ${linksHtml}
    </div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  // Close handlers
  const closeBtn = document.getElementById('close-project-modal');
  closeBtn.onclick = closeProjectModal;
  
  modal.onclick = (e) => {
    if (e.target === modal) closeProjectModal();
  };
  
  document.addEventListener('keydown', handleEsc);
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEsc);
}

function handleEsc(e) {
  if (e.key === 'Escape') closeProjectModal();
}

/* ---- 9. CONTACT FORM ---- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const msgInput = document.getElementById('contact-message');
  const charCount = document.getElementById('char-count');
  
  if (!form || !msgInput || !charCount) return;
  
  // Character counter
  msgInput.addEventListener('input', () => {
    const len = msgInput.value.length;
    charCount.textContent = `${len} / 2000`;
    if (len >= 2000) charCount.style.color = 'var(--clr-danger)';
    else charCount.style.color = 'var(--clr-text-dim)';
  });
  
  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = document.getElementById('submit-btn-text');
    const feedback = document.getElementById('form-feedback');
    
    // Basic validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const formData = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      subject: document.getElementById('contact-subject').value,
      message: msgInput.value
    };
    
    // UI Loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    feedback.classList.add('hidden');
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast('Message sent successfully!', 'success');
        form.reset();
        charCount.textContent = '0 / 2000';
      } else {
        // Handle validation errors from API
        let errorMsg = 'Failed to send message. Please check the fields.';
        if (result.errors) {
          const firstErr = Object.values(result.errors)[0];
          if (Array.isArray(firstErr)) errorMsg = firstErr[0];
        }
        showToast(errorMsg, 'error');
      }
      
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Network error. Is the server running?', 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
    }
  });
}

/* ---- 10. TOAST NOTIFICATIONS ---- */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Icon based on type
  const icon = type === 'success' ? '✓ ' : '⚠️ ';
  toast.textContent = icon + message;
  
  container.appendChild(toast);
  
  // Remove after animation
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
