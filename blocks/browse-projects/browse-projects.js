function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function getProposals() {
  try { return JSON.parse(localStorage.getItem('sb_proposals')) || []; } catch { return []; }
}

function getUserKey(session) {
  return session?.id || session?.email || null;
}

function getPlanLimit(session) {
  const plan = (session?.activePlan || '').toLowerCase();
  if (plan === 'business') return Infinity;
  if (plan === 'pro') return 15;
  if (plan === 'starter') return 5;
  return 1; // free tier
}

function getMyProposalCount(session) {
  const key = getUserKey(session);
  if (!key) return 0;
  return getProposals().filter((p) => p.freelancerId === key).length;
}

function markProposalUsed(session) {
  const key = getUserKey(session);
  if (key) localStorage.setItem(`bp_used_free_${key}`, '1');
}

function openProposalModal(job, session) {
  // Hard paywall guard — checks actual count vs plan limit
  if (getMyProposalCount(session) >= getPlanLimit(session)) {
    window.location.href = '/upgrade';
    return;
  }

  const existing = document.getElementById('bp-proposal-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bp-proposal-modal';
  modal.innerHTML = `
    <div class="bp-modal-overlay">
      <div class="bp-modal-card">
        <button class="bp-modal-close" aria-label="Close">&times;</button>
        <h2>Submit Proposal</h2>
        <p class="bp-modal-job-title">${job.title}</p>
        <form id="bp-proposal-form" novalidate>
          <div class="bp-modal-field">
            <label>Cover Letter <span class="bp-req">*</span></label>
            <textarea id="bp-cover" rows="5" placeholder="Describe your experience and why you're a great fit..." required></textarea>
          </div>
          <div class="bp-modal-row">
            <div class="bp-modal-field">
              <label>Your Budget <span class="bp-req">*</span></label>
              <input type="text" id="bp-budget" placeholder="e.g. ₹15,000" required>
            </div>
            <div class="bp-modal-field">
              <label>Timeline <span class="bp-req">*</span></label>
              <input type="text" id="bp-timeline" placeholder="e.g. 2 weeks">
            </div>
          </div>
          <p class="bp-modal-error" id="bp-modal-err"></p>
          <button type="submit" class="bp-modal-submit">Submit Proposal</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  modal.querySelector('.bp-modal-close').addEventListener('click', close);
  modal.querySelector('.bp-modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });

  modal.querySelector('#bp-proposal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const cover = modal.querySelector('#bp-cover').value.trim();
    const budget = modal.querySelector('#bp-budget').value.trim();
    const timeline = modal.querySelector('#bp-timeline').value.trim();
    const err = modal.querySelector('#bp-modal-err');
    if (!cover || !budget) { err.textContent = 'Please fill in all required fields.'; return; }

    const key = getUserKey(session);
    const proposals = getProposals();
    proposals.push({
      id: `prop-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      clientId: job.clientId || 'client-jane',
      freelancerId: key,
      freelancerName: session.name,
      freelancerRole: session.skill || 'Freelancer',
      coverLetter: cover,
      budget,
      timeline,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('sb_proposals', JSON.stringify(proposals));
    markProposalUsed(session);
    close();
    if (typeof window.bpShowToast === 'function') window.bpShowToast('Proposal submitted! This was your free proposal.');
    setTimeout(() => { if (typeof window.bpRender === 'function') window.bpRender(); }, 100);
  });
}

const ICONS = {
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  clock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  users: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  empty: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
};

function getSavedProjects(userId) {
  try { return JSON.parse(localStorage.getItem(`sb_saved_proj_${userId}`)) || []; } catch { return []; }
}
function toggleSaveProject(userId, job) {
  const saved = getSavedProjects(userId);
  const idx = saved.findIndex((s) => s.id === job.id);
  if (idx > -1) { saved.splice(idx, 1); } else { saved.push({ id: job.id, title: job.title, budget: job.budget, budgetType: job.budgetType, deadline: job.deadline, client: job.client, desc: job.desc, skills: job.skills }); }
  localStorage.setItem(`sb_saved_proj_${userId}`, JSON.stringify(saved));
  return idx === -1;
}

function buildJobCard(j, session, appliedIds, freeUsed) {
  const badgeClass = j.budgetType.toLowerCase() === 'hourly' ? 'bp-badge-hourly' : 'bp-badge-fixed';
  const initial = j.client.charAt(0).toUpperCase();
  const hasApplied = appliedIds.has(j.id);
  const isFreelancer = session?.role === 'freelancer';
  const userId = session?.id || session?.email;
  const isSaved = isFreelancer && userId ? getSavedProjects(userId).some((s) => s.id === j.id) : false;

  let applyBtn;
  if (hasApplied) {
    applyBtn = `<button class="bp-apply-btn applied" disabled><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Applied</button>`;
  } else if (isFreelancer && freeUsed) {
    applyBtn = `<a href="/upgrade" class="bp-apply-btn pro-required">Upgrade to Apply →</a>`;
  } else if (isFreelancer) {
    applyBtn = `<button class="bp-apply-btn" data-job="${j.id}">Submit Proposal</button>`;
  } else if (!session) {
    applyBtn = `<a href="/login" class="bp-apply-btn">Log in to Apply</a>`;
  } else {
    applyBtn = '';
  }

  return `
    <div class="bp-job-card">
      <div class="bp-job-header">
        <div>
          <div class="bp-job-title">${j.title}</div>
          <div class="bp-job-meta">
            <span class="bp-job-poster"><span class="bp-poster-avatar">${initial}</span>${j.client}</span>
            <span class="bp-sep">&bull;</span>
            <span>${j.posted}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="bp-badge bp-badge-open">Open</span>
          ${isFreelancer ? `<button class="bp-save-btn${isSaved ? ' saved' : ''}" data-save-job="${j.id}" title="${isSaved ? 'Remove from saved' : 'Save project'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isSaved ? '#1dbf73' : 'none'}" stroke="${isSaved ? '#1dbf73' : '#aaa'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>` : ''}
        </div>
      </div>
      <p class="bp-job-desc">${j.desc}</p>
      <div class="bp-job-skills">
        ${j.skills.map((s) => `<span class="bp-skill-tag">${s}</span>`).join('')}
      </div>
      <div class="bp-job-footer">
        <div class="bp-job-footer-meta">
          <span class="bp-job-budget">${j.budget}</span>
          <span class="bp-badge ${badgeClass}">${j.budgetType}</span>
          <span>${ICONS.clock} ${j.deadline}</span>
          <span>${ICONS.users} ${j.proposals} proposals</span>
        </div>
        ${applyBtn}
      </div>
    </div>
  `;
}

// ── Merged in from the old project-detail block. Unrelated in purpose
//    (portfolio-piece showcase vs. job-listing marketplace — see
//    context/blocks-audit.md), kept as a dispatched code path here only
//    because EDS resolves a block's JS/CSS by its own class name, so any
//    page still authored as "Project Detail" needs that exact file to
//    exist; this is the single real implementation both files share. ──
function pdFormatCount(n) {
  if (!n) return '0';
  const num = parseInt(String(n).replace(/,/g, ''), 10);
  if (Number.isNaN(num)) return '0';
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(num);
}

function pdGetLiked() {
  try { return JSON.parse(localStorage.getItem('sb_liked_projects')) || []; } catch { return []; }
}

function pdGetAllUsers() {
  try { return JSON.parse(localStorage.getItem('sb_users_v1')) || []; } catch { return []; }
}

// Self-uploaded profile projects only ever live in localStorage (no CMS page backs them),
// so a ?uid=&pid= pair is resolved from there instead of parsing authored rows.
function pdGetUserProjectData() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get('uid');
  const pid = params.get('pid');
  if (!uid || !pid) return undefined;

  const user = pdGetAllUsers().find((u) => u.id === uid);
  const project = user?.projects?.find((p) => p.id === pid) || user?.projects?.[Number(pid)];
  if (!user || !project) return null;

  return {
    title: project.name || '',
    desc: project.desc || '',
    images: project.images || [],
    tags: (project.tags || []).join(','),
    authorName: user.name || '',
    authorImg: user.avatar || '',
    authorRole: user.skill || 'Freelancer',
    authorLink: `/my-profile?id=${encodeURIComponent(user.id)}`,
    likes: '0',
    views: '',
  };
}

async function decorateProjectDetail(block) {
  const userData = pdGetUserProjectData();
  if (userData === null) {
    block.innerHTML = '<div style="padding:60px;text-align:center;color:#888">Project not found.</div>';
    return;
  }

  const data = userData || {};

  if (!userData) {
    [...block.children].forEach((row) => {
      const cells = [...row.children];
      const key = cells[0]?.textContent.trim().toLowerCase();
      if (!key) return;
      if (key === 'images') {
        data.images = cells.slice(1)
          .map((c) => c.querySelector('code')?.textContent.trim() || c.textContent.trim())
          .filter(Boolean);
      } else if (key === 'author') {
        data.authorName = cells[1]?.textContent.trim() || '';
        data.authorImg = cells[2]?.querySelector('code')?.textContent.trim() || cells[2]?.textContent.trim() || '';
        data.authorRole = cells[3]?.textContent.trim() || '';
        const aEl = cells[4]?.querySelector('a');
        data.authorLink = aEl?.getAttribute('href') || aEl?.href || '';
        data.likes = cells[5]?.textContent.trim() || '0';
        data.views = cells[6]?.textContent.trim() || '';
      } else {
        data[key] = cells[1]?.textContent.trim() || '';
      }
    });
  }

  const tags = (data.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  const images = data.images || [];
  const likesNum = parseInt(String(data.likes).replace(/,/g, ''), 10) || 0;
  const viewsNum = data.views
    ? parseInt(String(data.views).replace(/,/g, ''), 10)
    : Math.round(likesNum * 5.5);
  const pageKey = window.location.pathname + window.location.search;
  const isLiked = pdGetLiked().includes(pageKey);

  const thumbsHtml = images.length > 1
    ? `<div class="pd-thumbs">
        ${images.map((src, i) => `
          <div class="pd-thumb${i === 0 ? ' active' : ''}" data-idx="${i}" data-src="${src}">
            <img src="${src}" alt="Image ${i + 1}" loading="lazy">
          </div>`).join('')}
      </div>`
    : '';

  block.innerHTML = `
    <div class="pd-page">
      <a href="javascript:history.back()" class="pd-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Projects
      </a>

      <div class="pd-layout">
        <!-- LEFT: Gallery -->
        <div class="pd-gallery">
          <div class="pd-main-wrap">
            <img src="${images[0] || ''}" alt="${data.title || 'Project'}" id="pd-main-img" loading="eager">
          </div>
          ${thumbsHtml}
        </div>

        <!-- RIGHT: Sidebar -->
        <aside class="pd-sidebar">
          <h1 class="pd-title">${data.title || ''}</h1>
          <div class="pd-tags">
            ${tags.map((t) => `<span class="pd-tag">${t}</span>`).join('')}
          </div>
          <p class="pd-desc">${data.desc || ''}</p>

          ${data.authorName ? `
            <a href="${data.authorLink || '#'}" class="pd-author">
              ${data.authorImg ? `<img src="${data.authorImg}" alt="${data.authorName}" class="pd-author-avatar">` : ''}
              <div class="pd-author-info">
                <div class="pd-author-name">${data.authorName}</div>
                <div class="pd-author-role">${data.authorRole}</div>
              </div>
            </a>
          ` : ''}

          <div class="pd-stats">
            <div class="pd-stat"><span class="pd-stat-val" id="pd-likes-val">${pdFormatCount(likesNum)}</span><span class="pd-stat-label">Likes</span></div>
            <div class="pd-stat"><span class="pd-stat-val">${pdFormatCount(viewsNum)}</span><span class="pd-stat-label">Views</span></div>
            <div class="pd-stat"><span class="pd-stat-val">${images.length}</span><span class="pd-stat-label">Images</span></div>
          </div>

          <div class="pd-actions">
            <button class="pd-like-btn${isLiked ? ' liked' : ''}" id="pd-like-btn">
              <svg viewBox="0 0 24 24" fill="${isLiked ? '#1dbf73' : 'none'}" stroke="${isLiked ? '#1dbf73' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ${isLiked ? 'Liked' : 'Like this Shot'}
            </button>
            ${data.authorLink ? `<a href="${data.authorLink}" class="pd-profile-btn">View ${data.authorName?.split(' ')[0] || 'Profile'}'s Profile &rarr;</a>` : ''}
          </div>
        </aside>
      </div>
    </div>
  `;

  // Thumbnail switching
  block.querySelectorAll('.pd-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.src;
      const mainImg = block.querySelector('#pd-main-img');
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => { mainImg.src = src; mainImg.style.opacity = '1'; }, 180);
      }
      block.querySelectorAll('.pd-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Like toggle
  block.querySelector('#pd-like-btn')?.addEventListener('click', () => {
    const liked = pdGetLiked();
    const btn = block.querySelector('#pd-like-btn');
    const valEl = block.querySelector('#pd-likes-val');
    const nowLiked = liked.includes(pageKey);
    const newLiked = nowLiked ? liked.filter((x) => x !== pageKey) : [...liked, pageKey];
    localStorage.setItem('sb_liked_projects', JSON.stringify(newLiked));
    const newCount = nowLiked ? likesNum - 1 : likesNum + 1;
    if (valEl) valEl.textContent = pdFormatCount(newCount);
    const heart = nowLiked
      ? 'fill="none" stroke="currentColor"'
      : 'fill="#1dbf73" stroke="#1dbf73"';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" ${heart} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      ${nowLiked ? 'Like this Shot' : 'Liked'}
    `;
    btn.classList.toggle('liked', !nowLiked);
  });
}

// ── Merged in from the old hire-talent block. Genuinely the same shape
//    of page as Browse Projects (search + filter + sort + card grid) —
//    unlike project-detail, this is a real "should be one thing" pair. ──
function htExtractImage(cell) {
  if (!cell) return null;
  const existing = cell.querySelector('picture, img');
  if (existing) return existing.cloneNode(true);
  const link = cell.querySelector('a');
  const href = link?.href || '';
  const src = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(href)
    ? href : cell.textContent.trim();
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(src)) {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = cell.textContent.trim() || '';
    return img;
  }
  return null;
}

const HT_ICONS = {
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  star: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  briefcase: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
  chevron: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  empty: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
};

function htGetFavs(clientId) {
  try { return JSON.parse(localStorage.getItem(`sb_fav_${clientId}`)) || []; } catch { return []; }
}
function htGetFavIds(clientId) {
  return htGetFavs(clientId).map((f) => (typeof f === 'string' ? f : f.id));
}
function htToRelative(href) {
  try { return new URL(href).pathname; } catch { return href || '#'; }
}
function htToggleFav(clientId, candidate) {
  const favs = htGetFavs(clientId);
  const profileHref = htToRelative(candidate.profileHref);
  const id = candidate.userId || profileHref;
  const idx = favs.findIndex((f) => (typeof f === 'string' ? f : f.id) === id);
  if (idx > -1) {
    favs.splice(idx, 1);
  } else {
    favs.push({ id, name: candidate.name, role: candidate.role, rate: candidate.rate, profileHref });
  }
  localStorage.setItem(`sb_fav_${clientId}`, JSON.stringify(favs));
  return idx === -1;
}

function htBuildCard(c) {
  const session = getSession();
  const isClient = session?.role === 'client';
  const isSaved = isClient ? htGetFavIds(session.id).includes(c.userId || c.profileHref) : false;

  const hasLink = c.profileHref && c.profileHref !== '#';
  const card = document.createElement(hasLink ? 'a' : 'div');
  card.className = 'ht-card';
  if (hasLink) {
    card.href = c.profileHref;
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.display = 'block';
  }

  const visibleSkills = c.skills.slice(0, 4);
  const extraCount = c.skills.length - visibleSkills.length;
  const skillPills = visibleSkills.map((s) => `<span class="ht-skill">${s}</span>`).join('');
  const hiddenPills = c.skills.slice(4).map((s) => `<span class="ht-skill ht-skill-hidden" style="display:none">${s}</span>`).join('');
  const moreBtn = extraCount > 0
    ? `<button type="button" class="ht-skill-more">+${extraCount} ${HT_ICONS.chevron}</button>`
    : '';

  const top = document.createElement('div');
  top.className = 'ht-card-top';
  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'ht-avatar-wrap';
  if (c.avatarEl) {
    c.avatarEl.classList.add('ht-avatar-img');
    avatarWrap.append(c.avatarEl);
  }
  avatarWrap.insertAdjacentHTML('beforeend', '<span class="ht-online-dot"></span>');

  const info = document.createElement('div');
  info.className = 'ht-info';
  info.innerHTML = `
    <div class="ht-name">${c.name}</div>
    <div class="ht-role">${c.role}</div>
    <div class="ht-meta-row">
      <span class="ht-rate">${c.rate}</span>
      ${c.reviews ? `<span class="ht-sep">·</span>${HT_ICONS.star}<span class="ht-rating">${c.rating}</span><span class="ht-review-cnt">(${c.reviews})</span>` : ''}
      <span class="ht-sep">·</span>${HT_ICONS.briefcase}<span class="ht-jobs">${c.projects} project${c.projects === '1' ? '' : 's'}</span>
    </div>
  `;
  top.append(avatarWrap, info);

  const bio = document.createElement('p');
  bio.className = 'ht-bio';
  bio.textContent = c.bio;

  const skillsWrap = document.createElement('div');
  skillsWrap.className = 'ht-skills';
  skillsWrap.innerHTML = skillPills + hiddenPills + moreBtn;

  // Star button — top right corner of card
  if (isClient) {
    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = `ht-fav-btn${isSaved ? ' saved' : ''}`;
    favBtn.title = isSaved ? 'Remove from saved' : 'Save freelancer';
    const starSVG = (filled) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="${filled ? '#f59e0b' : 'none'}" stroke="${filled ? '#f59e0b' : '#ccc'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    favBtn.innerHTML = starSVG(isSaved);
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const added = htToggleFav(session.id, c);
      favBtn.classList.toggle('saved', added);
      favBtn.innerHTML = starSVG(added);
    });
    card.appendChild(favBtn);
  }

  const profileBtn = document.createElement('a');
  profileBtn.className = 'ht-see-profile';
  profileBtn.href = c.profileHref;
  profileBtn.textContent = 'See Profile';

  card.append(top, bio, skillsWrap, profileBtn);

  const moreEl = skillsWrap.querySelector('.ht-skill-more');
  if (moreEl) {
    moreEl.addEventListener('click', () => {
      skillsWrap.querySelectorAll('.ht-skill-hidden').forEach((el) => { el.style.display = 'inline-flex'; });
      moreEl.style.display = 'none';
    });
  }

  return card;
}

function htRenderEmptyState() {
  const empty = document.createElement('div');
  empty.className = 'ht-empty-state';
  empty.innerHTML = `
    <div class="ht-empty-icon">${HT_ICONS.empty}</div>
    <h3>No freelancers found</h3>
    <p>Try clearing some filters or searching for a different skill or keyword.</p>
  `;
  return empty;
}

async function decorateHireTalent(block) {
  const rows = [...block.children];
  let pageTitle = 'Hire talent for your project.';
  let ctaLink = null;
  const candidates = [];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const firstCell = cells[0];
    if (i === 0 && firstCell.querySelector('strong, b')) {
      pageTitle = firstCell.textContent.trim();
      ctaLink = cells[1]?.querySelector('a') || null;
      return;
    }
    const avatarEl = htExtractImage(firstCell);
    const skillsText = cells[8]
      ? [...cells[8].childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE
          || (n.nodeType === Node.ELEMENT_NODE && !['IMG', 'PICTURE', 'SOURCE'].includes(n.tagName?.toUpperCase())))
        .map((n) => n.textContent)
        .join('')
        .trim()
      : '';
    candidates.push({
      avatarEl,
      name: cells[1]?.textContent.trim() || '',
      role: cells[2]?.textContent.trim() || '',
      rate: cells[3]?.textContent.trim() || '',
      rating: cells[4]?.textContent.trim() || '',
      reviews: cells[5]?.textContent.trim() || '',
      projects: cells[6]?.textContent.trim() || '0',
      bio: cells[7]?.textContent.trim() || '',
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      profileHref: cells[9]?.querySelector('a')?.href || '#',
    });
  });

  // Add dynamically registered freelancers from localStorage
  try {
    const localUsers = JSON.parse(localStorage.getItem('sb_users_v1')) || [];
    localUsers.filter((u) => u.role === 'freelancer' && (u.profileComplete || u.bio || u.skills?.length)).forEach((u) => {
      const avatarEl = u.avatar ? (() => { const img = document.createElement('img'); img.src = u.avatar; img.loading = 'lazy'; img.alt = u.name || ''; return img; })() : null;
      candidates.push({
        avatarEl,
        name: u.name || '',
        role: u.skill || 'Freelancer',
        rate: u.hourlyRate ? `₹${u.hourlyRate}/hr` : '',
        rating: '',
        reviews: '',
        projects: String(u.projects?.length || 0),
        bio: u.bio || '',
        skills: Array.isArray(u.skills) ? u.skills : [],
        profileHref: `/my-profile?id=${u.id}`,
        userId: u.id,
      });
    });
  } catch (e) { /* no local users */ }

  // Unique skill list across all candidates, alphabetical
  const allSkills = [...new Set(candidates.flatMap((c) => c.skills))].sort((a, b) => a.localeCompare(b));

  block.innerHTML = `
    <div class="ht-hero">
      <div class="ht-hero-inner">
        <h1 class="ht-hero-title">${pageTitle}</h1>
        ${ctaLink ? `<a href="${ctaLink.href}" class="ht-hero-btn">${HT_ICONS.plus} ${ctaLink.textContent.trim()}</a>` : ''}
      </div>
    </div>
    <div class="ht-page-wrap">
      <aside class="ht-sidebar">
        <div class="ht-sidebar-top">
          <h2>Filters</h2>
          <button type="button" class="ht-clear-all">Clear All</button>
        </div>
        <div class="ht-search-wrapper">
          ${HT_ICONS.search}
          <input type="text" class="ht-search-input" placeholder="Search name or skill...">
        </div>
        <div class="ht-sidebar-divider"></div>
        <div class="ht-filter-group">
          <span class="ht-filter-label">Sort By</span>
          <select class="ht-sort-select">
            <option value="projects" selected>Most Projects</option>
            <option value="rating">Highest Rated</option>
            <option value="price">Lowest Price / Hr</option>
            <option value="skills">Most Skills</option>
          </select>
        </div>
        <div class="ht-sidebar-divider"></div>
        <div class="ht-filter-group">
          <span class="ht-filter-label">Skills</span>
          <div class="ht-filter-options">
            ${allSkills.map((s) => `
              <label class="ht-checkbox-label">
                <input type="checkbox" class="ht-skill-filter" value="${s}"><span>${s}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </aside>
      <div class="ht-directory">
        <div class="ht-directory-meta">
          <div class="ht-results-count"></div>
        </div>
        <div class="ht-candidates-grid"></div>
      </div>
    </div>
  `;

  const searchInput = block.querySelector('.ht-search-input');
  const sortSelect = block.querySelector('.ht-sort-select');
  const skillCheckboxes = [...block.querySelectorAll('.ht-skill-filter')];
  const clearBtn = block.querySelector('.ht-clear-all');
  const grid = block.querySelector('.ht-candidates-grid');
  const countEl = block.querySelector('.ht-results-count');

  function filterAndRender() {
    const q = searchInput.value.toLowerCase().trim();
    const selectedSkills = skillCheckboxes.filter((cb) => cb.checked).map((cb) => cb.value.toLowerCase());
    const sortBy = sortSelect.value;

    let matches = candidates.filter((c) => {
      if (q) {
        const inName = c.name.toLowerCase().includes(q);
        const inRole = c.role.toLowerCase().includes(q);
        const inSkills = c.skills.some((s) => s.toLowerCase().includes(q));
        if (!inName && !inRole && !inSkills) return false;
      }
      if (selectedSkills.length > 0) {
        const has = selectedSkills.some((skill) => c.skills.some((s) => s.toLowerCase() === skill));
        if (!has) return false;
      }
      return true;
    });

    if (sortBy === 'price') {
      matches = matches.slice().sort((a, b) => (parseFloat(a.rate.replace(/[^\d.]/g, '')) || 0) - (parseFloat(b.rate.replace(/[^\d.]/g, '')) || 0));
    } else if (sortBy === 'skills') {
      matches = matches.slice().sort((a, b) => b.skills.length - a.skills.length);
    } else if (sortBy === 'rating') {
      matches = matches.slice().sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else {
      matches = matches.slice().sort((a, b) => {
        const aP = parseInt(a.projects, 10) || 0;
        const bP = parseInt(b.projects, 10) || 0;
        if (aP === 0 && bP === 0) return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        return bP - aP;
      });
    }

    countEl.textContent = `Showing ${matches.length} candidate${matches.length === 1 ? '' : 's'}`;
    grid.innerHTML = '';
    if (matches.length === 0) {
      grid.append(htRenderEmptyState());
      return;
    }
    matches.forEach((c) => {
      const cardData = { ...c, avatarEl: c.avatarEl?.cloneNode(true) || null };
      grid.append(htBuildCard(cardData));
    });
  }

  searchInput.addEventListener('input', filterAndRender);
  sortSelect.addEventListener('change', filterAndRender);
  skillCheckboxes.forEach((cb) => cb.addEventListener('change', filterAndRender));
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    sortSelect.value = 'projects';
    skillCheckboxes.forEach((cb) => { cb.checked = false; });
    filterAndRender();
  });

  // Pre-select skills from URL ?skills= param (from hero search)
  const urlParams = new URLSearchParams(window.location.search);
  const skillParam = urlParams.get('skills');
  if (skillParam) {
    const preSelect = skillParam.split(',').map((s) => s.trim().toLowerCase());
    let matched = false;
    skillCheckboxes.forEach((cb) => {
      if (preSelect.includes(cb.value.toLowerCase())) {
        cb.checked = true;
        matched = true;
      }
    });
    if (!matched) searchInput.value = skillParam;
  }

  filterAndRender();
}

export default async function decorate(block) {
  // Checks both the new variant classes ("Browse Projects (project)" /
  // "Browse Projects (talent)" in da.live) and the old standalone block
  // names (project-detail / hire-talent), so this keeps working on any
  // page that hasn't been migrated to the new block name yet. Once every
  // page is confirmed migrated, the old class checks can be dropped.
  if (block.classList.contains('project') || block.classList.contains('project-detail')) {
    await decorateProjectDetail(block); return;
  }
  if (block.classList.contains('talent') || block.classList.contains('hire-talent')) {
    await decorateHireTalent(block); return;
  }

  const rows = [...block.children];
  let pageTitle = 'Browse Projects';
  let pageSubtitle = 'Browse real client projects and apply — first one for free.';
  let ctaText = '';
  let ctaHref = '';
  const jobs = [];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const firstCell = cells[0];
    if (i === 0 && firstCell.querySelector('strong, b')) {
      pageTitle = firstCell.textContent.trim();
      pageSubtitle = cells[1]?.textContent.trim() || pageSubtitle;
      ctaText = cells[2]?.textContent.trim() || '';
      ctaHref = cells[2]?.querySelector('a')?.href || '';
      return;
    }
    const skillsText = cells[8]?.textContent.trim() || '';
    const jobTitle = cells[0]?.textContent.trim() || '';
    if (!jobTitle) return;
    jobs.push({
      id: jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      clientId: 'client-jane',
      title: jobTitle,
      client: cells[1]?.textContent.trim() || '',
      posted: cells[2]?.textContent.trim() || '',
      budget: cells[3]?.textContent.trim() || '',
      budgetType: cells[4]?.textContent.trim() || 'Fixed',
      deadline: cells[5]?.textContent.trim() || '',
      proposals: cells[6]?.textContent.trim() || '0',
      desc: cells[7]?.textContent.trim() || '',
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      category: cells[9]?.textContent.trim() || 'General',
    });
  });

  // Prepend client-posted jobs from localStorage (newest first)
  try {
    const clientJobs = JSON.parse(localStorage.getItem('sb_all_posted_jobs') || '[]');
    clientJobs.forEach((j) => {
      if (!jobs.find((x) => x.id === j.id)) {
        jobs.unshift({
          id: j.id,
          clientId: j.clientId,
          title: j.title,
          client: j.clientName || 'Client',
          posted: 'Just now',
          budget: j.budget,
          budgetType: j.budgetType || 'Fixed',
          deadline: j.deadline || '',
          proposals: '0',
          desc: j.desc,
          skills: Array.isArray(j.skills) ? j.skills : [],
          category: j.category || 'General',
        });
      }
    });
  } catch { /* empty */ }

  const session = getSession();
  const categories = [...new Set(jobs.map((j) => j.category))].sort((a, b) => a.localeCompare(b));

  block.innerHTML = `
    <div class="bp-hero">
      <div class="bp-hero-inner">
        <div>
          <h1>${pageTitle}</h1>
          <p>${pageSubtitle}</p>
        </div>
        ${ctaText ? `<a href="${ctaHref}" class="bp-hero-btn">${ctaText}</a>` : ''}
      </div>
    </div>
    <div class="bp-body">
      <aside class="bp-sidebar">
        <h3>Filter Projects</h3>
        <div class="bp-search-wrap">
          ${ICONS.search}
          <input type="text" class="bp-search-input" placeholder="Search projects...">
        </div>
        <hr class="bp-filter-divider">
        <span class="bp-filter-label">Category</span>
        <button type="button" class="bp-category-btn active" data-cat="">All Projects</button>
        ${categories.map((c) => `<button type="button" class="bp-category-btn" data-cat="${c}">${c}</button>`).join('')}
        ${session?.role === 'freelancer' ? `
        <hr class="bp-filter-divider">
        <div class="bp-free-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          <div>
            <strong>1 free proposal</strong>
            <p>Your first proposal is free. Upgrade to Pro for unlimited.</p>
          </div>
        </div>` : ''}
      </aside>
      <div class="bp-main">
        <p class="bp-job-count"></p>
        <div class="bp-jobs-list"></div>
      </div>
    </div>
  `;

  const searchInput = block.querySelector('.bp-search-input');
  const categoryBtns = [...block.querySelectorAll('.bp-category-btn')];
  const list = block.querySelector('.bp-jobs-list');
  const countLabel = block.querySelector('.bp-job-count');

  window.bpRender = () => render();

  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:13px 24px;border-radius:99px;font-size:0.88rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgb(0 0 0/25%)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }
  window.bpShowToast = showToast;

  function render() {
    const q = searchInput.value.toLowerCase().trim();
    const activeCat = block.querySelector('.bp-category-btn.active')?.dataset.cat || '';

    const matches = jobs.filter((j) => {
      if (activeCat && j.category !== activeCat) return false;
      if (q) {
        const inTitle = j.title.toLowerCase().includes(q);
        const inDesc = j.desc.toLowerCase().includes(q);
        const inSkills = j.skills.some((s) => s.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inSkills) return false;
      }
      return true;
    });

    countLabel.textContent = `${matches.length} project${matches.length === 1 ? '' : 's'} found`;

    if (matches.length === 0) {
      list.innerHTML = `
        <div class="bp-empty-state">
          <div class="bp-empty-icon">${ICONS.empty}</div>
          <h3>No projects found</h3>
          <p>Try different keywords or clear filters to see all projects.</p>
        </div>
      `;
      return;
    }

    const freshSess = getSession();
    const userKey = getUserKey(freshSess);
    const freeUsed = getMyProposalCount(freshSess) >= getPlanLimit(freshSess);
    const appliedIds = new Set(
      getProposals().filter((p) => p.freelancerId === userKey).map((p) => p.jobId),
    );

    list.innerHTML = matches.map((j) => buildJobCard(j, freshSess, appliedIds, freeUsed)).join('');

    list.querySelectorAll('.bp-apply-btn[data-job]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = getSession();
        if (!s) { window.location.href = '/login'; return; }
        const job = jobs.find((j) => j.id === btn.dataset.job);
        if (!job) return;
        openProposalModal(job, s);
      });
    });

    // Save/bookmark job
    list.querySelectorAll('.bp-save-btn[data-save-job]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = getSession();
        if (!s) return;
        const job = jobs.find((j) => j.id === btn.dataset.saveJob);
        if (!job) return;
        const uid = s.id || s.email;
        const added = toggleSaveProject(uid, job);
        btn.classList.toggle('saved', added);
        btn.title = added ? 'Remove from saved' : 'Save project';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="${added ? '#1dbf73' : 'none'}" stroke="${added ? '#1dbf73' : '#aaa'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
      });
    });
  }

  searchInput.addEventListener('input', render);
  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const skillParam = urlParams.get('skills');
  if (skillParam) {
    const preSelect = skillParam.split(',').map((s) => s.trim().toLowerCase());
    let matched = false;
    block.querySelectorAll('.bp-skill-filter').forEach((cb) => {
      if (preSelect.includes(cb.value.toLowerCase())) { cb.checked = true; matched = true; }
    });
    if (!matched) searchInput.value = skillParam;
  }

  render();
}
