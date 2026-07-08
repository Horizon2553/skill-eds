function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function setSession(s) { localStorage.setItem('skillbridge_auth', JSON.stringify(s)); }
function getAllUsers() {
  try { return JSON.parse(localStorage.getItem('sb_users_v1')) || []; } catch { return []; }
}
function getHireRequests() {
  try { return JSON.parse(localStorage.getItem('sb_hire_requests')) || []; } catch { return []; }
}

const ICONS = {
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  arrow: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
};

const SVG = {
  photo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  about: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  skills: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  contact: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  projects: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
};

// Map project titles → EDS project pages (title is the source of truth, ignores da.live link)
const PROJECT_TITLE_TO_URL = {
  // Candidate portfolio projects
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
  // Showcase / featured work projects
  'spectra — analytics dashboard': '/projects/spectra',
  'spectra': '/projects/spectra',
  'aatma — brand identity': '/projects/aatma',
  'aatma': '/projects/aatma',
  'plate — food delivery app': '/projects/plate',
  'plate': '/projects/plate',
  // Rahul showcase
  'pix — creative portfolio template': '/projects/pix',
  'pix': '/projects/pix',
  'mapsi — location intelligence ui': '/projects/mapsi',
  'mapsi': '/projects/mapsi',
  // Aditi showcase
  'matcha — e-commerce ui kit': '/projects/matcha',
  'matcha': '/projects/matcha',
  'personal branding shoot': '/projects/personal-branding',
  'personal branding shoot — visuals': '/projects/personal-branding',
  // Aman showcase
  'steer — project management': '/projects/steer',
  'steer': '/projects/steer',
  'port — developer portfolio site': '/projects/port',
  'port': '/projects/port',
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

function rowLabel(row) {
  return row.children[0]?.textContent.trim().toLowerCase() || '';
}

// ── CMS-authored candidate page: "Hire" modal ──
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

// ── localStorage-driven "My Profile" (self-serve edit + public view) ──
function showInviteSentModal(freelancerName) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgb(0 0 0/55%);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:48px 40px;max-width:500px;width:100%;text-align:center;box-shadow:0 20px 60px rgb(0 0 0/18%)">
      <div style="width:64px;height:64px;background:#f0fdf7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style="font-family:var(--heading-font-family);font-size:1.4rem;font-weight:800;color:#111;margin:0 0 14px">Invite Sent!</h2>
      <p style="font-size:0.92rem;color:#555;line-height:1.7;margin:0 0 10px">
        <strong>${freelancerName}</strong> has been notified. The invite will appear in their dashboard under <strong>Invites Received</strong> — it is private and not listed publicly.
      </p>
      <p style="font-size:0.88rem;color:#888;margin:0 0 28px">
        You'll be notified in your <strong>Responses</strong> tab when they Accept, Counter, or Reject.
      </p>
      <button id="mp-invite-done" style="padding:13px 40px;background:#1dbf73;color:#fff;border:none;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:pointer">Done</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  document.getElementById('mp-invite-done').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function openHireModalForUser(user) {
  const existing = document.getElementById('mp-hire-modal');
  if (existing) existing.remove();
  const session = getSession();
  if (!session) { window.location.href = '/login'; return; }

  const modal = document.createElement('div');
  modal.id = 'mp-hire-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgb(0 0 0/55%);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:36px;width:100%;max-width:520px;position:relative;box-shadow:0 20px 60px rgb(0 0 0/18%)">
      <button id="mp-hire-close" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.5rem;color:#aaa;cursor:pointer">&times;</button>
      <h2 style="font-family:var(--heading-font-family);font-size:1.4rem;font-weight:800;color:#111;margin:0 0 4px;letter-spacing:-0.02em">Send Hire Invite</h2>
      <p style="font-size:0.88rem;color:#888;margin:0 0 22px">to <strong style="color:#111">${user.name}</strong></p>
      <form id="mp-hire-form" novalidate>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Project / Job Title *</label>
          <input type="text" id="mp-hire-title" placeholder="e.g. Build React E-Commerce Frontend" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none;font-family:var(--body-font-family)" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Description *</label>
          <textarea id="mp-hire-desc" rows="3" placeholder="Describe what you need..." style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none;resize:vertical;font-family:var(--body-font-family)" required></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Budget *</label>
            <input type="text" id="mp-hire-budget" placeholder="e.g. ₹25,000" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none;font-family:var(--body-font-family)" required>
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Timeline *</label>
            <input type="text" id="mp-hire-timeline" placeholder="e.g. 2 weeks" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none;font-family:var(--body-font-family)" required>
          </div>
        </div>
        <p id="mp-hire-err" style="color:#dc2626;font-size:0.83rem;min-height:1em;margin:0 0 8px"></p>
        <button type="submit" style="width:100%;padding:13px;background:#1dbf73;color:#fff;font-size:0.97rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;font-family:var(--body-font-family)">Send Invite</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  document.getElementById('mp-hire-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.getElementById('mp-hire-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('mp-hire-title').value.trim();
    const desc = document.getElementById('mp-hire-desc').value.trim();
    const budget = document.getElementById('mp-hire-budget').value.trim();
    const timeline = document.getElementById('mp-hire-timeline').value.trim();
    const err = document.getElementById('mp-hire-err');
    if (!title || !desc || !budget) { err.textContent = 'Please fill all required fields.'; return; }
    const requests = JSON.parse(localStorage.getItem('sb_hire_requests') || '[]');
    requests.push({
      id: `hire-${Date.now()}`,
      fromClientId: session.id,
      fromClientName: session.name,
      toFreelancerId: user.id,
      toFreelancerName: user.name,
      toFreelancerEmail: user.email || '',
      toFreelancerLinkedin: user.links?.linkedin || '',
      freelancerRole: user.skill || 'Freelancer',
      skills: Array.isArray(user.skills) ? user.skills.slice(0, 4) : [],
      title, desc, budget, timeline,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('sb_hire_requests', JSON.stringify(requests));
    close();
    showInviteSentModal(user.name);
  });
}

function renderPublicView(block, user) {
  const viewer = getSession();
  const isClient = viewer?.role === 'client' && viewer?.id !== user.id;

  const avatar = user.avatar
    ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<div style="width:100%;height:100%;border-radius:50%;background:#1dbf73;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:800">${user.name?.charAt(0).toUpperCase()}</div>`;

  block.innerHTML = `
    <div class="mp-view">
      <div class="mp-hero">
        <div class="mp-hero-left">
          <div class="mp-avatar">${avatar}</div>
          <div class="mp-hero-info">
            <span class="mp-badge">Available</span>
            <h1 class="mp-name">${user.name}</h1>
            <div class="mp-role">${user.skill || 'Freelancer'}</div>
            ${user.hourlyRate ? `<div class="mp-rate">₹${user.hourlyRate}/hr</div>` : ''}
          </div>
        </div>
        ${isClient ? `
          <div class="mp-cta-group">
            <button class="mp-fav-cta" id="mp-fav-cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Save to Favourites
            </button>
            <button class="mp-contact-cta" id="mp-contact-cta">Contact Candidate</button>
            <button class="mp-hire-cta" id="mp-hire-cta">Hire Candidate</button>
          </div>` : ''}
      </div>
      <div class="mp-grid">
        <aside class="mp-sidebar">
          ${user.bio ? `<div class="mp-card"><h2>About Me</h2><p>${user.bio}</p></div>` : ''}
          ${user.skills?.length ? `
            <div class="mp-card">
              <h2>Technical Skills</h2>
              <div class="mp-skills">${user.skills.map((s) => `<span class="mp-skill">${s}</span>`).join('')}</div>
            </div>
          ` : ''}
          ${(user.email || user.links?.linkedin) ? `
            <div class="mp-card">
              <h2>Contact Details</h2>
              <ul class="mp-contact-list">
                ${user.email ? `<li><span class="mp-contact-label">Email</span><a href="mailto:${user.email}" class="mp-contact-link">${user.email}</a></li>` : ''}
                ${user.links?.linkedin ? `<li><span class="mp-contact-label">LinkedIn</span><a href="${user.links.linkedin}" target="_blank" class="mp-contact-link">View Profile</a></li>` : ''}
                ${user.links?.github ? `<li><span class="mp-contact-label">GitHub</span><a href="${user.links.github}" target="_blank" class="mp-contact-link">View Profile</a></li>` : ''}
              </ul>
            </div>
          ` : ''}
        </aside>
        <div class="mp-main">
          <h2>Projects &amp; Work <span class="mp-proj-count">${(user.projects || []).length} total</span></h2>
          ${(!user.projects || user.projects.length === 0) ? '<p style="color:#999">No projects yet.</p>' : `
            <div class="mp-proj-grid">
              ${user.projects.map((p, i) => `
                <a href="/project-detail?uid=${encodeURIComponent(user.id)}&pid=${encodeURIComponent(p.id || i)}" class="mp-proj-card">
                  ${p.images?.[0] ? `<div class="mp-proj-thumb"><img src="${p.images[0]}" alt="${p.name}"></div>` : ''}
                  <div class="mp-proj-info">
                    ${p.tags?.length ? `<div class="mp-proj-tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>` : ''}
                    <h3>${p.name}</h3>
                    <p>${p.desc || ''}</p>
                    <div class="mp-proj-view">View details ${ICONS.arrow}</div>
                  </div>
                </a>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  if (isClient) {
    // Save to Favourites
    const favBtn = block.querySelector('#mp-fav-cta');
    const favKey = `sb_fav_${viewer.id}`;
    const getFavs = () => { try { return JSON.parse(localStorage.getItem(favKey)) || []; } catch { return []; } };
    const isFaved = getFavs().includes(user.id);
    if (isFaved) { favBtn.textContent = '★ Saved'; favBtn.style.borderColor = '#1dbf73'; favBtn.style.color = '#1dbf73'; }
    favBtn?.addEventListener('click', () => {
      const favs = getFavs();
      const idx = favs.indexOf(user.id);
      if (idx > -1) { favs.splice(idx, 1); favBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Save to Favourites`; favBtn.style.color = '#555'; favBtn.style.borderColor = '#d0d0d0'; }
      else { favs.push(user.id); favBtn.textContent = '★ Saved'; favBtn.style.borderColor = '#1dbf73'; favBtn.style.color = '#1dbf73'; }
      localStorage.setItem(favKey, JSON.stringify(favs));
    });

    // Contact Candidate
    block.querySelector('#mp-contact-cta')?.addEventListener('click', () => {
      const cm = document.createElement('div');
      cm.id = 'mp-contact-modal';
      cm.style.cssText = 'position:fixed;inset:0;background:rgb(0 0 0/55%);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
      cm.innerHTML = `<div style="background:#fff;border-radius:16px;padding:36px;max-width:400px;width:100%;text-align:center;position:relative">
        <button id="mp-contact-close" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.4rem;color:#aaa;cursor:pointer;line-height:1">&times;</button>
        <h3 style="margin:0 0 16px;font-size:1.1rem;font-weight:800">Contact ${user.name}</h3>
        ${user.email ? `<p style="margin:0 0 10px;font-size:0.9rem"><a href="mailto:${user.email}" style="color:#1dbf73">${user.email}</a></p>` : ''}
        ${user.links?.linkedin ? `<p style="margin:0;font-size:0.9rem"><a href="${user.links.linkedin}" target="_blank" style="color:#1dbf73">LinkedIn Profile →</a></p>` : ''}
        ${!user.email && !user.links?.linkedin ? `<p style="color:#888;font-size:0.9rem">No contact details provided yet.</p>` : ''}
      </div>`;
      document.body.appendChild(cm);
      document.body.style.overflow = 'hidden';
      const closeContact = () => { cm.remove(); document.body.style.overflow = ''; };
      document.getElementById('mp-contact-close').addEventListener('click', closeContact);
      cm.addEventListener('click', (e) => { if (e.target === cm) closeContact(); });
    });

    // Hire Candidate
    block.querySelector('#mp-hire-cta')?.addEventListener('click', () => openHireModalForUser(user));
  }
}

// ── First-time setup wizard (runs instead of the edit view until
//    session.profileComplete is true — merged in from the old
//    profile-setup block, which redirected here once finished) ──
const WIZARD_FREELANCER_STEPS = [
  {
    id: 'bio', title: 'About You',
    desc: 'Write a short bio to help clients understand who you are.',
    label: 'Bio / About', required: true, type: 'textarea',
    placeholder: "I'm a frontend developer with 3+ years of experience building React apps...",
  },
  {
    id: 'skills', title: 'Your Skills',
    desc: 'Add at least one skill so clients can find you.',
    label: 'Skills', required: true, type: 'tags',
    placeholder: 'e.g. React, Node.js, Python...',
  },
  {
    id: 'rate', title: 'Your Hourly Rate',
    desc: 'Set a starting rate. You can negotiate project-by-project.',
    label: 'Hourly Rate (₹/hr)', required: true, type: 'number',
    placeholder: '500',
  },
  {
    id: 'links', title: 'Professional Links',
    desc: 'LinkedIn is required so clients can verify your identity.',
    required: true, type: 'links',
  },
  {
    id: 'photo', title: 'Upload Your Profile Photo',
    desc: 'A real photo builds trust. This is required to complete your profile.',
    required: false, type: 'photo',
  },
];

const WIZARD_CLIENT_STEPS = [
  {
    id: 'company', title: 'Your Company',
    desc: 'Tell freelancers a bit about who you are.',
    label: 'Company / Organization', required: false, type: 'text',
    placeholder: 'e.g. Acme Corp, Solo Founder, Startup...',
  },
  {
    id: 'needs', title: 'What do you need?',
    desc: 'Describe the type of projects you usually post.',
    label: 'Project Needs', required: true, type: 'textarea',
    placeholder: 'e.g. We build SaaS products and need frontend developers...',
  },
  {
    id: 'budget', title: 'Typical Budget',
    desc: 'What is your usual project budget range?',
    label: 'Budget Range', required: false, type: 'select',
    options: ['₹5,000 – ₹15,000', '₹15,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+', 'Varies per project'],
  },
  {
    id: 'website', title: 'Your Website',
    desc: 'Optional, but helps freelancers understand your business.',
    label: 'Website URL (optional)', required: false, type: 'text',
    placeholder: 'https://yourcompany.com',
  },
  {
    id: 'photo', title: 'Company Logo / Photo',
    desc: 'Optional — helps build trust with freelancers.',
    required: false, type: 'photo',
  },
];

function wizardCircularProgress(pct) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return `
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="#e8e8e8" stroke-width="5"/>
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="#1dbf73" stroke-width="5"
        stroke-dasharray="${dash} ${circ - dash}"
        stroke-dashoffset="${circ / 4}" stroke-linecap="round"
        style="transition:stroke-dasharray 0.4s ease"/>
      <text x="32" y="37" text-anchor="middle" font-size="13" font-weight="700" fill="${pct === 100 ? '#1dbf73' : '#111'}">${pct}%</text>
    </svg>
  `;
}

function renderWizard(block, session) {
  const isClient = session.role === 'client';
  const steps = isClient ? WIZARD_CLIENT_STEPS : WIZARD_FREELANCER_STEPS;
  const data = {};
  let currentStep = 0;
  let tags = [];

  function render() {
    const pct = Math.round((currentStep / steps.length) * 100);
    const remaining = steps.length - currentStep;
    const step = steps[currentStep];
    const isDone = currentStep >= steps.length;

    if (isDone) {
      const firstName = session.name.split(' ')[0];
      block.innerHTML = `
        <div class="ps-container">
          <div class="ps-progress-bar">
            ${wizardCircularProgress(100)}
            <div class="ps-progress-text">
              <div class="ps-progress-title">Profile complete!</div>
              <div class="ps-progress-sub">You're all set!</div>
            </div>
          </div>
          <div class="ps-step-card ps-done-card">
            <div class="ps-done-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>You're all set, ${firstName}!</h2>
            <p>${isClient ? 'Start posting projects and find the right talent.' : 'Your profile is ready. Start exploring SkillHire and make your first move.'}</p>
            <div class="ps-done-btns">
              <a href="/browse-projects" class="ps-btn-primary">${isClient ? 'Post a Project' : 'Find Work'}</a>
              <a href="/dashboard" class="ps-btn-secondary">Go to Dashboard</a>
            </div>
          </div>
          <div class="ps-dots">${steps.map(() => '<div class="ps-dot done"></div>').join('')}</div>
        </div>
      `;
      return;
    }

    block.innerHTML = `
      <div class="ps-container">
        <div class="ps-progress-bar">
          ${wizardCircularProgress(pct)}
          <div class="ps-progress-text">
            <div class="ps-progress-title">${pct === 100 ? 'Profile complete!' : 'Complete your profile'}</div>
            <div class="ps-progress-sub">${remaining} step${remaining !== 1 ? 's' : ''} remaining</div>
          </div>
        </div>

        <div class="ps-step-card">
          <div class="ps-step-num">Step ${currentStep + 1} of ${steps.length}</div>
          <h2 class="ps-step-title">${step.title}</h2>
          <p class="ps-step-desc">${step.desc}</p>

          ${renderField(step)}

          <p class="ps-err" id="ps-err"></p>

          <div class="ps-btns">
            ${currentStep > 0 ? '<button class="ps-btn-back" id="ps-back">← Back</button>' : '<div></div>'}
            <button class="ps-btn-continue" id="ps-continue">Continue</button>
          </div>
        </div>

        <div class="ps-dots">
          ${steps.map((_, i) => `<div class="ps-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>`).join('')}
        </div>
      </div>
    `;

    if (step.type === 'tags') initTagInput(step);
    if (step.type === 'photo') initPhotoUpload();
    if (data[step.id]) prefillField(step);

    block.querySelector('#ps-continue')?.addEventListener('click', advance);
    block.querySelector('#ps-back')?.addEventListener('click', () => { currentStep--; render(); });
    block.querySelector('#ps-step-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') advance(); });
  }

  function renderField(step) {
    if (step.type === 'textarea') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label} ${step.required ? '<span class="ps-req">*</span>' : ''}</label>
          <textarea id="ps-step-input" rows="5" placeholder="${step.placeholder || ''}"></textarea>
        </div>
      `;
    }
    if (step.type === 'text' || step.type === 'number') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label} ${step.required ? '<span class="ps-req">*</span>' : ''}</label>
          <input type="${step.type === 'number' ? 'number' : 'text'}" id="ps-step-input" placeholder="${step.placeholder || ''}">
        </div>
      `;
    }
    if (step.type === 'select') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label}</label>
          <select id="ps-step-input">
            ${step.options.map((o) => `<option value="${o}">${o}</option>`).join('')}
          </select>
        </div>
      `;
    }
    if (step.type === 'tags') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label} ${step.required ? '<span class="ps-req">*</span>' : ''} <span class="ps-hint">(press Enter or comma to add)</span></label>
          <div class="ps-tag-input-wrap" id="ps-tag-wrap">
            <input type="text" id="ps-tag-inp" placeholder="${step.placeholder || ''}">
          </div>
        </div>
      `;
    }
    if (step.type === 'links') {
      return `
        <div class="ps-field">
          <label class="ps-label">LinkedIn Profile URL <span class="ps-req">*</span></label>
          <input type="url" id="ps-linkedin" placeholder="https://linkedin.com/in/yourname">
        </div>
        <div class="ps-field" style="margin-top:14px">
          <label class="ps-label">GitHub Profile URL <span class="ps-opt">(optional)</span></label>
          <input type="url" id="ps-github" placeholder="https://github.com/yourname">
        </div>
      `;
    }
    if (step.type === 'photo') {
      return `
        <div class="ps-photo-wrap">
          <div class="ps-photo-circle" id="ps-photo-preview">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Click or drag<br>photo here</span>
          </div>
          <input type="file" id="ps-photo-inp" accept="image/*" style="display:none">
          <button type="button" class="ps-choose-photo" id="ps-photo-btn">⬆ Choose Photo</button>
          <p class="ps-photo-hint">JPG, PNG or WEBP · Max 4MB</p>
        </div>
      `;
    }
    return '';
  }

  function prefillField(step) {
    const val = data[step.id];
    if (!val) return;
    if (step.type === 'text' || step.type === 'number' || step.type === 'textarea') {
      const inp = block.querySelector('#ps-step-input');
      if (inp) inp.value = val;
    }
    if (step.type === 'tags' && Array.isArray(val)) {
      tags = [...val];
      renderTags();
    }
    if (step.type === 'links') {
      if (block.querySelector('#ps-linkedin')) block.querySelector('#ps-linkedin').value = val.linkedin || '';
      if (block.querySelector('#ps-github')) block.querySelector('#ps-github').value = val.github || '';
    }
  }

  function renderTags() {
    const wrap = block.querySelector('#ps-tag-wrap');
    const inp = block.querySelector('#ps-tag-inp');
    if (!wrap || !inp) return;
    wrap.querySelectorAll('.ps-tag').forEach((t) => t.remove());
    tags.forEach((t) => {
      const pill = document.createElement('span');
      pill.className = 'ps-tag';
      pill.innerHTML = `${t} <button type="button" data-tag="${t}">×</button>`;
      pill.querySelector('button').addEventListener('click', () => {
        tags = tags.filter((x) => x !== t);
        renderTags();
      });
      wrap.insertBefore(pill, inp);
    });
  }

  function initTagInput(step) {
    tags = Array.isArray(data[step.id]) ? [...data[step.id]] : [];
    renderTags();
    const inp = block.querySelector('#ps-tag-inp');
    inp?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const v = inp.value.replace(',', '').trim();
        if (v && !tags.includes(v)) { tags.push(v); renderTags(); }
        inp.value = '';
      }
    });
    block.querySelector('#ps-tag-wrap')?.addEventListener('click', () => inp?.focus());
  }

  function initPhotoUpload() {
    const btn = block.querySelector('#ps-photo-btn');
    const inp = block.querySelector('#ps-photo-inp');
    const preview = block.querySelector('#ps-photo-preview');
    btn?.addEventListener('click', () => inp?.click());
    preview?.addEventListener('click', () => inp?.click());
    inp?.addEventListener('change', () => {
      const file = inp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 320;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          data.photo = compressed;
          preview.innerHTML = `<img src="${compressed}" alt="Profile photo">`;
          preview.classList.add('has-photo');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function advance() {
    const step = steps[currentStep];
    const err = block.querySelector('#ps-err');
    if (err) err.textContent = '';

    if (step.type === 'textarea' || step.type === 'text' || step.type === 'number') {
      const val = block.querySelector('#ps-step-input')?.value.trim();
      if (step.required && !val) { if (err) err.textContent = 'This field is required.'; return; }
      data[step.id] = val;
    } else if (step.type === 'tags') {
      const inpVal = block.querySelector('#ps-tag-inp')?.value.trim();
      if (inpVal && !tags.includes(inpVal)) tags.push(inpVal);
      if (step.required && tags.length === 0) { if (err) err.textContent = 'Add at least one skill.'; return; }
      data[step.id] = tags;
    } else if (step.type === 'links') {
      const linkedin = block.querySelector('#ps-linkedin')?.value.trim();
      const github = block.querySelector('#ps-github')?.value.trim();
      if (step.required && !linkedin) { if (err) err.textContent = 'LinkedIn URL is required.'; return; }
      data[step.id] = { linkedin, github };
    } else if (step.type === 'select') {
      data[step.id] = block.querySelector('#ps-step-input')?.value;
    }
    // photo is optional and already captured in data.photo by the file reader

    currentStep++;

    if (currentStep >= steps.length) {
      const updated = {
        ...session,
        bio: data.bio || data.needs || '',
        skills: data.skills || [],
        hourlyRate: data.rate || '',
        links: data.links || {},
        company: data.company || '',
        avatar: data.photo || '',
        profileComplete: true,
      };
      setSession(updated);
      // Also persist to sb_users_v1 so data survives re-login
      try {
        const users = getAllUsers();
        const idx = users.findIndex((u) => u.id === updated.id || u.email === updated.email);
        if (idx > -1) users[idx] = { ...users[idx], ...updated };
        else users.push(updated);
        localStorage.setItem('sb_users_v1', JSON.stringify(users));
      } catch (e) { /* quota exceeded — avatar too large */ }
    }

    render();
  }

  render();
}

function renderEditView(block, session) {
  const projects = session.projects || [];
  const skills = session.skills || [];
  const links = session.links || {};

  const avatar = session.avatar
    ? `<img src="${session.avatar}" alt="profile" id="mp-avatar-img" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<div id="mp-avatar-placeholder" style="width:100%;height:100%;border-radius:50%;background:#1dbf73;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:800">${session.name?.charAt(0).toUpperCase()}</div>`;

  block.innerHTML = `
    <div class="mp-edit">
      <div class="mp-edit-hero">
        <h1>Edit Your Profile</h1>
        <p>Keep your profile up to date so clients find you.</p>
      </div>

      <div class="mp-edit-section">
        <h3>${SVG.photo} Profile Photo</h3>
        <div class="mp-photo-row">
          <div class="mp-edit-avatar">${avatar}</div>
          <div>
            <input type="file" id="mp-photo-input" accept="image/*" style="display:none">
            <button type="button" class="mp-btn-outline" id="mp-change-photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Change Photo
            </button>
            <p class="mp-hint">JPG, PNG or WEBP · Max 4MB</p>
          </div>
        </div>
      </div>

      <div class="mp-edit-section">
        <h3>${SVG.about} About Me</h3>
        <div class="mp-form-row">
          <div class="mp-field">
            <label>Full Name</label>
            <input type="text" id="mp-name" value="${session.name || ''}">
          </div>
          <div class="mp-field">
            <label>Role / Title</label>
            <input type="text" id="mp-role" value="${session.skill || ''}">
          </div>
        </div>
        <div class="mp-field">
          <label>Hourly Rate (₹)</label>
          <input type="number" id="mp-rate" value="${session.hourlyRate || '500'}">
        </div>
        <div class="mp-field">
          <label>Bio</label>
          <textarea id="mp-bio" rows="4">${session.bio || ''}</textarea>
        </div>
      </div>

      <div class="mp-edit-section">
        <h3>${SVG.skills} Technical Skills</h3>
        <div class="mp-skills-edit" id="mp-skills-wrap">
          ${skills.map((s) => `<span class="mp-skill-pill">${s}<button type="button" data-skill="${s}">×</button></span>`).join('')}
        </div>
        <div class="mp-skill-add-row">
          <input type="text" id="mp-skill-inp" placeholder="Add a skill (e.g. React, Python, Figma...)">
          <button type="button" class="mp-btn-green" id="mp-skill-add">Add</button>
        </div>
      </div>

      <div class="mp-edit-section">
        <h3>${SVG.contact} Contact Info</h3>
        <div class="mp-field">
          <label>Email</label>
          <input type="email" id="mp-email" value="${session.email || ''}">
        </div>
        <div class="mp-form-row">
          <div class="mp-field">
            <label>LinkedIn URL</label>
            <input type="url" id="mp-linkedin" placeholder="https://linkedin.com/in/..." value="${links.linkedin || ''}">
          </div>
          <div class="mp-field">
            <label>GitHub URL</label>
            <input type="url" id="mp-github" placeholder="https://github.com/..." value="${links.github || ''}">
          </div>
        </div>
      </div>

      <div class="mp-edit-section" id="mp-projects-section">
        <h3>${SVG.projects} Projects &amp; Work <span class="mp-proj-count-edit">${projects.length} projects</span></h3>
        <div id="mp-projects-list">
          ${projects.map((p, i) => `
            <div class="mp-saved-proj" data-idx="${i}">
              ${p.images?.[0] ? `<img src="${p.images[0]}" alt="${p.name}" class="mp-saved-thumb">` : ''}
              <div class="mp-saved-info">
                <strong>${p.name}</strong>
                <span>${(p.tags || []).join(', ')}</span>
              </div>
              <button type="button" class="mp-del-proj" data-idx="${i}">×</button>
            </div>
          `).join('')}
        </div>
        ${projects.length === 0 ? '<p class="mp-hint">No projects yet. Add your first one below!</p>' : ''}
        <button type="button" class="mp-btn-green" id="mp-add-proj-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Projects
        </button>
        <div class="mp-add-proj-form" id="mp-proj-form" style="display:none">
          <div class="mp-field"><label>Project Name <span style="color:#dc2626">*</span></label><input type="text" id="mpf-name" placeholder="e.g. E-commerce Dashboard"></div>
          <div class="mp-field">
            <label>Project Images <span style="font-weight:400;color:#999">(add as many as you want)</span></label>
            <input type="file" id="mpf-images" accept="image/*" multiple style="display:none">
            <button type="button" class="mp-btn-outline" id="mpf-img-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Add Images
            </button>
            <p class="mp-hint">JPG, PNG, WEBP · Max 5MB each · First image becomes the thumbnail</p>
            <div id="mpf-img-preview" class="mp-img-previews"></div>
          </div>
          <div class="mp-field"><label>Tech Stack / Tags <span style="font-weight:400;color:#999">(press Enter or comma to add)</span></label><input type="text" id="mpf-tags" placeholder="e.g. React, UI/UX, Figma..."></div>
          <div class="mp-field"><label>Description <span style="color:#dc2626">*</span></label><textarea id="mpf-desc" rows="4" placeholder="What did you build? What problem does it solve?"></textarea></div>
          <div style="display:flex;gap:10px;margin-top:16px">
            <button type="button" class="mp-btn-green" id="mpf-save">Save Project</button>
            <button type="button" class="mp-btn-outline" id="mpf-cancel">Cancel</button>
          </div>
        </div>
      </div>

      <button type="button" class="mp-save-all" id="mp-save-all">Save All Changes</button>
      <p style="text-align:center;margin-top:12px"><a href="/my-profile?id=${session.id}" class="mp-view-link">View My Public Profile →</a></p>
      <p class="mp-save-msg" id="mp-save-msg"></p>
    </div>
  `;

  // ── Skills management ──
  let currentSkills = [...skills];
  const skillsWrap = block.querySelector('#mp-skills-wrap');
  const skillInp = block.querySelector('#mp-skill-inp');

  function renderSkillPills() {
    skillsWrap.innerHTML = currentSkills.map((s) => `<span class="mp-skill-pill">${s}<button type="button" data-skill="${s}">×</button></span>`).join('');
    skillsWrap.querySelectorAll('button[data-skill]').forEach((b) => {
      b.addEventListener('click', () => { currentSkills = currentSkills.filter((x) => x !== b.dataset.skill); renderSkillPills(); });
    });
  }
  renderSkillPills();

  function addSkill() {
    const v = skillInp.value.replace(',', '').trim();
    if (v && !currentSkills.includes(v)) { currentSkills.push(v); renderSkillPills(); }
    skillInp.value = '';
  }
  block.querySelector('#mp-skill-add').addEventListener('click', addSkill);
  skillInp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } });

  // ── Photo upload ──
  const photoInput = block.querySelector('#mp-photo-input');
  let newAvatarBase64 = session.avatar || '';
  block.querySelector('#mp-change-photo').addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 320;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        newAvatarBase64 = canvas.toDataURL('image/jpeg', 0.75);
        const avatarEl = block.querySelector('.mp-edit-avatar');
        avatarEl.innerHTML = `<img src="${newAvatarBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ── Project add form ──
  let projectImages = [];
  let currentProjects = [...(session.projects || [])];

  block.querySelector('#mp-add-proj-btn').addEventListener('click', () => {
    block.querySelector('#mp-proj-form').style.display = 'block';
  });
  block.querySelector('#mpf-cancel').addEventListener('click', () => {
    block.querySelector('#mp-proj-form').style.display = 'none';
    projectImages = [];
    block.querySelector('#mpf-img-preview').innerHTML = '';
    block.querySelector('#mpf-name').value = '';
    block.querySelector('#mpf-tags').value = '';
    block.querySelector('#mpf-desc').value = '';
  });

  block.querySelector('#mpf-img-btn').addEventListener('click', () => block.querySelector('#mpf-images').click());
  block.querySelector('#mpf-images').addEventListener('change', (e) => {
    const preview = block.querySelector('#mpf-img-preview');
    [...e.target.files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 800;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          projectImages.push(compressed);
          preview.innerHTML += `<img src="${compressed}" alt="preview">`;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  block.querySelector('#mpf-save').addEventListener('click', () => {
    const name = block.querySelector('#mpf-name').value.trim();
    const desc = block.querySelector('#mpf-desc').value.trim();
    const tagsRaw = block.querySelector('#mpf-tags').value;
    if (!name || !desc) { alert('Please fill in project name and description.'); return; }
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    currentProjects.push({ id: `proj-${Date.now()}`, name, desc, tags, images: [...projectImages] });
    projectImages = [];
    block.querySelector('#mpf-cancel').click();
    block.querySelector('#mp-projects-section .mp-hint')?.remove();
    const list = block.querySelector('#mp-projects-list');
    const idx = currentProjects.length - 1;
    const p = currentProjects[idx];
    const el = document.createElement('div');
    el.className = 'mp-saved-proj';
    el.dataset.idx = idx;
    el.innerHTML = `${p.images?.[0] ? `<img src="${p.images[0]}" alt="${p.name}" class="mp-saved-thumb">` : ''}<div class="mp-saved-info"><strong>${p.name}</strong><span>${(p.tags || []).join(', ')}</span></div><button type="button" class="mp-del-proj" data-idx="${idx}">×</button>`;
    list.appendChild(el);
    el.querySelector('.mp-del-proj').addEventListener('click', () => { currentProjects.splice(idx, 1); el.remove(); });
    block.querySelector('.mp-proj-count-edit').textContent = `${currentProjects.length} projects`;
  });

  // Delete existing projects
  block.querySelectorAll('.mp-del-proj').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.idx;
      currentProjects.splice(idx, 1);
      btn.closest('.mp-saved-proj').remove();
      block.querySelector('.mp-proj-count-edit').textContent = `${currentProjects.length} projects`;
    });
  });

  // ── Save all ──
  block.querySelector('#mp-save-all').addEventListener('click', () => {
    const updated = {
      ...session,
      name: block.querySelector('#mp-name').value.trim() || session.name,
      skill: block.querySelector('#mp-role').value.trim() || session.skill,
      hourlyRate: block.querySelector('#mp-rate').value || session.hourlyRate,
      bio: block.querySelector('#mp-bio').value.trim(),
      skills: currentSkills,
      email: block.querySelector('#mp-email').value.trim() || session.email,
      links: {
        linkedin: block.querySelector('#mp-linkedin').value.trim(),
        github: block.querySelector('#mp-github').value.trim(),
      },
      avatar: newAvatarBase64,
      projects: currentProjects,
      profileComplete: true,
    };

    setSession(updated);

    // Also update in sb_users_v1
    try {
      const users = getAllUsers();
      const idx = users.findIndex((u) => u.id === session.id);
      if (idx !== -1) users[idx] = { ...users[idx], ...updated };
      else users.push(updated);
      localStorage.setItem('sb_users_v1', JSON.stringify(users));
    } catch (err) {
      // If quota exceeded, save without project images (at least keep profile data)
      try {
        const slim = { ...updated, projects: (updated.projects || []).map((p) => ({ ...p, images: [] })) };
        const users = getAllUsers();
        const idx = users.findIndex((u) => u.id === session.id);
        if (idx !== -1) users[idx] = { ...users[idx], ...slim };
        else users.push(slim);
        localStorage.setItem('sb_users_v1', JSON.stringify(users));
      } catch { /* still failing — storage truly full */ }
    }

    const msg = block.querySelector('#mp-save-msg');
    msg.textContent = 'Profile saved successfully!';
    msg.style.color = '#1dbf73';
    msg.style.textAlign = 'center';
    msg.style.marginTop = '8px';
    setTimeout(() => { msg.textContent = ''; }, 3000);
  });
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

  if (!hero) {
    // No CMS content authored on this block instance (e.g. the /my-profile page) —
    // this is the self-serve, localStorage-driven "My Profile" experience instead.
    const urlId = new URLSearchParams(window.location.search).get('id');
    if (urlId) {
      const users = getAllUsers();
      const viewUser = users.find((u) => u.id === urlId);
      if (!viewUser) {
        block.innerHTML = '<div style="padding:60px;text-align:center;color:#888">Profile not found.</div>';
        return;
      }
      renderPublicView(block, viewUser);
      return;
    }

    const session = getSession();
    if (!session) { window.location.href = '/login'; return; }
    if (!session.profileComplete) { renderWizard(block, session); return; }
    renderEditView(block, session);
    return;
  }

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
