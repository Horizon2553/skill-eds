// Shared localStorage helpers
function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function getProposals() {
  try { return JSON.parse(localStorage.getItem('sb_proposals')) || []; } catch { return []; }
}
function saveProposals(p) { localStorage.setItem('sb_proposals', JSON.stringify(p)); }
function getHireRequests() {
  try { return JSON.parse(localStorage.getItem('sb_hire_requests')) || []; } catch { return []; }
}
function saveHireRequests(r) { localStorage.setItem('sb_hire_requests', JSON.stringify(r)); }
function getFavourites(clientId) {
  try {
    const raw = JSON.parse(localStorage.getItem(`sb_fav_${clientId}`)) || [];
    return raw.map((f) => {
      if (typeof f !== 'string') return f;
      // Old format: string was a URL — extract name from path slug
      let href = f;
      try { href = new URL(f).pathname; } catch { /* already relative */ }
      const slug = href.split('/').filter(Boolean).pop() || '';
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || href;
      return { id: href, name, role: 'Freelancer', rate: '', profileHref: href };
    });
  } catch { return []; }
}

// Seed jobs
const SEED_JOBS = [
  { id: 'react-ecommerce-frontend', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Build a React E-Commerce Frontend', desc: 'Looking for an experienced React developer to build the frontend for our e-commerce platform.', budget: '₹25,000', budgetType: 'fixed', skills: ['React', 'JavaScript', 'CSS'], deadline: '30 days', category: 'Web Development', postedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'uiux-saas-dashboard', clientId: 'client-jane', clientName: 'Jane Doe', title: 'UI/UX Designer for SaaS Dashboard', desc: 'We need a UI/UX designer to redesign our analytics dashboard.', budget: '₹15,000', budgetType: 'fixed', skills: ['UI/UX', 'Figma', 'Prototyping'], deadline: '21 days', category: 'Design', postedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'python-backend-api', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Python Backend API Development', desc: 'Need a skilled Python developer to build REST APIs.', budget: '₹800/hr', budgetType: 'hourly', skills: ['Python', 'Django', 'REST API'], deadline: '45 days', category: 'Backend Development', postedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'mobile-app-react-native', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Mobile App UI — React Native', desc: 'Building a fitness tracking app. Need a React Native developer.', budget: '₹20,000', budgetType: 'fixed', skills: ['React Native', 'JavaScript', 'Mobile'], deadline: '20 days', category: 'Mobile Development', postedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'brand-identity-logo', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Brand Identity & Logo Design', desc: 'Need a creative designer to create a complete brand identity.', budget: '₹8,000', budgetType: 'fixed', skills: ['Branding', 'Illustrator'], deadline: '14 days', category: 'Design', postedAt: new Date(Date.now() - 6 * 3600000).toISOString() },
];

function seedDefaultProposals() {
  const existing = getProposals();
  if (existing.length > 0) return;
  saveProposals([
    { id: 'prop-seed-1', jobId: 'react-ecommerce-frontend', jobTitle: 'Build a React E-Commerce Frontend', clientId: 'client-jane', freelancerId: 'rahul-sharma', freelancerName: 'Rahul Sharma', freelancerRole: 'Frontend Developer', coverLetter: 'I have 3+ years of React experience and have built similar e-commerce platforms.', budget: '₹22,000', timeline: '25 days', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'prop-seed-2', jobId: 'uiux-saas-dashboard', jobTitle: 'UI/UX Designer for SaaS Dashboard', clientId: 'client-jane', freelancerId: 'aditi-rao', freelancerName: 'Aditi Rao', freelancerRole: 'UI/UX Designer', coverLetter: 'I specialize in SaaS dashboard design and have built several analytics UIs.', budget: '₹13,500', timeline: '18 days', status: 'pending', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'prop-seed-3', jobId: 'mobile-app-react-native', jobTitle: 'Mobile App UI — React Native', clientId: 'client-jane', freelancerId: 'rahul-sharma', freelancerName: 'Rahul Sharma', freelancerRole: 'Frontend Developer', coverLetter: 'I have experience with React Native and can implement all 12 screens.', budget: '₹18,000', timeline: '15 days', status: 'approved', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ]);
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}, ${d.toLocaleString('en', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}

function statusBadge(status) {
  const map = { pending: ['#f59e0b', '#fffbeb', 'Pending'], approved: ['#1dbf73', '#f0fdf7', 'Approved'], rejected: ['#dc2626', '#fef2f2', 'Rejected'] };
  const [color, bg, label] = map[status] || ['#888', '#f5f5f5', status];
  return `<span class="db-status-badge" style="color:${color};background:${bg}">${label}</span>`;
}

// ── FREELANCER DASHBOARD ──────────────────────────────────────────────────────
function buildFreelancerDash(session) {
  seedDefaultProposals();
  const myProposals = getProposals().filter((p) => p.freelancerId === (session.id || session.email));
  const invites = getHireRequests().filter((r) => r.toFreelancerId === (session.id || session.email));
  // Badge only for truly new invites needing freelancer action
  const pendingInvites = invites.filter((r) => r.status === 'pending');

  const avatar = session.avatar
    ? `<img src="${session.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<span style="font-size:1.4rem;font-weight:800;color:#fff">${session.name?.charAt(0).toUpperCase()}</span>`;

  return `
    <div class="db-hero">
      <div class="db-hero-left">
        <div class="db-hero-avatar">${avatar}</div>
        <div>
          <h1 class="db-title">Welcome back, ${session.name}!</h1>
          <p class="db-sub">${session.skill || 'Freelancer'}</p>
        </div>
      </div>
      <span class="db-mode-badge">● Freelancer Mode</span>
    </div>

    <div class="db-stats">
      <div class="db-stat-card">
        <div class="db-stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="db-stat-num">${myProposals.length}</div>
        <div class="db-stat-label">Proposals Sent</div>
      </div>
      <div class="db-stat-card">
        <div class="db-stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="db-stat-num">${invites.length}</div>
        <div class="db-stat-label">Invites Received</div>
      </div>
      <div class="db-stat-card">
        <div class="db-stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="db-stat-num" style="color:#1dbf73">${invites.filter((r) => r.status === 'accepted' || r.status === 'counter_accepted').length}</div>
        <div class="db-stat-label">Hired</div>
      </div>
    </div>

    <a href="/browse-projects" class="db-browse-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Browse Projects
    </a>

    <div class="db-tabs-wrap">
      <div class="db-tabs">
        <button class="db-tab active" data-tab="invites">
          Invites${pendingInvites.length > 0 ? ` <span class="db-tab-badge-red">${pendingInvites.length}</span>` : ''}
        </button>
        <button class="db-tab" data-tab="proposals">My Proposals</button>
        <button class="db-tab" data-tab="saved">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Saved Projects
        </button>
        <button class="db-tab" data-tab="contracts">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          My Contracts
        </button>
      </div>

      <div class="db-panel active" id="db-panel-invites">
        ${invites.length === 0 ? `
          <div class="db-empty"><p>No invites yet. Complete your profile so clients can find and hire you!</p></div>
        ` : invites.map((r) => `
          <div class="db-invite-card ${r.status !== 'pending' ? 'db-invite-responded' : ''}" id="inv-${r.id}">
            <div class="db-invite-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#1dbf73" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              PROJECT INVITE FROM ${r.fromClientName?.toUpperCase() || 'CLIENT'}
            </div>
            <h3 class="db-invite-title">${r.title}</h3>
            <div class="db-invite-meta">${r.freelancerRole || session.skill || 'Freelancer'} · ${r.budget} · ${r.timeline}</div>
            ${r.skills?.length ? `<div class="db-invite-skills">${r.skills.map((s) => `<span class="db-skill">${s}</span>`).join('')}</div>` : ''}
            ${r.status === 'pending' ? `
              <div class="db-invite-actions">
                <button class="db-view-btn" data-hr-view="${r.id}">View Details</button>
                <button class="db-approve-btn" data-hr="${r.id}" data-action="accepted">Accept</button>
                <button class="db-counter-toggle" data-hr-counter="${r.id}">Counter</button>
                <button class="db-reject-btn" data-hr="${r.id}" data-action="declined">Reject</button>
              </div>
              <div class="db-counter-form" id="counter-${r.id}" style="display:none">
                <h4 class="db-counter-title">Counter Offer</h4>
                <div class="db-counter-row">
                  <div class="db-counter-field">
                    <label>Your Price (₹) *</label>
                    <input type="text" class="db-counter-price" placeholder="e.g. 18000">
                  </div>
                  <div class="db-counter-field">
                    <label>Timeline *</label>
                    <input type="text" class="db-counter-time" placeholder="e.g. 3 weeks">
                  </div>
                </div>
                <div class="db-counter-field">
                  <label>Note to client</label>
                  <textarea class="db-counter-note" rows="3" placeholder="Explain why you're adjusting the price or timeline..."></textarea>
                </div>
                <div class="db-counter-btns">
                  <button class="db-counter-submit" data-hr="${r.id}">Send Counter Offer</button>
                  <button class="db-counter-cancel" data-hr-cancel="${r.id}">Cancel</button>
                </div>
              </div>
            ` : ''}
            ${r.status === 'accepted' ? `<div class="db-approved-msg">✓ You accepted this invite. Get in touch with ${r.fromClientName} to start!</div>` : ''}
            ${r.status === 'declined' ? `<div class="db-rejected-msg">You declined this invite.</div>` : ''}
            ${r.status === 'counter_pending' ? `<div class="db-counter-sent-msg">Counter sent — ${r.counterBudget} · ${r.counterTimeline}. Client is reviewing.</div>` : ''}
            ${r.status === 'counter_accepted' ? `<div class="db-approved-msg">✓ Client accepted your counter. You're hired! Get in touch: ${r.fromClientName}</div>` : ''}
            ${r.status === 'counter_declined' ? `<div class="db-rejected-msg">Client declined your counter offer.</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="db-panel" id="db-panel-proposals">
        ${myProposals.length === 0 ? `
          <div class="db-empty"><p>No proposals yet. <a href="/browse-projects">Browse open projects</a> and apply!</p></div>
        ` : myProposals.map((p) => `
          <div class="db-proposal-card">
            <div class="db-proposal-top">
              <div>
                <div class="db-proposal-title">${p.jobTitle}</div>
                <div class="db-proposal-meta">Proposed: ${p.budget} · ${p.timeline} · ${timeAgo(p.createdAt)}</div>
              </div>
              ${statusBadge(p.status)}
            </div>
            <p class="db-proposal-cover">${p.coverLetter}</p>
            ${p.status === 'approved' ? `<div class="db-approved-msg">✓ Congratulations! Your proposal was accepted.</div>` : ''}
            ${p.status === 'rejected' ? `<div class="db-rejected-msg">This proposal wasn't selected. Keep applying!</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="db-panel" id="db-panel-saved">
        ${(() => {
    const uid = session.id || session.email;
    const saved = (() => { try { return JSON.parse(localStorage.getItem(`sb_saved_proj_${uid}`)) || []; } catch { return []; } })();
    if (saved.length === 0) return '<div class="db-empty"><p>No saved projects yet. Click the bookmark icon on any job in Browse Projects.</p></div>';
    return saved.map((p) => `
          <div class="db-proposal-card">
            <div class="db-proposal-top">
              <div>
                <div class="db-proposal-title">${p.title}</div>
                <div class="db-proposal-meta">${p.client} · ${p.budget} · ${p.deadline}</div>
              </div>
              <a href="/browse-projects" class="db-status-badge" style="color:#1dbf73;background:#f0fdf7;text-decoration:none">Apply →</a>
            </div>
            <p class="db-proposal-cover">${(p.desc || '').substring(0, 120)}${p.desc?.length > 120 ? '…' : ''}</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${(p.skills || []).map((s) => `<span class="db-skill">${s}</span>`).join('')}</div>
          </div>
        `).join('');
  })()}
      </div>

      <div class="db-panel" id="db-panel-contracts">
        <div class="db-empty"><p>Contracts will appear here once a hire is finalised.</p></div>
      </div>
    </div>
  `;
}

// ── CLIENT DASHBOARD ──────────────────────────────────────────────────────────
function buildClientDash(session) {
  seedDefaultProposals();
  const allUsers = (() => { try { return JSON.parse(localStorage.getItem('sb_users_v1')) || []; } catch { return []; } })();
  const isJane = session.id === 'client-jane';
  const myJobsFromSeed = isJane ? SEED_JOBS : [];
  const myJobsFromLS = (() => { try { return JSON.parse(localStorage.getItem(`sb_posted_jobs_${session.id}`) || '[]'); } catch { return []; } })();
  const myJobs = [...myJobsFromSeed, ...myJobsFromLS];

  const allProposals = getProposals();
  const myProposals = allProposals.filter((p) => p.clientId === session.id || isJane);
  const sentRequests = getHireRequests().filter((r) => r.fromClientId === session.id);
  const activeResponses = sentRequests.filter((r) => r.status !== 'pending');
  const savedFreelancers = getFavourites(session.id);

  const avatar = session.avatar
    ? `<img src="${session.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : `<span style="font-size:1.4rem;font-weight:800;color:#fff">${session.name?.charAt(0).toUpperCase()}</span>`;

  const defaultTab = (activeResponses.length > 0 || myProposals.filter((p) => p.status === 'pending').length > 0) ? 'responses' : 'projects';

  return `
    <div class="db-hero">
      <div class="db-hero-left">
        <div class="db-hero-avatar">${avatar}</div>
        <div>
          <h1 class="db-title">Welcome back, ${session.name.split(' ')[0]}!</h1>
          <p class="db-sub">Manage your projects and proposals</p>
        </div>
      </div>
      <span class="db-mode-badge db-mode-client">● Client Mode</span>
    </div>

    <div class="db-stats">
      <div class="db-stat-card"><div class="db-stat-num">${myJobs.length}</div><div class="db-stat-label">Projects Posted</div></div>
      <div class="db-stat-card"><div class="db-stat-num">${myProposals.length}</div><div class="db-stat-label">Total Proposals</div></div>
      <div class="db-stat-card"><div class="db-stat-num">${savedFreelancers.length}</div><div class="db-stat-label">Favourite Freelancers</div></div>
    </div>

    <div class="db-tabs-wrap">
      <div class="db-tabs">
        <button class="db-tab ${defaultTab === 'projects' ? 'active' : ''}" data-tab="projects">My Posted Projects</button>
        <button class="db-tab ${defaultTab === 'responses' ? 'active' : ''}" data-tab="responses">
          Responses${(activeResponses.length + myProposals.filter((p) => p.status === 'pending').length) > 0 ? ` <span class="db-tab-badge-red">${activeResponses.length + myProposals.filter((p) => p.status === 'pending').length}</span>` : ''}
        </button>
        <button class="db-tab" data-tab="favourites">Favourite Freelancers</button>
        <button class="db-tab" data-tab="contracts">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          My Contracts
        </button>
      </div>

      <!-- My Posted Projects -->
      <div class="db-panel ${defaultTab === 'projects' ? 'active' : ''}" id="db-panel-projects">
        ${myJobs.length === 0 ? `<div class="db-empty"><p>No projects posted yet. <a href="/hire-talent">Browse talent</a> and hire someone!</p></div>` : myJobs.map((j) => {
    const count = allProposals.filter((p) => p.jobId === j.id).length;
    return `
          <div class="db-posted-card">
            <div class="db-posted-top">
              <div>
                <div class="db-posted-title">${j.title}</div>
                <div class="db-posted-meta">
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> ${j.budget}</span>
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${j.deadline}</span>
                  <span>Posted ${j.postedAt ? fmtDate(j.postedAt).split(',')[0] : 'recently'} Jul 2026</span>
                </div>
                <div class="db-job-skills">${(j.skills||[]).map((s) => `<span class="db-skill">${s}</span>`).join('')}</div>
              </div>
              <div class="db-posted-right">
                <span class="db-proposals-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  ${count} proposal${count !== 1 ? 's' : ''}
                </span>
                <span class="db-open-badge">Open</span>
                <button class="db-delete-job-btn" data-job-id="${j.id}" title="Delete project">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
  }).join('')}
      </div>

      <!-- Responses: proposals from browse-projects + hire request responses -->
      <div class="db-panel ${defaultTab === 'responses' ? 'active' : ''}" id="db-panel-responses">
        ${myProposals.length > 0 ? `
          <div style="font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">Proposals Received</div>
          ${myProposals.map((p) => `
            <div class="db-proposal-card" id="prop-${p.id}">
              <div class="db-proposal-top">
                <div>
                  <div class="db-proposal-title">${p.freelancerName} <span class="db-fl-role">· ${p.freelancerRole}</span></div>
                  <div class="db-proposal-meta">For: ${p.jobTitle} · Proposed: ${p.budget} · ${p.timeline} · ${timeAgo(p.createdAt)}</div>
                </div>
                ${statusBadge(p.status)}
              </div>
              <p class="db-proposal-cover">${p.coverLetter}</p>
              ${p.status === 'pending' ? `
                <div class="db-action-row">
                  <button class="db-approve-btn" data-prop="${p.id}">Approve</button>
                  <button class="db-counter-toggle" data-prop-counter="${p.id}">Counter Price</button>
                  <button class="db-reject-btn" data-prop="${p.id}">Reject</button>
                </div>
                <div class="db-counter-form" id="prop-counter-${p.id}" style="display:none">
                  <h4 class="db-counter-title">Counter Offer</h4>
                  <div class="db-counter-row">
                    <div class="db-counter-field"><label>Your Budget *</label><input type="text" class="db-counter-price" placeholder="e.g. ₹12,000"></div>
                    <div class="db-counter-field"><label>Timeline *</label><input type="text" class="db-counter-time" placeholder="e.g. 3 weeks"></div>
                  </div>
                  <div class="db-counter-btns">
                    <button class="db-counter-submit db-prop-counter-submit" data-prop="${p.id}">Send Counter</button>
                    <button class="db-counter-cancel" data-prop-cancel="${p.id}">Cancel</button>
                  </div>
                </div>
              ` : ''}
              ${p.status === 'countered' ? `<div class="db-counter-sent-msg">Counter sent — ${p.counterBudget} · ${p.counterTimeline}. Waiting for freelancer response.</div>` : ''}
              ${p.status === 'approved' ? `<div class="db-approved-msg">✓ Approved. Contact the freelancer to get started!</div>` : ''}
              ${p.status === 'rejected' ? `<div class="db-rejected-msg">Rejected.</div>` : ''}
            </div>
          `).join('')}
          ${sentRequests.length > 0 ? `<div style="font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin:20px 0 12px">Hire Invites Sent</div>` : ''}
        ` : ''}
        ${sentRequests.length === 0 && myProposals.length === 0 ? `
          <div class="db-empty"><p>No responses yet. Post a project or send hire invites to freelancers.</p></div>
        ` : sentRequests.map((r) => {
    const freelancer = allUsers.find((u) => u.id === r.toFreelancerId);
    const avatarSrc = freelancer?.avatar;
    const fl = avatarSrc
      ? `<img src="${avatarSrc}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0">`
      : `<div style="width:40px;height:40px;border-radius:50%;background:#1dbf73;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;flex-shrink:0">${r.toFreelancerName?.charAt(0)}</div>`;
    return `
          <div class="db-response-card" id="resp-${r.id}">
            <div class="db-response-top">
              <div style="display:flex;align-items:center;gap:12px">
                ${fl}
                <div>
                  <div class="db-response-name">${r.toFreelancerName}</div>
                  <div class="db-response-meta">${r.title} · ${fmtDate(r.createdAt)}</div>
                </div>
              </div>
              ${r.status === 'counter_pending' ? `<span class="db-counter-badge">↔ Counter Offer</span>` : ''}
            </div>
            ${r.status === 'counter_pending' ? `
              <div class="db-response-counter">
                <span class="db-counter-amount">${r.counterBudget}</span>
                <span> &nbsp; Timeline: ${r.counterTimeline}</span>
              </div>
              <p class="db-response-note">Counter offer from ${r.toFreelancerName}.</p>
              <div class="db-invite-actions">
                <button class="db-approve-btn" data-resp="${r.id}" data-action="counter_accepted">Accept</button>
                <button class="db-counter-toggle" data-resp-counter="${r.id}">Counter</button>
                <button class="db-reject-btn" data-resp="${r.id}" data-action="counter_declined">Decline</button>
              </div>
              <div class="db-counter-form" id="resp-counter-${r.id}" style="display:none">
                <h4 class="db-counter-title">Counter Offer</h4>
                <div class="db-counter-row">
                  <div class="db-counter-field"><label>Your Budget *</label><input type="text" class="db-counter-price" placeholder="e.g. ₹20,000"></div>
                  <div class="db-counter-field"><label>Timeline *</label><input type="text" class="db-counter-time" placeholder="e.g. 3 weeks"></div>
                </div>
                <div class="db-counter-btns">
                  <button class="db-counter-submit db-resp-counter-submit" data-resp="${r.id}">Send Counter</button>
                  <button class="db-counter-cancel" data-resp-cancel="${r.id}">Cancel</button>
                </div>
              </div>
            ` : ''}
            ${r.status === 'pending' ? `<div class="db-response-note" style="color:#888">Invite sent. Waiting for ${r.toFreelancerName} to respond.</div>` : ''}
            ${r.status === 'accepted' || r.status === 'counter_accepted' ? `
              <div class="db-accepted-msg">
                ✓ Accepted — Get in touch with <strong>${r.toFreelancerName}</strong>
                ${r.toFreelancerEmail ? ` via <a href="mailto:${r.toFreelancerEmail}" style="color:#1dbf73">${r.toFreelancerEmail}</a>` : ''}
                ${r.toFreelancerLinkedin ? ` · <a href="${r.toFreelancerLinkedin}" target="_blank" style="color:#1dbf73">LinkedIn</a>` : ''}
              </div>
            ` : ''}
            ${r.status === 'declined' ? `<div class="db-rejected-msg">${r.toFreelancerName} declined this invite.</div>` : ''}
            ${r.status === 'counter_declined' ? `<div class="db-rejected-msg">You declined ${r.toFreelancerName}'s counter offer.</div>` : ''}
          </div>
        `;
  }).join('')}
      </div>

      <!-- Favourite Freelancers -->
      <div class="db-panel" id="db-panel-favourites">
        ${savedFreelancers.length === 0 ? `
          <div class="db-empty"><p>No saved freelancers yet. Click ★ Save to Favourites on any profile to add them here.</p></div>
        ` : `
          <div class="db-jobs-grid">
            ${savedFreelancers.map((u) => `
              <a href="${u.profileHref || '#'}" class="db-saved-card" style="text-decoration:none;color:inherit">
                <div class="db-saved-avatar"><span>${(u.name||'?').charAt(0).toUpperCase()}</span></div>
                <div class="db-saved-name">${u.name}</div>
                <div class="db-saved-role">${u.role || 'Freelancer'}</div>
                ${u.rate ? `<div class="db-saved-rate">${u.rate}</div>` : ''}
                <div class="db-saved-btn">View Profile →</div>
              </a>
            `).join('')}
          </div>
        `}
      </div>

      <!-- My Contracts: accepted hires -->
      <div class="db-panel" id="db-panel-contracts">
        ${sentRequests.filter((r) => r.status === 'accepted' || r.status === 'counter_accepted').length === 0 ? `
          <div class="db-empty"><p>No active contracts yet. Once a freelancer accepts your invite, it will appear here.</p></div>
        ` : sentRequests.filter((r) => r.status === 'accepted' || r.status === 'counter_accepted').map((r) => `
          <div class="db-proposal-card">
            <div class="db-proposal-top">
              <div>
                <div class="db-proposal-title">${r.title}</div>
                <div class="db-proposal-meta">with ${r.toFreelancerName} · ${r.budget} · ${r.timeline}</div>
              </div>
              <span class="db-status-badge" style="color:#1dbf73;background:#f0fdf7">Active</span>
            </div>
            <div class="db-accepted-msg" style="margin-top:12px">
              ✓ Get in touch with <strong>${r.toFreelancerName}</strong>
              ${r.toFreelancerEmail ? ` — <a href="mailto:${r.toFreelancerEmail}" style="color:#1dbf73">${r.toFreelancerEmail}</a>` : ''}
              ${r.toFreelancerLinkedin ? ` · <a href="${r.toFreelancerLinkedin}" target="_blank" style="color:#1dbf73">LinkedIn →</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  const session = getSession();
  if (!session) { window.location.href = '/login'; return; }

  block.innerHTML = `<div class="db-container">${session.role === 'client' ? buildClientDash(session) : buildFreelancerDash(session)}</div>`;

  // Tab switching
  const tabs = [...block.querySelectorAll('.db-tab')];
  const panels = [...block.querySelectorAll('.db-panel')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      block.querySelector(`#db-panel-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  // ── FREELANCER: Invite actions ────────────────────────────────────────────
  block.querySelectorAll('[data-hr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const reqs = getHireRequests();
      const idx = reqs.findIndex((r) => r.id === btn.dataset.hr);
      if (idx === -1) return;
      reqs[idx].status = btn.dataset.action;
      saveHireRequests(reqs);
      block.innerHTML = `<div class="db-container">${buildFreelancerDash(session)}</div>`;
      decorate(block); // re-wire
    });
  });

  // Counter toggle (show/hide form)
  block.querySelectorAll('[data-hr-counter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = block.querySelector(`#counter-${btn.dataset.hrCounter}`);
      if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  });

  block.querySelectorAll('[data-hr-cancel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = block.querySelector(`#counter-${btn.dataset.hrCancel}`);
      if (form) form.style.display = 'none';
    });
  });

  // Submit counter offer (freelancer)
  block.querySelectorAll('.db-counter-submit:not(.db-resp-counter-submit)').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = btn.closest('.db-counter-form');
      const price = form.querySelector('.db-counter-price').value.trim();
      const time = form.querySelector('.db-counter-time').value.trim();
      const note = form.querySelector('.db-counter-note')?.value.trim() || '';
      if (!price || !time) return;
      const reqs = getHireRequests();
      const idx = reqs.findIndex((r) => r.id === btn.dataset.hr);
      if (idx === -1) return;
      reqs[idx].status = 'counter_pending';
      reqs[idx].counterBudget = `₹${price.replace(/[^0-9]/g, '')}`;
      reqs[idx].counterTimeline = time;
      reqs[idx].counterNote = note;
      saveHireRequests(reqs);
      block.innerHTML = `<div class="db-container">${buildFreelancerDash(session)}</div>`;
      decorate(block);
    });
  });

  // ── CLIENT: Response actions ──────────────────────────────────────────────
  block.querySelectorAll('[data-resp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const reqs = getHireRequests();
      const idx = reqs.findIndex((r) => r.id === btn.dataset.resp);
      if (idx === -1) return;
      reqs[idx].status = btn.dataset.action;
      saveHireRequests(reqs);
      block.innerHTML = `<div class="db-container">${buildClientDash(session)}</div>`;
      decorate(block);
    });
  });

  block.querySelectorAll('[data-resp-counter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = block.querySelector(`#resp-counter-${btn.dataset.respCounter}`);
      if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  });

  block.querySelectorAll('[data-resp-cancel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = block.querySelector(`#resp-counter-${btn.dataset.respCancel}`);
      if (form) form.style.display = 'none';
    });
  });

  block.querySelectorAll('.db-resp-counter-submit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = btn.closest('.db-counter-form');
      const price = form.querySelector('.db-counter-price').value.trim();
      const time = form.querySelector('.db-counter-time').value.trim();
      if (!price || !time) return;
      const reqs = getHireRequests();
      const idx = reqs.findIndex((r) => r.id === btn.dataset.resp);
      if (idx === -1) return;
      reqs[idx].status = 'pending'; // back to pending so freelancer can respond
      reqs[idx].counterBudget = price;
      reqs[idx].counterTimeline = time;
      saveHireRequests(reqs);
      block.innerHTML = `<div class="db-container">${buildClientDash(session)}</div>`;
      decorate(block);
    });
  });

  // Approve/reject proposals (client)
  block.querySelectorAll('.db-approve-btn[data-prop]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const proposals = getProposals();
      const idx = proposals.findIndex((p) => p.id === btn.dataset.prop);
      if (idx === -1) return;
      proposals[idx].status = 'approved';
      saveProposals(proposals);
      block.innerHTML = `<div class="db-container">${buildClientDash(session)}</div>`;
      decorate(block);
    });
  });

  block.querySelectorAll('.db-reject-btn[data-prop]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const proposals = getProposals();
      const idx = proposals.findIndex((p) => p.id === btn.dataset.prop);
      if (idx === -1) return;
      proposals[idx].status = 'rejected';
      saveProposals(proposals);
      block.innerHTML = `<div class="db-container">${buildClientDash(session)}</div>`;
      decorate(block);
    });
  });

  // Delete posted project
  block.querySelectorAll('.db-delete-job-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this project? Freelancers will no longer see it.')) return;
      const jobId = btn.dataset.jobId;
      // Remove from client's own list
      const clientKey = `sb_posted_jobs_${session.id || session.email}`;
      try {
        const jobs = JSON.parse(localStorage.getItem(clientKey) || '[]').filter((j) => j.id !== jobId);
        localStorage.setItem(clientKey, JSON.stringify(jobs));
      } catch { /* empty */ }
      // Remove from global list (browse-projects)
      try {
        const all = JSON.parse(localStorage.getItem('sb_all_posted_jobs') || '[]').filter((j) => j.id !== jobId);
        localStorage.setItem('sb_all_posted_jobs', JSON.stringify(all));
      } catch { /* empty */ }
      block.innerHTML = `<div class="db-container">${buildClientDash(session)}</div>`;
      decorate(block);
    });
  });

  // Counter toggle for proposals received
  block.querySelectorAll('[data-prop-counter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = block.querySelector(`#prop-counter-${btn.dataset.propCounter}`);
      if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  });

  block.querySelectorAll('[data-prop-cancel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = block.querySelector(`#prop-counter-${btn.dataset.propCancel}`);
      if (form) form.style.display = 'none';
    });
  });

  block.querySelectorAll('.db-prop-counter-submit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = btn.closest('.db-counter-form');
      const price = form.querySelector('.db-counter-price').value.trim();
      const time = form.querySelector('.db-counter-time').value.trim();
      if (!price || !time) return;
      const proposals = getProposals();
      const idx = proposals.findIndex((p) => p.id === btn.dataset.prop);
      if (idx === -1) return;
      proposals[idx].status = 'countered';
      proposals[idx].counterBudget = price;
      proposals[idx].counterTimeline = time;
      saveProposals(proposals);
      block.innerHTML = `<div class="db-container">${buildClientDash(session)}</div>`;
      decorate(block);
    });
  });

  // View Details modal
  block.querySelectorAll('[data-hr-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = getHireRequests().find((x) => x.id === btn.dataset.hrView);
      if (!r) return;
      const m = document.createElement('div');
      m.style.cssText = 'position:fixed;inset:0;background:rgb(0 0 0/55%);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
      m.innerHTML = `<div style="background:#fff;border-radius:16px;padding:36px;max-width:520px;width:100%;position:relative">
        <button onclick="this.closest('div[style]').remove();document.body.style.overflow=''" style="position:absolute;top:14px;right:16px;background:none;border:none;font-size:1.5rem;color:#aaa;cursor:pointer">&times;</button>
        <h2 style="font-size:1.3rem;font-weight:800;margin:0 0 16px">${r.title}</h2>
        <p style="font-size:0.9rem;color:#666;margin:0 0 12px">${r.desc}</p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.88rem;color:#444">
          <span><strong>Budget:</strong> ${r.budget}</span>
          <span><strong>Timeline:</strong> ${r.timeline}</span>
          <span><strong>From:</strong> ${r.fromClientName}</span>
        </div>
      </div>`;
      document.body.appendChild(m);
      document.body.style.overflow = 'hidden';
      m.addEventListener('click', (e) => { if (e.target === m) { m.remove(); document.body.style.overflow = ''; } });
    });
  });
}
