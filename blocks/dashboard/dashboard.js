// Shared localStorage helpers
function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function getProposals() {
  try { return JSON.parse(localStorage.getItem('sb_proposals')) || []; } catch { return []; }
}
function saveProposals(p) { localStorage.setItem('sb_proposals', JSON.stringify(p)); }

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

function buildClientDash(session) {
  seedDefaultProposals();
  const myJobs = SEED_JOBS.filter((j) => j.clientId === session.id || session.id === 'client-jane');
  const allProposals = getProposals();
  const myProposals = allProposals.filter((p) => p.clientId === session.id || session.id === 'client-jane');

  const stats = {
    jobs: myJobs.length,
    total: myProposals.length,
    pending: myProposals.filter((p) => p.status === 'pending').length,
    approved: myProposals.filter((p) => p.status === 'approved').length,
  };

  return `
    <div class="db-welcome">
      <div>
        <h1 class="db-title">Welcome back, ${session.name.split(' ')[0]} 👋</h1>
        <p class="db-sub">Client Dashboard — Manage your projects and review proposals</p>
      </div>
    </div>

    <div class="db-stats">
      <div class="db-stat-card"><div class="db-stat-num">${stats.jobs}</div><div class="db-stat-label">Projects Posted</div></div>
      <div class="db-stat-card"><div class="db-stat-num">${stats.total}</div><div class="db-stat-label">Total Proposals</div></div>
      <div class="db-stat-card"><div class="db-stat-num" style="color:#f59e0b">${stats.pending}</div><div class="db-stat-label">Pending Review</div></div>
      <div class="db-stat-card"><div class="db-stat-num" style="color:#1dbf73">${stats.approved}</div><div class="db-stat-label">Approved</div></div>
    </div>

    <div class="db-tabs">
      <button class="db-tab active" data-tab="review">Review Proposals</button>
      <button class="db-tab" data-tab="myjobs">My Projects</button>
    </div>

    <div class="db-panel active" id="db-panel-review">
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
              <button class="db-approve-btn" data-prop="${p.id}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approve</button>
              <button class="db-reject-btn" data-prop="${p.id}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Reject</button>
            </div>
          ` : ''}
          ${p.status === 'approved' ? `<div class="db-approved-msg">✓ You approved this proposal. The freelancer has been notified.</div>` : ''}
          ${p.status === 'rejected' ? `<div class="db-rejected-msg">✗ You rejected this proposal.</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="db-panel" id="db-panel-myjobs">
      <div class="db-jobs-grid">
        ${myJobs.map((j) => {
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
}
