const ICONS = {
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  arrow: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
};

function rowLabel(row) {
  return row.children[0]?.textContent.trim().toLowerCase() || '';
}

export default async function decorate(block) {
  const rows = [...block.children];
  let hero = null;
  let about = '';
  let skills = [];
  let contact = { email: '', linkedin: '', github: '' };
  const projects = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const label = rowLabel(row);

    if (label === 'hero') {
      hero = {
        avatarEl: cells[1]?.querySelector('picture, img')?.cloneNode(true) || null,
        name: cells[2]?.textContent.trim() || '',
        role: cells[3]?.textContent.trim() || '',
        availability: cells[4]?.textContent.trim() || 'Available',
        rating: cells[5]?.textContent.trim() || '',
        reviews: cells[6]?.textContent.trim() || '',
      };
    } else if (label === 'about') {
      about = cells[1]?.textContent.trim() || '';
    } else if (label === 'skills') {
      skills = (cells[1]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean);
    } else if (label === 'contact') {
      contact = {
        email: cells[1]?.textContent.trim() || '',
        linkedin: cells[2]?.querySelector('a')?.href || '',
        github: cells[3]?.querySelector('a')?.href || '',
      };
    } else if (label === 'project') {
      projects.push({
        title: cells[1]?.textContent.trim() || '',
        thumbEl: cells[2]?.querySelector('picture, img')?.cloneNode(true) || null,
        desc: cells[3]?.textContent.trim() || '',
        tech: (cells[4]?.textContent.trim() || '').split(',').map((s) => s.trim()).filter(Boolean),
        link: cells[5]?.querySelector('a')?.href || '',
      });
    }
  });

  if (!hero) return;

  const isAvailable = hero.availability.toLowerCase() === 'available';

  block.innerHTML = `
    <div class="pf-hero">
      <div class="pf-hero-left">
        <div class="pf-avatar-wrap"></div>
        <div class="pf-hero-info">
          <span class="pf-badge ${isAvailable ? 'pf-badge-available' : 'pf-badge-other'}">${hero.availability}</span>
          <h1 class="pf-name">${hero.name}</h1>
          <div class="pf-role">${hero.role}</div>
          ${hero.rating ? `
            <div class="pf-rating-row">
              ${ICONS.star}
              <strong>${hero.rating}</strong>
              ${hero.reviews ? `<span class="pf-review-count">(${hero.reviews} review${hero.reviews === '1' ? '' : 's'})</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="pf-grid">
      <aside class="pf-sidebar">
        <div class="pf-card">
          <h2>About Me</h2>
          <p class="pf-about-text">${about}</p>
        </div>
        ${skills.length ? `
          <div class="pf-card">
            <h2>Technical Skills</h2>
            <div class="pf-skills-tags">
              ${skills.map((s) => `<span class="pf-skill-tag">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${(contact.email || contact.linkedin || contact.github) ? `
          <div class="pf-card">
            <h2>Contact Details</h2>
            <ul class="pf-contact-list">
              ${contact.email ? `<li class="pf-contact-item"><span class="pf-contact-label">Email</span><a href="mailto:${contact.email}" class="pf-contact-link">${contact.email}</a></li>` : ''}
              ${contact.linkedin ? `<li class="pf-contact-item"><span class="pf-contact-label">LinkedIn</span><a href="${contact.linkedin}" target="_blank" rel="noopener" class="pf-contact-link">View LinkedIn Profile</a></li>` : ''}
              ${contact.github ? `<li class="pf-contact-item"><span class="pf-contact-label">GitHub</span><a href="${contact.github}" target="_blank" rel="noopener" class="pf-contact-link">View GitHub Profile</a></li>` : ''}
            </ul>
          </div>
        ` : ''}
      </aside>

      <div class="pf-main">
        <h2>Projects &amp; Work <span class="pf-project-count">${projects.length} total</span></h2>
        <div class="pf-projects-list">
          ${projects.length === 0 ? '<p class="pf-no-projects">No projects yet.</p>' : projects.map((p) => `
            <a ${p.link ? `href="${p.link}"` : 'href="#" onclick="return false;"'} class="pf-project-card">
              <div class="pf-project-thumb"></div>
              <div class="pf-project-info">
                ${p.tech.length ? `<div class="pf-project-tags">${p.tech.map((t) => `<span class="pf-tech-tag">${t}</span>`).join('')}</div>` : ''}
                <h3>${p.title}</h3>
                <p class="pf-project-desc">${p.desc}</p>
                <div class="pf-view-details">View details ${ICONS.arrow}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const avatarWrap = block.querySelector('.pf-avatar-wrap');
  if (hero.avatarEl) {
    hero.avatarEl.classList.add('pf-avatar');
    avatarWrap.append(hero.avatarEl);
  }

  const thumbEls = block.querySelectorAll('.pf-project-thumb');
  thumbEls.forEach((thumb, i) => {
    if (projects[i]?.thumbEl) thumb.append(projects[i].thumbEl);
  });
}
