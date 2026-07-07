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

function buildJobCard(j, session, appliedIds, freeUsed) {
  const badgeClass = j.budgetType.toLowerCase() === 'hourly' ? 'bp-badge-hourly' : 'bp-badge-fixed';
  const initial = j.client.charAt(0).toUpperCase();
  const hasApplied = appliedIds.has(j.id);
  const isFreelancer = session?.role === 'freelancer';

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
        <span class="bp-badge bp-badge-open">Open</span>
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

export default async function decorate(block) {
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
