const ICONS = {
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  star: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  briefcase: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
  chevron: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  empty: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
};

function buildCard(c) {
  const card = document.createElement('div');
  card.className = 'ht-card';

  const visibleSkills = c.skills.slice(0, 4);
  const extraCount = c.skills.length - visibleSkills.length;
  const skillPills = visibleSkills.map((s) => `<span class="ht-skill">${s}</span>`).join('');
  const hiddenPills = c.skills.slice(4).map((s) => `<span class="ht-skill ht-skill-hidden" style="display:none">${s}</span>`).join('');
  const moreBtn = extraCount > 0
    ? `<button type="button" class="ht-skill-more">+${extraCount} ${ICONS.chevron}</button>`
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
      ${c.reviews ? `<span class="ht-sep">·</span>${ICONS.star}<span class="ht-rating">${c.rating}</span><span class="ht-review-cnt">(${c.reviews})</span>` : ''}
      <span class="ht-sep">·</span>${ICONS.briefcase}<span class="ht-jobs">${c.projects} project${c.projects === '1' ? '' : 's'}</span>
    </div>
  `;
  top.append(avatarWrap, info);

  const bio = document.createElement('p');
  bio.className = 'ht-bio';
  bio.textContent = c.bio;

  const skillsWrap = document.createElement('div');
  skillsWrap.className = 'ht-skills';
  skillsWrap.innerHTML = skillPills + hiddenPills + moreBtn;

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

function renderEmptyState() {
  const empty = document.createElement('div');
  empty.className = 'ht-empty-state';
  empty.innerHTML = `
    <div class="ht-empty-icon">${ICONS.empty}</div>
    <h3>No freelancers found</h3>
    <p>Try clearing some filters or searching for a different skill or keyword.</p>
  `;
  return empty;
}

export default async function decorate(block) {
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
    const avatarEl = firstCell.querySelector('picture, img')?.cloneNode(true) || null;
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

  // Unique skill list across all candidates, alphabetical
  const allSkills = [...new Set(candidates.flatMap((c) => c.skills))].sort((a, b) => a.localeCompare(b));

  block.innerHTML = `
    <div class="ht-hero">
      <div class="ht-hero-inner">
        <h1 class="ht-hero-title">${pageTitle}</h1>
        ${ctaLink ? `<a href="${ctaLink.href}" class="ht-hero-btn">${ICONS.plus} ${ctaLink.textContent.trim()}</a>` : ''}
      </div>
    </div>
    <div class="ht-page-wrap">
      <aside class="ht-sidebar">
        <div class="ht-sidebar-top">
          <h2>Filters</h2>
          <button type="button" class="ht-clear-all">Clear All</button>
        </div>
        <div class="ht-search-wrapper">
          ${ICONS.search}
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
      grid.append(renderEmptyState());
      return;
    }
    matches.forEach((c) => {
      const cardData = { ...c, avatarEl: c.avatarEl?.cloneNode(true) || null };
      grid.append(buildCard(cardData));
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

  filterAndRender();
}
