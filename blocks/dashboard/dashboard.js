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

// Seed jobs — same content as browse-projects page
const SEED_JOBS = [
  { id: 'react-ecommerce-frontend', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Build a React E-Commerce Frontend', desc: 'Looking for an experienced React developer to build the frontend for our e-commerce platform. Product listing, cart, checkout, and user profile pages. Must be responsive.', budget: '₹25,000', budgetType: 'fixed', skills: ['React', 'JavaScript', 'CSS', 'HTML'], deadline: '30 days', category: 'Web Development', postedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'uiux-saas-dashboard', clientId: 'client-jane', clientName: 'Jane Doe', title: 'UI/UX Designer for SaaS Dashboard', desc: 'We need a UI/UX designer to redesign our analytics dashboard. Wireframes, high-fidelity mockups, and a complete design system.', budget: '₹15,000', budgetType: 'fixed', skills: ['UI/UX', 'AI', 'Prototyping', 'Design Systems'], deadline: '21 days', category: 'Design', postedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'python-backend-api', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Python Backend API Development', desc: 'Need a skilled Python developer to build REST APIs using Django/FastAPI for our mobile application.', budget: '₹800/hr', budgetType: 'hourly', skills: ['Python', 'Django', 'REST API', 'PostgreSQL'], deadline: '45 days', category: 'Backend Development', postedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'mobile-app-react-native', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Mobile App UI — React Native', desc: 'Building a fitness tracking app. Need a React Native developer to implement 12 UI screens from our designs.', budget: '₹20,000', budgetType: 'fixed', skills: ['React Native', 'JavaScript', 'Mobile', 'Expo'], deadline: '20 days', category: 'Mobile Development', postedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'fullstack-nodejs', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Full-Stack Web App with Node.js', desc: 'Need a full-stack developer to build a web application with Node.js backend and React frontend. Auth, dashboard, and data export.', budget: '₹40,000', budgetType: 'fixed', skills: ['Node.js', 'React', 'MongoDB', 'Express'], deadline: '60 days', category: 'Web Development', postedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'brand-identity-logo', clientId: 'client-jane', clientName: 'Jane Doe', title: 'Brand Identity & Logo Design', desc: 'Need a creative designer to create a complete brand identity for our startup. Logo, color palette, typography, and brand guidelines.', budget: '₹8,000', budgetType: 'fixed', skills: ['Branding', 'Illustrator', 'Typography'], deadline: '14 days', category: 'Design', postedAt: new Date(Date.now() - 6 * 3600000).toISOString() },
];

// Seed default proposals so the demo isn't empty
function seedDefaultProposals() {
  const existing = getProposals();
  if (existing.length > 0) return;
  saveProposals([
    { id: 'prop-seed-1', jobId: 'react-ecommerce-frontend', jobTitle: 'Build a React E-Commerce Frontend', clientId: 'client-jane', freelancerId: 'rahul-sharma', freelancerName: 'Rahul Sharma', freelancerRole: 'Frontend Developer', coverLetter: 'I have 3+ years of React experience and have built similar e-commerce platforms. I can deliver a pixel-perfect, responsive storefront with smooth cart animations and fast load times.', budget: '₹22,000', timeline: '25 days', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'prop-seed-2', jobId: 'uiux-saas-dashboard', jobTitle: 'UI/UX Designer for SaaS Dashboard', clientId: 'client-jane', freelancerId: 'aditi-rao', freelancerName: 'Aditi Rao', freelancerRole: 'UI/UX Designer', coverLetter: 'I specialize in SaaS dashboard design and have built several analytics UIs. I work with Figma, Webflow, and can deliver a complete design system with component library.', budget: '₹13,500', timeline: '18 days', status: 'pending', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'prop-seed-3', jobId: 'mobile-app-react-native', jobTitle: 'Mobile App UI — React Native', clientId: 'client-jane', freelancerId: 'rahul-sharma', freelancerName: 'Rahul Sharma', freelancerRole: 'Frontend Developer', coverLetter: 'I have experience with React Native and can implement all 12 screens with smooth animations and proper state management.', budget: '₹18,000', timeline: '15 days', status: 'approved', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
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

function statusBadge(status) {
  const map = { pending: ['#f59e0b', '#fffbeb', 'Pending'], approved: ['#1dbf73', '#f0fdf7', 'Approved'], rejected: ['#dc2626', '#fef2f2', 'Rejected'] };
  const [color, bg, label] = map[status] || ['#888', '#f5f5f5', status];
  return `<span class="db-status-badge" style="color:${color};background:${bg}">${label}</span>`;
}

function buildFreelancerDash(session) {
  seedDefaultProposals();
  const myProposals = getProposals().filter((p) => p.freelancerId === session.id);
  const myHireRequests = getHireRequests().filter((r) => r.toFreelancerId === session.id);
  const jobs = SEED_JOBS;
  const appliedIds = new Set(myProposals.map((p) => p.jobId));

  const stats = {
    sent: myProposals.length,
    approved: myProposals.filter((p) => p.status === 'approved').length,
    pending: myProposals.filter((p) => p.status === 'pending').length,
    rejected: myProposals.filter((p) => p.status === 'rejected').length,
  };

  return `
    <div class="db-welcome">
      <div>
        <h1 class="db-title">Welcome back, ${session.name.split(' ')[0]}</h1>
        <p class="db-sub">${session.skill || 'Freelancer'} — Find work and track your proposals</p>
      </div>
      <a href="/browse-projects" class="db-cta-btn">Browse All Projects</a>
    </div>

    <div class="db-stats">
      <div class="db-stat-card"><div class="db-stat-num">${stats.sent}</div><div class="db-stat-label">Proposals Sent</div></div>
      <div class="db-stat-card"><div class="db-stat-num" style="color:#1dbf73">${stats.approved}</div><div class="db-stat-label">Approved</div></div>
      <div class="db-stat-card"><div class="db-stat-num" style="color:#f59e0b">${stats.pending}</div><div class="db-stat-label">Pending Review</div></div>
      <div class="db-stat-card"><div class="db-stat-num" style="color:#dc2626">${stats.rejected}</div><div class="db-stat-label">Rejected</div></div>
    </div>

    <div class="db-tabs">
      <button class="db-tab active" data-tab="proposals">My Proposals</button>
      <button class="db-tab" data-tab="requests">Hire Requests${myHireRequests.length > 0 ? ` <span class="db-tab-badge">${myHireRequests.length}</span>` : ''}</button>
      <button class="db-tab" data-tab="jobs">Browse Jobs</button>
    </div>

    <div class="db-panel active" id="db-panel-proposals">
      ${myProposals.length === 0 ? `
        <div class="db-empty">
          <p>No proposals yet. Browse open projects and apply!</p>
          <a href="/browse-projects" class="db-cta-btn">Browse Projects</a>
        </div>
      ` : myProposals.map((p) => `
        <div class="db-proposal-card">
          <div class="db-proposal-top">
            <div>
              <div class="db-proposal-title">${p.jobTitle}</div>
              <div class="db-proposal-meta">Budget: ${p.budget} · Timeline: ${p.timeline} · ${timeAgo(p.createdAt)}</div>
            </div>
            ${statusBadge(p.status)}
          </div>
          <p class="db-proposal-cover">${p.coverLetter}</p>
          ${p.status === 'approved' ? `<div class="db-approved-msg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Congratulations! Your proposal was accepted. The client will contact you shortly.</div>` : ''}
          ${p.status === 'rejected' ? `<div class="db-rejected-msg">Your proposal wasn't selected this time. Keep applying!</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="db-panel" id="db-panel-requests">
      ${myHireRequests.length === 0 ? `
        <div class="db-empty"><p>No hire requests yet. Clients will contact you directly when they want to hire you.</p></div>
      ` : myHireRequests.map((r) => `
        <div class="db-proposal-card" id="hr-${r.id}">
          <div class="db-proposal-top">
            <div>
              <div class="db-proposal-title">${r.title}</div>
              <div class="db-proposal-meta">From: ${r.fromClientName} · Budget: ${r.budget} · ${r.timeline} · ${timeAgo(r.createdAt)}</div>
            </div>
            ${statusBadge(r.status === 'counter_pending' ? 'pending' : r.status)}
          </div>
          <p class="db-proposal-cover">${r.desc}</p>
          ${r.status === 'pending' ? `
            <div class="db-action-row">
              <button class="db-approve-btn" data-hr="${r.id}" data-action="accept">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Accept
              </button>
              <button class="db-counter-btn" data-hr="${r.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Counter
              </button>
              <button class="db-reject-btn" data-hr="${r.id}" data-action="declined">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Decline
              </button>
            </div>
          ` : ''}
          ${r.status === 'accepted' ? `<div class="db-approved-msg"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> You accepted this hire request. The client will be in touch.</div>` : ''}
          ${r.status === 'declined' ? `<div class="db-rejected-msg">You declined this request.</div>` : ''}
          ${r.status === 'counter_pending' ? `<div class="db-counter-msg">Counter sent: ${r.counterBudget} · ${r.counterTimeline}. Waiting for client response.</div>` : ''}
          ${r.status === 'counter_accepted' ? `<div class="db-approved-msg"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Client accepted your counter. You're hired!</div>` : ''}
          ${r.status === 'counter_declined' ? `<div class="db-rejected-msg">Client declined your counter offer.</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="db-panel" id="db-panel-jobs">
      <div class="db-jobs-grid">
        ${jobs.map((j) => `
          <div class="db-job-card">
            <div class="db-job-title">${j.title}</div>
            <div class="db-job-meta">${j.clientName} · ${j.budget} · ${j.deadline}</div>
            <p class="db-job-desc">${j.desc.slice(0, 120)}…</p>
            <div class="db-job-skills">${j.skills.map((s) => `<span class="db-skill">${s}</span>`).join('')}</div>
            ${appliedIds.has(j.id)
    ? `<button class="db-apply-btn applied" disabled><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Applied</button>`
    : `<button class="db-apply-btn" data-job="${j.id}">Apply Now</button>`}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getFavourites(clientId) {
  try { return JSON.parse(localStorage.getItem(`sb_fav_${clientId}`)) || []; } catch { return []; }
}

function buildClientDash(session) {
  seedDefaultProposals();
  const myJobs = SEED_JOBS.filter((j) => j.clientId === session.id || session.id === 'client-jane');
  const allProposals = getProposals();
  const myProposals = allProposals.filter((p) => p.clientId === session.id || session.id === 'client-jane');
  const sentRequests = getHireRequests().filter((r) => r.fromClientId === session.id);
  const favIds = getFavourites(session.id);

  // Load saved freelancers from sb_users_v1 + demo names for IDs
  const allUsers = (() => { try { return JSON.parse(localStorage.getItem('sb_users_v1')) || []; } catch { return []; } })();
  const DEMO_NAMES = { 'rahul-sharma': 'Rahul Sharma', 'aditi-rao': 'Aditi Rao', 'client-jane': 'Jane Doe' };
  const savedFreelancers = favIds.map((id) => {
    const u = allUsers.find((x) => x.id === id);
    return u || { id, name: DEMO_NAMES[id] || id, skill: 'Freelancer', profileHref: `/my-profile?id=${id}` };
  }).filter((u) => u.name);

  const stats = {
    jobs: myJobs.length,
    total: myProposals.length,
    pending: myProposals.filter((p) => p.status === 'pending').length,
    hired: sentRequests.filter((r) => r.status === 'accepted' || r.status === 'counter_accepted').length,
    requests: sentRequests.length,
  };

  const defaultTab = sentRequests.length > 0 && myProposals.length === 0 ? 'sentrequests' : 'review';

  return `
    <div class="db-welcome">
      <div>
        <h1 class="db-title">Welcome back, ${session.name.split(' ')[0]} 👋</h1>
        <p class="db-sub">Client Dashboard — Manage your projects and hire talent</p>
      </div>
    </div>

    <div class="db-stats">
      <div class="db-stat-card"><div class="db-stat-num">${stats.requests}</div><div class="db-stat-label">Hire Requests Sent</div></div>
      <div class="db-stat-card"><div class="db-stat-num" style="color:#1dbf73">${stats.hired}</div><div class="db-stat-label">Hired</div></div>
      <div class="db-stat-card"><div class="db-stat-num">${stats.total}</div><div class="db-stat-label">Proposals Received</div></div>
      <div class="db-stat-card"><div class="db-stat-num">${savedFreelancers.length}</div><div class="db-stat-label">Saved Freelancers</div></div>
    </div>

    <div class="db-tabs">
      <button class="db-tab ${defaultTab === 'sentrequests' ? 'active' : ''}" data-tab="sentrequests">
        Hire Requests${sentRequests.length > 0 ? ` <span class="db-tab-badge">${sentRequests.length}</span>` : ''}
      </button>
      <button class="db-tab ${defaultTab === 'review' ? 'active' : ''}" data-tab="review">Proposals Received</button>
      <button class="db-tab" data-tab="saved">Saved Freelancers${savedFreelancers.length > 0 ? ` <span class="db-tab-badge">${savedFreelancers.length}</span>` : ''}</button>
      <button class="db-tab" data-tab="myjobs">My Projects</button>
    </div>

    <div class="db-panel ${defaultTab === 'sentrequests' ? 'active' : ''}" id="db-panel-sentrequests">
      ${sentRequests.length === 0 ? `
        <div class="db-empty"><p>No hire requests sent yet. Visit a freelancer's profile and click "Hire [Name]" to send a request.</p></div>
      ` : sentRequests.map((r) => `
        <div class="db-proposal-card" id="sr-${r.id}">
          <div class="db-proposal-top">
            <div>
              <div class="db-proposal-title">To: ${r.toFreelancerName}</div>
              <div class="db-proposal-meta">${r.title} · ${r.budget} · ${r.timeline} · ${timeAgo(r.createdAt)}</div>
            </div>
            ${statusBadge(r.status === 'counter_pending' ? 'pending' : r.status === 'accepted' ? 'approved' : r.status === 'declined' ? 'rejected' : r.status)}
          </div>
          <p class="db-proposal-cover">${r.desc}</p>
          ${r.status === 'counter_pending' ? `
            <div class="db-counter-msg">Freelancer countered: <strong>${r.counterBudget}</strong> · ${r.counterTimeline}</div>
            <div class="db-action-row" style="margin-top:12px">
              <button class="db-approve-btn" data-hr="${r.id}" data-action="counter_accepted">Accept Counter</button>
              <button class="db-reject-btn" data-hr="${r.id}" data-action="counter_declined">Decline Counter</button>
            </div>
          ` : ''}
          ${r.status === 'accepted' ? `<div class="db-approved-msg">Freelancer accepted your request. Reach out to start!</div>` : ''}
          ${r.status === 'declined' ? `<div class="db-rejected-msg">Freelancer declined this request.</div>` : ''}
          ${r.status === 'counter_accepted' ? `<div class="db-approved-msg">You accepted the counter. Start working with ${r.toFreelancerName}!</div>` : ''}
          ${r.status === 'counter_declined' ? `<div class="db-rejected-msg">You declined the counter offer.</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="db-panel ${defaultTab === 'review' ? 'active' : ''}" id="db-panel-review">
      ${myProposals.length === 0 ? `
        <div class="db-empty"><p>No proposals received yet. Your projects are live at <a href="/browse-projects">/browse-projects</a>.</p></div>
      ` : myProposals.map((p) => `
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
              <button class="db-reject-btn" data-prop="${p.id}">Reject</button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div class="db-panel" id="db-panel-saved">
      ${savedFreelancers.length === 0 ? `
        <div class="db-empty"><p>No saved freelancers yet. Click the ★ bookmark on any freelancer card to save them here.</p></div>
      ` : `
        <div class="db-jobs-grid">
          ${savedFreelancers.map((u) => `
            <a href="/my-profile?id=${u.id}" class="db-saved-card" style="text-decoration:none;color:inherit">
              <div class="db-saved-avatar">${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `<span>${(u.name||'?').charAt(0).toUpperCase()}</span>`}</div>
              <div class="db-saved-name">${u.name}</div>
              <div class="db-saved-role">${u.skill || 'Freelancer'}</div>
              ${u.hourlyRate ? `<div class="db-saved-rate">₹${u.hourlyRate}/hr</div>` : ''}
              <div class="db-saved-btn">View Profile →</div>
            </a>
          `).join('')}
        </div>
      `}
    </div>

    <div class="db-panel" id="db-panel-myjobs">
      <div class="db-jobs-grid">
        ${myJobs.length === 0 ? `<div class="db-empty"><p>No projects posted yet.</p></div>` : myJobs.map((j) => {
    const count = allProposals.filter((p) => p.jobId === j.id).length;
    return `
          <div class="db-job-card">
            <div class="db-job-title">${j.title}</div>
            <div class="db-job-meta">${j.budget} · ${j.budgetType} · ${j.deadline}</div>
            <p class="db-job-desc">${j.desc.slice(0, 120)}…</p>
            <div class="db-job-skills">${j.skills.map((s) => `<span class="db-skill">${s}</span>`).join('')}</div>
            <div class="db-job-proposal-count">${count} proposal${count !== 1 ? 's' : ''} received</div>
          </div>
        `;
  }).join('')}
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  const session = getSession();

  if (!session) {
    window.location.href = '/login';
    return;
  }

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

  // Approve / Reject buttons (client)
  block.querySelectorAll('.db-approve-btn, .db-reject-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const propId = btn.dataset.prop;
      const newStatus = btn.classList.contains('db-approve-btn') ? 'approved' : 'rejected';
      const proposals = getProposals();
      const prop = proposals.find((p) => p.id === propId);
      if (!prop) return;
      prop.status = newStatus;

      // If approving, reject all others for same job
      if (newStatus === 'approved') {
        proposals.filter((p) => p.jobId === prop.jobId && p.id !== propId).forEach((p) => { p.status = 'rejected'; });
      }
      saveProposals(proposals);

      // Update UI without reload
      const card = block.querySelector(`#prop-${propId}`);
      if (card) {
        card.querySelector('.db-action-row')?.remove();
        card.querySelector('.db-status-badge')?.outerHTML;
        const badge = card.querySelector('.db-status-badge');
        if (badge) badge.outerHTML = statusBadge(newStatus);
        const msg = document.createElement('div');
        msg.className = newStatus === 'approved' ? 'db-approved-msg' : 'db-rejected-msg';
        msg.textContent = newStatus === 'approved' ? '✓ You approved this proposal. The freelancer has been notified.' : '✗ You rejected this proposal.';
        card.append(msg);
      }
    });
  });

  // Browse jobs apply (freelancer)
  block.querySelectorAll('.db-apply-btn[data-job]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const job = SEED_JOBS.find((j) => j.id === btn.dataset.job);
      if (!job) return;
      openProposalModal(job, session, btn);
    });
  });

  function openProposalModal(job, sess, triggerBtn) {
    const modal = document.createElement('div');
    modal.id = 'db-proposal-modal';
    modal.innerHTML = `
      <div class="db-modal-overlay">
        <div class="db-modal-card">
          <button class="db-modal-close">&times;</button>
          <h2>Submit Proposal</h2>
          <p class="db-modal-job">${job.title}</p>
          <form novalidate>
            <div class="db-modal-field">
              <label>Cover Letter *</label>
              <textarea rows="5" id="dm-cover" placeholder="Why are you the best fit?" required></textarea>
            </div>
            <div class="db-modal-row">
              <div class="db-modal-field">
                <label>Your Budget *</label>
                <input type="text" id="dm-budget" placeholder="e.g. ₹15,000" required>
              </div>
              <div class="db-modal-field">
                <label>Timeline</label>
                <input type="text" id="dm-timeline" placeholder="e.g. 2 weeks">
              </div>
            </div>
            <p class="db-modal-err" id="dm-err"></p>
            <button type="submit" class="db-modal-submit">Submit Proposal</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const close = () => { modal.remove(); document.body.style.overflow = ''; };
    modal.querySelector('.db-modal-close').addEventListener('click', close);
    modal.querySelector('.db-modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });

    modal.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const cover = modal.querySelector('#dm-cover').value.trim();
      const budget = modal.querySelector('#dm-budget').value.trim();
      const timeline = modal.querySelector('#dm-timeline').value.trim();
      const err = modal.querySelector('#dm-err');
      if (!cover || !budget) { err.textContent = 'Please fill all required fields.'; return; }

      const proposals = getProposals();
      proposals.push({
        id: `prop-${Date.now()}`,
        jobId: job.id, jobTitle: job.title,
        clientId: job.clientId,
        freelancerId: sess.id, freelancerName: sess.name, freelancerRole: sess.skill || 'Freelancer',
        coverLetter: cover, budget, timeline,
        status: 'pending', createdAt: new Date().toISOString(),
      });
      saveProposals(proposals);
      close();
      if (triggerBtn) { triggerBtn.textContent = '✓ Applied'; triggerBtn.disabled = true; triggerBtn.classList.add('applied'); }
    });
  }

  // Hire request: freelancer accept/decline
  block.querySelectorAll('[data-hr][data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hrId = btn.dataset.hr;
      const action = btn.dataset.action;
      const requests = getHireRequests();
      const req = requests.find((r) => r.id === hrId);
      if (!req) return;
      req.status = action;
      saveHireRequests(requests);
      const card = block.querySelector(`#hr-${hrId}`) || block.querySelector(`#sr-${hrId}`);
      if (card) {
        card.querySelector('.db-action-row')?.remove();
        card.querySelector('.db-counter-msg + .db-action-row')?.remove();
        const msg = document.createElement('div');
        const isGood = ['accepted', 'counter_accepted'].includes(action);
        msg.className = isGood ? 'db-approved-msg' : 'db-rejected-msg';
        const messages = {
          accepted: 'You accepted this hire request. The client will be in touch.',
          declined: 'You declined this request.',
          counter_accepted: `You accepted the counter. Start working!`,
          counter_declined: 'You declined the counter offer.',
        };
        msg.textContent = messages[action] || action;
        card.append(msg);
      }
    });
  });

  // Hire request: freelancer counter
  block.querySelectorAll('.db-counter-btn[data-hr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hrId = btn.dataset.hr;
      const requests = getHireRequests();
      const req = requests.find((r) => r.id === hrId);
      if (!req) return;

      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="db-modal-overlay">
          <div class="db-modal-card">
            <button class="db-modal-close">&times;</button>
            <h2>Counter Offer</h2>
            <p class="db-modal-job">${req.title}</p>
            <div class="db-modal-row">
              <div class="db-modal-field"><label>Your Budget *</label><input type="text" id="dc-budget" placeholder="e.g. ₹30,000" value="${req.budget}"></div>
              <div class="db-modal-field"><label>Your Timeline</label><input type="text" id="dc-timeline" placeholder="e.g. 3 weeks" value="${req.timeline}"></div>
            </div>
            <div class="db-modal-field"><label>Message (optional)</label><textarea rows="3" id="dc-msg" placeholder="Explain your counter..."></textarea></div>
            <p class="db-modal-err" id="dc-err"></p>
            <button type="button" class="db-modal-submit" id="dc-submit">Send Counter Offer</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
      const close = () => { modal.remove(); document.body.style.overflow = ''; };
      modal.querySelector('.db-modal-close').addEventListener('click', close);
      modal.querySelector('.db-modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });
      modal.querySelector('#dc-submit').addEventListener('click', () => {
        const budget = modal.querySelector('#dc-budget').value.trim();
        const timeline = modal.querySelector('#dc-timeline').value.trim();
        if (!budget) { modal.querySelector('#dc-err').textContent = 'Please enter a budget.'; return; }
        req.status = 'counter_pending';
        req.counterBudget = budget;
        req.counterTimeline = timeline;
        saveHireRequests(requests);
        close();
        const card = block.querySelector(`#hr-${hrId}`);
        if (card) {
          card.querySelector('.db-action-row')?.remove();
          const msg = document.createElement('div');
          msg.className = 'db-counter-msg';
          msg.textContent = `Counter sent: ${budget} · ${timeline}. Waiting for client response.`;
          card.append(msg);
        }
      });
    });
  });
}
