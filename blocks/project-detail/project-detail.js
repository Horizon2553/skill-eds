function formatCount(n) {
  if (!n) return '0';
  const num = parseInt(String(n).replace(/,/g, ''), 10);
  if (Number.isNaN(num)) return '0';
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(num);
}

function getLiked() {
  try { return JSON.parse(localStorage.getItem('sb_liked_projects')) || []; } catch { return []; }
}

export default async function decorate(block) {
  const data = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells[0]?.textContent.trim().toLowerCase();
    if (!key) return;
    if (key === 'images') {
      data.images = cells.slice(1)
        .map((c) => c.querySelector('code')?.textContent.trim() || c.textContent.trim())
        .filter(Boolean);
    } else if (key === 'author') {
      data.authorName = cells[1]?.textContent.trim() || '';
      data.authorImg = cells[2]?.querySelector('code')?.textContent.trim() || cells[2]?.textContent.trim() || '';
      data.authorRole = cells[3]?.textContent.trim() || '';
      const aEl = cells[4]?.querySelector('a');
      data.authorLink = aEl?.getAttribute('href') || aEl?.href || '';
      data.likes = cells[5]?.textContent.trim() || '0';
      data.views = cells[6]?.textContent.trim() || '';
    } else {
      data[key] = cells[1]?.textContent.trim() || '';
    }
  });

  const tags = (data.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  const images = data.images || [];
  const likesNum = parseInt(String(data.likes).replace(/,/g, ''), 10) || 0;
  const viewsNum = data.views
    ? parseInt(String(data.views).replace(/,/g, ''), 10)
    : Math.round(likesNum * 5.5);
  const pageKey = window.location.pathname;
  const isLiked = getLiked().includes(pageKey);

  const thumbsHtml = images.length > 1
    ? `<div class="pd-thumbs">
        ${images.map((src, i) => `
          <div class="pd-thumb${i === 0 ? ' active' : ''}" data-idx="${i}" data-src="${src}">
            <img src="${src}" alt="Image ${i + 1}" loading="lazy">
          </div>`).join('')}
      </div>`
    : '';

  block.innerHTML = `
    <div class="pd-page">
      <a href="javascript:history.back()" class="pd-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Projects
      </a>

      <div class="pd-layout">
        <!-- LEFT: Gallery -->
        <div class="pd-gallery">
          <div class="pd-main-wrap">
            <img src="${images[0] || ''}" alt="${data.title || 'Project'}" id="pd-main-img" loading="eager">
          </div>
          ${thumbsHtml}
        </div>

        <!-- RIGHT: Sidebar -->
        <aside class="pd-sidebar">
          <h1 class="pd-title">${data.title || ''}</h1>
          <div class="pd-tags">
            ${tags.map((t) => `<span class="pd-tag">${t}</span>`).join('')}
          </div>
          <p class="pd-desc">${data.desc || ''}</p>

          ${data.authorName ? `
            <a href="${data.authorLink || '#'}" class="pd-author">
              ${data.authorImg ? `<img src="${data.authorImg}" alt="${data.authorName}" class="pd-author-avatar">` : ''}
              <div class="pd-author-info">
                <div class="pd-author-name">${data.authorName}</div>
                <div class="pd-author-role">${data.authorRole}</div>
              </div>
            </a>
          ` : ''}

          <div class="pd-stats">
            <div class="pd-stat"><span class="pd-stat-val" id="pd-likes-val">${formatCount(likesNum)}</span><span class="pd-stat-label">Likes</span></div>
            <div class="pd-stat"><span class="pd-stat-val">${formatCount(viewsNum)}</span><span class="pd-stat-label">Views</span></div>
            <div class="pd-stat"><span class="pd-stat-val">${images.length}</span><span class="pd-stat-label">Images</span></div>
          </div>

          <div class="pd-actions">
            <button class="pd-like-btn${isLiked ? ' liked' : ''}" id="pd-like-btn">
              <svg viewBox="0 0 24 24" fill="${isLiked ? '#1dbf73' : 'none'}" stroke="${isLiked ? '#1dbf73' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ${isLiked ? 'Liked' : 'Like this Shot'}
            </button>
            ${data.authorLink ? `<a href="${data.authorLink}" class="pd-profile-btn">View ${data.authorName?.split(' ')[0] || 'Profile'}'s Profile &rarr;</a>` : ''}
          </div>
        </aside>
      </div>
    </div>
  `;

  // Thumbnail switching
  block.querySelectorAll('.pd-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.src;
      const mainImg = block.querySelector('#pd-main-img');
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => { mainImg.src = src; mainImg.style.opacity = '1'; }, 180);
      }
      block.querySelectorAll('.pd-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Like toggle
  block.querySelector('#pd-like-btn')?.addEventListener('click', () => {
    const liked = getLiked();
    const btn = block.querySelector('#pd-like-btn');
    const valEl = block.querySelector('#pd-likes-val');
    const nowLiked = liked.includes(pageKey);
    const newLiked = nowLiked ? liked.filter((x) => x !== pageKey) : [...liked, pageKey];
    localStorage.setItem('sb_liked_projects', JSON.stringify(newLiked));
    const newCount = nowLiked ? likesNum - 1 : likesNum + 1;
    if (valEl) valEl.textContent = formatCount(newCount);
    const heart = nowLiked
      ? 'fill="none" stroke="currentColor"'
      : 'fill="#1dbf73" stroke="#1dbf73"';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" ${heart} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      ${nowLiked ? 'Like this Shot' : 'Liked'}
    `;
    btn.classList.toggle('liked', !nowLiked);
  });
}
