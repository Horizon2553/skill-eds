function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}

function getHireRequests() {
  try { return JSON.parse(localStorage.getItem('sb_hire_requests')) || []; } catch { return []; }
}

function openHireModal(freelancerName, freelancerId) {
  const existing = document.getElementById('pf-hire-modal');
  if (existing) existing.remove();

  const session = getSession();
  if (!session) { window.location.href = '/login'; return; }

  const modal = document.createElement('div');
  modal.id = 'pf-hire-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgb(0 0 0/55%);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:36px;width:100%;max-width:520px;position:relative;box-shadow:0 20px 60px rgb(0 0 0/18%)">
      <button id="pf-hire-close" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.5rem;color:#aaa;cursor:pointer">&times;</button>
      <h2 style="font-family:var(--heading-font-family);font-size:1.4rem;font-weight:800;color:#111;margin:0 0 4px;letter-spacing:-0.02em">Send Hire Request</h2>
      <p style="font-size:0.88rem;color:#888;margin:0 0 22px">to <strong style="color:#111">${freelancerName}</strong></p>
      <form id="pf-hire-form" novalidate>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Project / Job Title *</label>
          <input type="text" id="pf-hire-title" placeholder="e.g. Build React E-Commerce Frontend" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Description *</label>
          <textarea id="pf-hire-desc" rows="4" placeholder="Describe what you need..." style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none;resize:vertical" required></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Budget *</label>
            <input type="text" id="pf-hire-budget" placeholder="e.g. ₹25,000" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none" required>
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Timeline *</label>
            <input type="text" id="pf-hire-timeline" placeholder="e.g. 30 days" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none" required>
          </div>
        </div>
        <p id="pf-hire-err" style="color:#dc2626;font-size:0.83rem;min-height:1em;margin:0 0 8px"></p>
        <button type="submit" style="width:100%;padding:13px;background:#1dbf73;color:#fff;font-size:0.97rem;font-weight:700;border:none;border-radius:10px;cursor:pointer">Send Hire Request</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  document.getElementById('pf-hire-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.getElementById('pf-hire-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('pf-hire-title').value.trim();
    const desc = document.getElementById('pf-hire-desc').value.trim();
    const budget = document.getElementById('pf-hire-budget').value.trim();
    const timeline = document.getElementById('pf-hire-timeline').value.trim();
    const err = document.getElementById('pf-hire-err');
    if (!title || !desc || !budget) { err.textContent = 'Please fill all required fields.'; return; }

    const requests = getHireRequests();
    requests.push({
      id: `hire-${Date.now()}`,
      fromClientId: session.id,
      fromClientName: session.name,
      toFreelancerId: freelancerId,
      toFreelancerName: freelancerName,
      title,
      desc,
      budget,
      timeline,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('sb_hire_requests', JSON.stringify(requests));
    close();
    const btn = document.getElementById('pf-hire-btn');
    if (btn) { btn.textContent = 'Request Sent'; btn.disabled = true; btn.style.background = '#f0fdf7'; btn.style.color = '#1dbf73'; btn.style.border = '1.5px solid #1dbf73'; }
  });
}

// Map project titles → EDS project pages (so clicking always works)
const PROJECT_TITLE_TO_URL = {
  'devflow developer platform': '/projects/devflow',
  'promptkit canvas': '/projects/promptkit',
  'shoplens e-commerce ui': '/projects/shoplens',
  'atlas design system': '/projects/atlas-design',
  'novabrand identity kit': '/projects/novabrand',
  'pulse dashboard ui': '/projects/pulse-dashboard',
  'fintech edge dashboard': '/projects/fintech-edge',
  'cloudcart api gateway': '/projects/cloudcart',
  'tasksphere saas mockup': '/projects/tasksphere',
  'orbit portfolio builder': '/projects/orbit-builder',
};

function getProjectUrl(title, fallbackLink) {
  const key = title?.toLowerCase().trim();
  return PROJECT_TITLE_TO_URL[key] || (fallbackLink && !fallbackLink.includes('vscode-') && fallbackLink !== '#' ? fallbackLink : null);
}

function extractImage(cell) {
  if (!cell) return null;
  const existing = cell.querySelector('picture, img');
  if (existing) return existing.cloneNode(true);
  // Accept a hyperlink whose href points to an image
  const link = cell.querySelector('a');
  const href = link?.href || '';
  const src = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(href) ? href : cell.textContent.trim();
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(src)) {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    return img;
  }
  return null;
}

const ICONS = {
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  arrow: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
};

function rowLabel(row) {
  return row.children[0]?.textContent.trim().toLowerCase() || '';
}

export default async function decorate(block) {
  const rows = [...block.children];
  let hero = null;
  let about = '';
  let skills = [];
  let contact = { email: '', linkedin: '', github: '' };
  const projects = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const label = rowLabel(row);

    if (label === 'hero') {
      hero = {
        avatarEl: extractImage(cells[1]),
        name: cells[2]?.textContent.trim() || '',
        role: cells[3]?.textContent.trim() || '',
        availability: cells[4]?.textContent.trim() || 'Available',
        rating: cells[5]?.textContent.trim() || '',
        reviews: cells[6]?.textContent.trim() || '',
      };
    } else if (label === 'about') {
      about = cells[1]?.textContent.trim() || '';
    } else if (label === 'skills') {
      skills = (cells[1]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean);
    } else if (label === 'contact') {
      contact = {
        email: cells[1]?.textContent.trim() || '',
        linkedin: cells[2]?.querySelector('a')?.href || '',
        github: cells[3]?.querySelector('a')?.href || '',
      };
    } else if (label === 'project') {
      projects.push({
        title: cells[1]?.textContent.trim() || '',
        thumbEl: extractImage(cells[2]),
        desc: cells[3]?.textContent.trim() || '',
        tech: (cells[4]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean),
        link: cells[5]?.querySelector('a')?.href || '',
      });
    }
  });

  if (!hero) return;

  const isAvailable = hero.availability.toLowerCase() === 'available';
  const session = getSession();
  const isClient = session?.role === 'client';
  const freelancerId = window.location.pathname.split('/').pop();

  block.innerHTML = `
    <div class="pf-hero">
      <div class="pf-hero-left">
        <div class="pf-avatar-wrap"></div>
        <div class="pf-hero-info">
          <span class="pf-badge ${isAvailable ? 'pf-badge-available' : 'pf-badge-other'}">${hero.availability}</span>
          <h1 class="pf-name">${hero.name}</h1>
          <div class="pf-role">${hero.role}</div>
          ${hero.rating ? `
            <div class="pf-rating-row">
              ${ICONS.star}
              <strong>${hero.rating}</strong>
              ${hero.reviews ? `<span class="pf-review-count">(${hero.reviews} review${hero.reviews === '1' ? '' : 's'})</span>` : ''}
            </div>
          ` : ''}
        </div>
        ${isClient ? `
          <button id="pf-hire-btn" class="pf-hire-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Hire ${hero.name.split(' ')[0]}
          </button>
        ` : !session ? `
          <a href="/login" class="pf-hire-cta">Log in to Hire</a>
        ` : ''}
      </div>
    </div>

    <div class="pf-grid">
      <aside class="pf-sidebar">
        <div class="pf-card">
          <h2>About Me</h2>
          <p class="pf-about-text">${about}</p>
        </div>
        ${skills.length ? `
          <div class="pf-card">
            <h2>Technical Skills</h2>
            <div class="pf-skills-tags">
              ${skills.map((s) => `<span class="pf-skill-tag">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${(contact.email || contact.linkedin || contact.github) ? `
          <div class="pf-card">
            <h2>Contact Details</h2>
            <ul class="pf-contact-list">
              ${contact.email ? `<li class="pf-contact-item"><span class="pf-contact-label">Email</span><a href="mailto:${contact.email}" class="pf-contact-link">${contact.email}</a></li>` : ''}
              ${contact.linkedin ? `<li class="pf-contact-item"><span class="pf-contact-label">LinkedIn</span><a href="${contact.linkedin}" target="_blank" rel="noopener" class="pf-contact-link">View LinkedIn Profile</a></li>` : ''}
              ${contact.github ? `<li class="pf-contact-item"><span class="pf-contact-label">GitHub</span><a href="${contact.github}" target="_blank" rel="noopener" class="pf-contact-link">View GitHub Profile</a></li>` : ''}
            </ul>
          </div>
        ` : ''}
      </aside>

      <div class="pf-main">
        <h2>Projects &amp; Work <span class="pf-project-count">${projects.length} total</span></h2>
        <div class="pf-projects-list">
          ${projects.length === 0 ? '<p class="pf-no-projects">No projects yet.</p>' : projects.map((p) => `
            <a href="${getProjectUrl(p.title, p.link) || '#'}" class="pf-project-card" ${!getProjectUrl(p.title, p.link) ? 'onclick="return false;"' : ''}>
              <div class="pf-project-thumb"></div>
              <div class="pf-project-info">
                ${p.tech.length ? `<div class="pf-project-tags">${p.tech.map((t) => `<span class="pf-tech-tag">${t}</span>`).join('')}</div>` : ''}
                <h3>${p.title}</h3>
                <p class="pf-project-desc">${p.desc}</p>
                <div class="pf-view-details">View details ${ICONS.arrow}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const avatarWrap = block.querySelector('.pf-avatar-wrap');
  if (hero.avatarEl) {
    hero.avatarEl.classList.add('pf-avatar');
    avatarWrap.append(hero.avatarEl);
  }

  const thumbEls = block.querySelectorAll('.pf-project-thumb');
  thumbEls.forEach((thumb, i) => {
    if (projects[i]?.thumbEl) thumb.append(projects[i].thumbEl);
  });

  // Wire hire button
  block.querySelector('#pf-hire-btn')?.addEventListener('click', () => {
    openHireModal(hero.name, freelancerId);
  });
}
