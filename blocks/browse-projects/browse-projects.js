const ICONS = {
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  clock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  users: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  empty: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
};

function buildJobCard(j) {
  const badgeClass = j.budgetType.toLowerCase() === 'hourly' ? 'bp-badge-hourly' : 'bp-badge-fixed';
  const initial = j.client.charAt(0).toUpperCase();
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
        <a href="${j.applyHref}" class="bp-apply-btn">Submit Proposal</a>
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  const rows = [...block.children];
  let pageTitle = 'Browse Projects';
  let pageSubtitle = 'Discover live projects posted by clients. Submit your proposal and start earning.';
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
    jobs.push({
      title: cells[0]?.textContent.trim() || '',
      client: cells[1]?.textContent.trim() || '',
      posted: cells[2]?.textContent.trim() || '',
      budget: cells[3]?.textContent.trim() || '',
      budgetType: cells[4]?.textContent.trim() || 'Fixed',
      deadline: cells[5]?.textContent.trim() || '',
      proposals: cells[6]?.textContent.trim() || '0',
      desc: cells[7]?.textContent.trim() || '',
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      category: cells[9]?.textContent.trim() || 'General',
      applyHref: cells[10]?.querySelector('a')?.href || '/signup',
    });
  });

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
        <hr class="bp-filter-divider">
        <div class="bp-post-cta-banner">
          <h3>Have a project?</h3>
          <p>Post it for free and receive proposals from skilled freelancers.</p>
          <a href="/post-project" class="bp-post-cta-btn">Post a Project</a>
        </div>
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
    list.innerHTML = matches.map(buildJobCard).join('');
  }

  searchInput.addEventListener('input', render);
  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  render();
}
