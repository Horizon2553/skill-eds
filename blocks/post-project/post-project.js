function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function getPostedJobs(clientId) {
  try { return JSON.parse(localStorage.getItem(`sb_posted_jobs_${clientId}`)) || []; } catch { return []; }
}
function savePostedJobs(clientId, jobs) {
  localStorage.setItem(`sb_posted_jobs_${clientId}`, JSON.stringify(jobs));
}
function canPostFree(session) {
  if (!session) return false;
  if (session.activePlan) return true; // paid plan = unlimited
  return getPostedJobs(session.id || session.email).length === 0; // 0 posts = free slot
}

const STEPS = [
  'Write a Clear Title',
  'Describe Requirements in Detail',
  'Add Relevant Skills',
  'Set a Realistic Budget',
  'Define a Clear Timeline',
  'Post & Receive Proposals',
];

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design / UI/UX', 'Backend Development', 'Full-Stack Development', 'Data Science / AI', 'Content Writing', 'Digital Marketing', 'Other / General'];

const TIMELINES = ['Less than 1 week', '1–2 weeks', '2–4 weeks', '1–2 months', '3–6 months', '6+ months'];

export default async function decorate(block) {
  const rows = [...block.children];
  let heroTitle = 'Create your Project Brief';
  let heroSub = 'Describe your project and receive tailored proposals from top freelancers.';
  let viewPlansText = 'View Plans';

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells[0]) return;
    if (cells[0].querySelector('strong, b')) {
      heroTitle = cells[0].textContent.trim();
      heroSub = cells[1]?.textContent.trim() || heroSub;
      viewPlansText = cells[2]?.textContent.trim() || viewPlansText;
    }
  });

  const session = getSession();
  const isClient = session?.role === 'client';
  const isFreelancer = session?.role === 'freelancer';

  block.innerHTML = `
    <div class="pp-hero">
      <div class="pp-hero-inner">
        <div class="pp-hero-text">
          <h1>${heroTitle}</h1>
          <p>${heroSub}</p>
        </div>
        <a href="/upgrade" class="pp-view-plans-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ${viewPlansText}
        </a>
      </div>
    </div>

    <div class="pp-body">
      <div class="pp-left">

        ${!session ? `
          <div class="pp-gate">
            <p>Please <a href="/login">log in</a> or <a href="/signup">create a client account</a> to post a project.</p>
          </div>
        ` : isFreelancer ? `
          <div class="pp-gate pp-gate-freelancer">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            <h3>This page is for Clients</h3>
            <p>You're logged in as a freelancer. Switch to a client account to post projects.</p>
            <a href="/browse-projects" class="pp-gate-link">Browse Projects Instead →</a>
          </div>
        ` : `
          <div class="pp-form-card" id="pp-form-card">
            <h2>Project Details</h2>
            <p class="pp-form-sub">Be specific — detailed descriptions attract better proposals.</p>

            <form id="pp-form" novalidate>
              <div class="pp-section-label">WHO IS POSTING?</div>
              <div class="pp-group">
                <label>Posting As</label>
                <div class="pp-poster-toggle">
                  <button type="button" class="pp-toggle-btn active" data-type="individual">Individual</button>
                  <button type="button" class="pp-toggle-btn" data-type="company">Company / Organization</button>
                </div>
              </div>
              <div class="pp-group" id="pp-company-group" style="display:none">
                <label for="pp-company">Company Name <span class="pp-opt">(optional)</span></label>
                <input type="text" id="pp-company" placeholder="e.g. TechCorp Solutions">
              </div>

              <div class="pp-section-label">PROJECT INFO</div>
              <div class="pp-group">
                <label for="pp-title">Project Title <span class="pp-req">*</span></label>
                <input type="text" id="pp-title" placeholder="e.g. Build a React E-Commerce Website" maxlength="100" required>
                <div class="pp-hint">Be specific and concise (max 100 chars)</div>
              </div>
              <div class="pp-group">
                <label for="pp-category">Category <span class="pp-req">*</span></label>
                <select id="pp-category" required>
                  <option value="">Select a category...</option>
                  ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div class="pp-group">
                <label for="pp-desc">Project Description <span class="pp-req">*</span></label>
                <textarea id="pp-desc" rows="6" placeholder="Describe your project in detail — deliverables, requirements, preferred tech stack, and any other relevant context." required></textarea>
              </div>
              <div class="pp-group">
                <label>Required Skills <span class="pp-opt">(press Enter or comma to add)</span></label>
                <div class="pp-skills-wrap" id="pp-skills-wrap">
                  <input type="text" id="pp-skills-input" placeholder="e.g. React, Node.js, Python...">
                </div>
              </div>

              <div class="pp-section-label">BUDGET &amp; TIMELINE</div>
              <div class="pp-two-col">
                <div class="pp-group">
                  <label for="pp-budget-type">Budget Type <span class="pp-req">*</span></label>
                  <select id="pp-budget-type" required>
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Hourly Rate">Hourly Rate</option>
                  </select>
                </div>
                <div class="pp-group">
                  <label for="pp-budget" id="pp-budget-label">Budget (₹) <span class="pp-req">*</span></label>
                  <input type="number" id="pp-budget" min="100" step="100" placeholder="e.g. 15000" required>
                </div>
              </div>
              <div class="pp-group">
                <label for="pp-timeline">Timeline <span class="pp-req">*</span></label>
                <select id="pp-timeline" required>
                  <option value="">Select timeline...</option>
                  ${TIMELINES.map((t) => `<option value="${t}">${t}</option>`).join('')}
                  <option value="custom">Other (write your own)</option>
                </select>
                <input type="text" id="pp-timeline-custom" placeholder="e.g. 10 days, 3 weeks..." style="display:none;margin-top:8px;width:100%;box-sizing:border-box;padding:11px 14px;border:1.5px solid #e0e0e0;border-radius:10px;font-family:var(--body-font-family);font-size:0.93rem;outline:none">
              </div>

              <p class="pp-err" id="pp-err"></p>
              <button type="submit" class="pp-submit-btn">Create Project Brief →</button>
            </form>
          </div>

          <div class="pp-success" id="pp-success" style="display:none">
            <div class="pp-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>Project Posted!</h2>
            <p>Your project is now live. Freelancers will start sending proposals soon.</p>
            <div class="pp-success-btns">
              <a href="/dashboard" class="pp-browse-btn">Go to Dashboard</a>
              <button type="button" id="pp-post-another" class="pp-another-btn">Post Another</button>
            </div>
          </div>
        `}
      </div>

      <aside class="pp-sidebar">
        <h3>Steps to a Great Post</h3>
        <ol class="pp-steps">
          ${STEPS.map((s, i) => `
            <li class="pp-step${i === 0 ? ' pp-step-active' : ''}">
              <div class="pp-step-num">${i + 1}</div>
              <span>${s}</span>
            </li>
          `).join('')}
        </ol>
      </aside>
    </div>
  `;

  if (!session || isFreelancer) return;

  // If free slot already used and no plan — show upgrade prompt inline
  if (!canPostFree(session)) {
    block.querySelector('#pp-form-card').innerHTML = `
      <div style="text-align:center;padding:48px 0">
        <div style="width:64px;height:64px;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 style="font-size:1.3rem;font-weight:800;margin:0 0 10px">You've used your free project post</h2>
        <p style="font-size:0.95rem;color:#888;margin:0 0 28px;line-height:1.6">Upgrade to post unlimited projects and receive more proposals.</p>
        <a href="/upgrade" style="display:inline-block;padding:13px 32px;background:#1dbf73;color:#fff;border-radius:99px;font-weight:700;font-size:0.95rem;text-decoration:none">View Plans →</a>
      </div>
    `;
    return;
  }

  // Poster toggle
  const toggleBtns = [...block.querySelectorAll('.pp-toggle-btn')];
  const companyGroup = block.querySelector('#pp-company-group');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      companyGroup.style.display = btn.dataset.type === 'company' ? 'block' : 'none';
    });
  });

  // Skills tag input
  const skillsWrap = block.querySelector('#pp-skills-wrap');
  const skillsInput = block.querySelector('#pp-skills-input');
  const skills = [];

  function addSkill(val) {
    const s = val.trim().replace(/,/g, '');
    if (!s || skills.includes(s)) return;
    skills.push(s);
    const chip = document.createElement('span');
    chip.className = 'pp-skill-chip';
    chip.innerHTML = `${s}<button type="button" aria-label="Remove">&times;</button>`;
    chip.querySelector('button').addEventListener('click', () => {
      skills.splice(skills.indexOf(s), 1);
      chip.remove();
    });
    skillsWrap.insertBefore(chip, skillsInput);
  }

  skillsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillsInput.value);
      skillsInput.value = '';
    }
  });

  skillsInput.addEventListener('blur', () => {
    if (skillsInput.value.trim()) { addSkill(skillsInput.value); skillsInput.value = ''; }
  });

  // Custom timeline toggle
  const timelineSel = block.querySelector('#pp-timeline');
  const timelineCustom = block.querySelector('#pp-timeline-custom');
  timelineSel.addEventListener('change', () => {
    timelineCustom.style.display = timelineSel.value === 'custom' ? 'block' : 'none';
    if (timelineSel.value === 'custom') timelineCustom.focus();
  });

  // Budget type label
  block.querySelector('#pp-budget-type').addEventListener('change', (e) => {
    const label = block.querySelector('#pp-budget-label');
    label.innerHTML = e.target.value === 'Hourly Rate'
      ? 'Hourly Rate (₹/hr) <span class="pp-req">*</span>'
      : 'Budget (₹) <span class="pp-req">*</span>';
  });

  // Step highlighter
  const stepEls = [...block.querySelectorAll('.pp-step')];
  const fieldOrder = ['pp-title', 'pp-category', 'pp-desc', 'pp-skills-input', 'pp-budget', 'pp-timeline'];
  fieldOrder.forEach((id, idx) => {
    block.querySelector(`#${id}`)?.addEventListener('focus', () => {
      stepEls.forEach((s, i) => s.classList.toggle('pp-step-active', i === idx));
    });
  });

  // Form submit
  block.querySelector('#pp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = block.querySelector('#pp-err');
    errEl.textContent = '';

    const title = block.querySelector('#pp-title').value.trim();
    const category = block.querySelector('#pp-category').value;
    const desc = block.querySelector('#pp-desc').value.trim();
    const budgetType = block.querySelector('#pp-budget-type').value;
    const budgetAmt = block.querySelector('#pp-budget').value.trim();
    const timelineRaw = block.querySelector('#pp-timeline').value;
    const timeline = timelineRaw === 'custom'
      ? block.querySelector('#pp-timeline-custom').value.trim()
      : timelineRaw;

    if (!title || !category || !desc || !budgetAmt || !timeline) {
      errEl.textContent = 'Please fill in all required fields.';
      return;
    }

    // Paywall check
    if (!canPostFree(session)) {
      window.location.href = '/upgrade';
      return;
    }

    const job = {
      id: `job-${Date.now()}`,
      clientId: session.id || session.email,
      clientName: session.name,
      title,
      desc,
      category,
      skills: [...skills],
      budget: budgetType === 'Hourly Rate' ? `₹${budgetAmt}/hr` : `₹${budgetAmt}`,
      budgetType,
      deadline: timeline,
      postedAt: new Date().toISOString(),
      status: 'open',
    };

    const jobs = getPostedJobs(session.id || session.email);
    jobs.push(job);
    savePostedJobs(session.id || session.email, jobs);
    // Also save to global list so browse-projects page shows it
    try {
      const all = JSON.parse(localStorage.getItem('sb_all_posted_jobs') || '[]');
      all.unshift(job); // newest first
      localStorage.setItem('sb_all_posted_jobs', JSON.stringify(all));
    } catch { /* quota */ }

    // Show success
    block.querySelector('#pp-form-card').style.display = 'none';
    block.querySelector('#pp-success').style.display = 'block';
    stepEls.forEach((s, i) => s.classList.toggle('pp-step-active', i === 5));

    // Post Another — check paywall first
    block.querySelector('#pp-post-another').addEventListener('click', () => {
      const freshSession = getSession();
      if (!canPostFree(freshSession)) {
        window.location.href = '/upgrade';
        return;
      }
      block.querySelector('#pp-form-card').style.display = 'block';
      block.querySelector('#pp-success').style.display = 'none';
      block.querySelector('#pp-form').reset();
      skills.length = 0;
      skillsWrap.querySelectorAll('.pp-skill-chip').forEach((c) => c.remove());
      stepEls.forEach((s, i) => s.classList.toggle('pp-step-active', i === 0));
    });
  });
}
