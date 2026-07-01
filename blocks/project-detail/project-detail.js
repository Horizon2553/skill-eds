const ICONS = {
  arrow: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  eye: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
};

function rowLabel(row) {
  return row.children[0]?.textContent.trim().toLowerCase() || '';
}

export default async function decorate(block) {
  const rows = [...block.children];

  let title = '';
  const images = [];
  let tags = [];
  let desc = '';
  let author = {
    name: '', avatarEl: null, role: '', profileHref: '', views: '',
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    const label = rowLabel(row);

    if (label === 'title') {
      title = cells[1]?.textContent.trim() || '';
    } else if (label === 'images') {
      cells.slice(1).forEach((cell) => {
        const img = cell.querySelector('picture, img');
        if (img) images.push(img.cloneNode(true));
      });
    } else if (label === 'tags') {
      tags = (cells[1]?.textContent.trim() || '').split(',').map((t) => t.trim()).filter(Boolean);
    } else if (label === 'desc') {
      desc = cells[1]?.textContent.trim() || '';
    } else if (label === 'author') {
      author = {
        name: cells[1]?.textContent.trim() || '',
        avatarEl: cells[2]?.querySelector('picture, img')?.cloneNode(true) || null,
        role: cells[3]?.textContent.trim() || '',
        profileHref: cells[4]?.querySelector('a')?.href || '',
        views: cells[5]?.textContent.trim() || '',
      };
    }
  });

  if (!title) return;

  block.innerHTML = `
    <button class="pd-back" onclick="history.back()">${ICONS.back} Back</button>

    <div class="pd-layout">
      <div class="pd-gallery">
        <div class="pd-main-image"></div>
        ${images.length > 1 ? '<div class="pd-thumbs"></div>' : ''}
      </div>

      <aside class="pd-sidebar">
        ${tags.length ? `<div class="pd-tags">${tags.map((t) => `<span class="pd-tag">${t}</span>`).join('')}</div>` : ''}
        <h1 class="pd-title">${title}</h1>
        <p class="pd-desc">${desc}</p>

        ${author.name ? `
          <a href="${author.profileHref || '#'}" class="pd-author-card">
            <div class="pd-author-avatar"></div>
            <div class="pd-author-info">
              <strong>${author.name}</strong>
              <span>${author.role}</span>
            </div>
            <span class="pd-author-cta">View Profile ${ICONS.arrow}</span>
          </a>
        ` : ''}

        ${author.views ? `
          <div class="pd-stats">
            <div class="pd-stat">${ICONS.eye}<span>${author.views}</span><small>views</small></div>
          </div>
        ` : ''}

        ${author.profileHref ? `
          <a href="${author.profileHref}" class="pd-hire-btn">
            Hire ${author.name.split(' ')[0]} ${ICONS.arrow}
          </a>
        ` : ''}
      </aside>
    </div>
  `;

  const mainWrap = block.querySelector('.pd-main-image');
  if (images[0]) mainWrap.append(images[0]);

  if (images.length > 1) {
    const thumbsWrap = block.querySelector('.pd-thumbs');
    images.forEach((imgEl, i) => {
      const btn = document.createElement('button');
      btn.className = `pd-thumb${i === 0 ? ' active' : ''}`;
      btn.setAttribute('aria-label', `Image ${i + 1}`);
      btn.append(imgEl.cloneNode(true));
      btn.addEventListener('click', () => {
        mainWrap.innerHTML = '';
        mainWrap.append(imgEl.cloneNode(true));
        thumbsWrap.querySelectorAll('.pd-thumb').forEach((t) => t.classList.remove('active'));
        btn.classList.add('active');
      });
      thumbsWrap.append(btn);
    });
  }

  if (author.avatarEl) {
    block.querySelector('.pd-author-avatar')?.append(author.avatarEl);
  }
}
