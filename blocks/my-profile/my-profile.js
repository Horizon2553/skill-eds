function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function setSession(s) { localStorage.setItem('skillbridge_auth', JSON.stringify(s)); }
function getAllUsers() {
  try { return JSON.parse(localStorage.getItem('sb_users_v1')) || []; } catch { return []; }
}

const SVG = {
  photo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  about: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  skills: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  contact: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  projects: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
};

export default async function decorate(block) {
  // View mode: ?id=xxx shows another user's profile
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

  renderEditView(block, session);
}

function openHireModal(user) {
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
      <h2 style="font-family:var(--heading-font-family);font-size:1.4rem;font-weight:800;color:#111;margin:0 0 4px;letter-spacing:-0.02em">Send Hire Request</h2>
      <p style="font-size:0.88rem;color:#888;margin:0 0 22px">to <strong style="color:#111">${user.name}</strong></p>
      <form id="mp-hire-form" novalidate>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Project / Job Title *</label>
          <input type="text" id="mp-hire-title" placeholder="e.g. Build React E-Commerce Frontend" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Description *</label>
          <textarea id="mp-hire-desc" rows="4" placeholder="Describe what you need..." style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none;resize:vertical" required></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Budget *</label>
            <input type="text" id="mp-hire-budget" placeholder="e.g. ₹25,000" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none" required>
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:700;color:#333;margin-bottom:6px">Timeline *</label>
            <input type="text" id="mp-hire-timeline" placeholder="e.g. 30 days" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:0.93rem;outline:none" required>
          </div>
        </div>
        <p id="mp-hire-err" style="color:#dc2626;font-size:0.83rem;min-height:1em;margin:0 0 8px"></p>
        <button type="submit" style="width:100%;padding:13px;background:#1dbf73;color:#fff;font-size:0.97rem;font-weight:700;border:none;border-radius:10px;cursor:pointer">Send Hire Request</button>
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
      title, desc, budget, timeline,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('sb_hire_requests', JSON.stringify(requests));
    close();
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:13px 24px;border-radius:99px;font-size:0.88rem;font-weight:600;z-index:9999';
    toast.textContent = `Hire request sent to ${user.name}!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  });
}

function renderPublicView(block, user) {
  const viewer = getSession();
  const isClient = viewer?.role === 'client' && viewer?.id !== user.id;

  const avatar = user.avatar
    ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<div style="width:100%;height:100%;border-radius:50%;background:#1dbf73;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:800">${user.name?.charAt(0).toUpperCase()}</div>`;

  const firstName = user.name?.split(' ')[0] || user.name;

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
          <button class="mp-hire-cta" id="mp-hire-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
            Hire ${firstName}
          </button>` : ''}
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
              ${user.projects.map((p) => `
                <div class="mp-proj-card">
                  ${p.images?.[0] ? `<div class="mp-proj-thumb"><img src="${p.images[0]}" alt="${p.name}"></div>` : ''}
                  <div class="mp-proj-info">
                    ${p.tags?.length ? `<div class="mp-proj-tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>` : ''}
                    <h3>${p.name}</h3>
                    <p>${p.desc || ''}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  if (isClient) {
    block.querySelector('#mp-hire-cta')?.addEventListener('click', () => openHireModal(user));
  }
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
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        projectImages.push(ev.target.result);
        preview.innerHTML += `<img src="${ev.target.result}" alt="preview">`;
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
    const users = getAllUsers();
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx !== -1) users[idx] = { ...users[idx], ...updated };
    else users.push(updated);
    localStorage.setItem('sb_users_v1', JSON.stringify(users));

    const msg = block.querySelector('#mp-save-msg');
    msg.textContent = 'Profile saved successfully!';
    msg.style.color = '#1dbf73';
    msg.style.textAlign = 'center';
    msg.style.marginTop = '8px';
    setTimeout(() => { msg.textContent = ''; }, 3000);
  });
}
