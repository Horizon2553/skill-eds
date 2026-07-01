function extractImage(cell) {
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
    return img;
  }
  return null;
}

const SVG = {
  projects: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  freelancers: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  bookmark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="#f59e0b" width="13" height="13"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
};

function buildProjectCard(p) {
  const card = document.createElement('a');
  card.className = 'fw-project-card';
  card.href = p.href || '#';

  const thumb = document.createElement('div');
  thumb.className = 'fw-project-thumb';
  if (p.imgEl) thumb.append(p.imgEl);

  const overlay = document.createElement('div');
  overlay.className = 'fw-project-overlay';
  overlay.innerHTML = `
    <span class="fw-project-overlay-title">${p.title}</span>
    <button class="fw-project-save-btn" onclick="event.preventDefault()">${SVG.bookmark} Save</button>
  `;
  thumb.append(overlay);

  const footer = document.createElement('div');
  footer.className = 'fw-project-footer';
  const author = document.createElement('div');
  author.className = 'fw-project-author';
  if (p.avatarEl) {
    p.avatarEl.classList.add('fw-project-avatar');
    author.append(p.avatarEl);
  }
  author.insertAdjacentHTML('beforeend', `<span class="fw-project-author-name">${p.author}</span>`);
  footer.innerHTML = `<div class="fw-project-stats"><span>${SVG.heart} ${p.likes}</span><span>${SVG.eye} ${p.views}</span></div>`;
  footer.prepend(author);

  card.append(thumb, footer);
  return card;
}

function buildFreelancerCard(f) {
  const card = document.createElement('div');
  card.className = 'fw-freelancer-card';

  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'fw-fl-avatar-wrap';
  if (f.avatarEl) {
    f.avatarEl.classList.add('fw-fl-avatar');
    avatarWrap.append(f.avatarEl);
  }
  avatarWrap.insertAdjacentHTML('beforeend', '<span class="fw-fl-online"></span>');

  const info = document.createElement('div');
  info.className = 'fw-fl-info';
  info.innerHTML = `
    <div class="fw-fl-name">${f.name}</div>
    <div class="fw-fl-role">${f.role}</div>
    <div class="fw-fl-meta">
      <span class="fw-fl-rate">${f.rate}</span>
      <span class="fw-fl-sep">·</span>
      ${SVG.star}
      <span class="fw-fl-rating">${f.rating}</span>
      <span class="fw-fl-reviews">(${f.reviews})</span>
    </div>
  `;

  const top = document.createElement('div');
  top.className = 'fw-fl-top';
  top.append(avatarWrap, info);

  const bio = document.createElement('p');
  bio.className = 'fw-fl-bio';
  bio.textContent = f.bio;

  const skillsWrap = document.createElement('div');
  skillsWrap.className = 'fw-fl-skills';
  const MAX_SKILLS = 4;
  f.skills.slice(0, MAX_SKILLS).forEach((s) => {
    const pill = document.createElement('span');
    pill.className = 'fw-fl-skill';
    pill.textContent = s;
    skillsWrap.append(pill);
  });
  if (f.skills.length > MAX_SKILLS) {
    const more = document.createElement('span');
    more.className = 'fw-fl-skill-more';
    more.textContent = `+${f.skills.length - MAX_SKILLS} ›`;
    skillsWrap.append(more);
  }

  const btn = document.createElement('a');
  btn.className = 'fw-fl-profile-btn';
  btn.href = f.profileHref;
  btn.textContent = 'See Profile';

  card.append(top, bio, skillsWrap, btn);
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const sections = [];
  let currentSection = null;
  let ctaLink = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const firstCell = cells[0];
    const hasBold = !!firstCell.querySelector('strong, b');
    const hasImage = !!(firstCell.querySelector('picture, img') || extractImage(firstCell));
    const firstAnchor = firstCell.querySelector('a');
    const isCTA = !hasBold && !hasImage && firstAnchor
      && cells.slice(1).every((c) => !c.textContent.trim() && !c.querySelector('a'));

    if (hasBold && !hasImage) {
      currentSection = {
        id: firstCell.textContent.trim().toLowerCase().replace(/\s+/g, '-'),
        label: firstCell.textContent.trim(),
        title: cells[1]?.textContent.trim() || '',
        subtitle: cells[2]?.textContent.trim() || '',
        cards: [],
      };
      sections.push(currentSection);
    } else if (isCTA) {
      ctaLink = firstAnchor;
    } else if (hasImage && currentSection) {
      const imgEl = extractImage(firstCell);
      if (currentSection.label.toLowerCase().includes('project')) {
        currentSection.cards.push({
          imgEl,
          href: cells[1]?.querySelector('a')?.href || '#',
          title: cells[1]?.textContent.trim() || '',
          author: cells[2]?.textContent.trim() || '',
          avatarEl: extractImage(cells[3]),
          likes: cells[4]?.textContent.trim() || '',
          views: cells[5]?.textContent.trim() || '',
        });
      } else {
        // Extract only text nodes from skills cell — AEM may inject picture elements
        const skillsCell = cells[7];
        const skillsText = skillsCell
          ? [...skillsCell.childNodes]
            .filter((n) => n.nodeType === Node.TEXT_NODE
              || (n.nodeType === Node.ELEMENT_NODE && !['IMG', 'PICTURE', 'SOURCE'].includes(n.tagName?.toUpperCase())))
            .map((n) => n.textContent)
            .join('')
            .trim()
          : '';
        currentSection.cards.push({
          avatarEl: imgEl,
          name: cells[1]?.textContent.trim() || '',
          role: cells[2]?.textContent.trim() || '',
          rate: cells[3]?.textContent.trim() || '',
          rating: cells[4]?.textContent.trim() || '',
          reviews: cells[5]?.textContent.trim() || '',
          bio: cells[6]?.textContent.trim() || '',
          skills: skillsText.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
          profileHref: cells[8]?.querySelector('a')?.href || '#',
        });
      }
    }
  });

  block.innerHTML = '';

  // Header
  const initialSection = sections[0] || { title: 'Featured Work', subtitle: '' };
  const header = document.createElement('div');
  header.className = 'fw-header';

  const textWrap = document.createElement('div');
  textWrap.innerHTML = `
    <h2 class="fw-title">${initialSection.title}</h2>
    <p class="fw-subtitle">${initialSection.subtitle}</p>
  `;

  const tabNav = document.createElement('div');
  tabNav.className = 'fw-tabs';
  sections.forEach((sec, i) => {
    const icon = sec.label.toLowerCase().includes('project') ? SVG.projects : SVG.freelancers;
    const btn = document.createElement('button');
    btn.className = `fw-tab-btn${i === 0 ? ' active' : ''}`;
    btn.dataset.idx = i;
    btn.innerHTML = `${icon} ${sec.label}`;
    tabNav.append(btn);
  });

  header.append(textWrap, tabNav);
  block.append(header);

  // Panels
  sections.forEach((sec, i) => {
    const panel = document.createElement('div');
    panel.className = `fw-panel${i === 0 ? ' active' : ''}`;
    panel.dataset.idx = i;

    const isProjects = sec.label.toLowerCase().includes('project');
    const grid = document.createElement('div');
    grid.className = isProjects ? 'fw-projects-grid' : 'fw-freelancers-grid';

    sec.cards.forEach((card) => {
      grid.append(isProjects ? buildProjectCard(card) : buildFreelancerCard(card));
    });

    panel.append(grid);
    block.append(panel);
  });

  // CTA
  if (ctaLink) {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'fw-cta';
    const a = document.createElement('a');
    a.className = 'fw-cta-btn';
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent.trim();
    ctaWrap.append(a);
    block.append(ctaWrap);
  }

  // Tab switching with dynamic title
  const titleEl = block.querySelector('.fw-title');
  const subtitleEl = block.querySelector('.fw-subtitle');

  tabNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.fw-tab-btn');
    if (!btn) return;
    const idx = +btn.dataset.idx;
    block.querySelectorAll('.fw-tab-btn').forEach((b) => b.classList.remove('active'));
    block.querySelectorAll('.fw-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    block.querySelector(`.fw-panel[data-idx="${idx}"]`).classList.add('active');
    if (sections[idx]) {
      titleEl.textContent = sections[idx].title;
      subtitleEl.textContent = sections[idx].subtitle;
    }
  });
}
