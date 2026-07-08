export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: optional video URL (link href or plain text)
  const videoCell = rows[0]?.children[0];
  const videoSrc = videoCell?.querySelector('a')?.href
    || videoCell?.textContent?.trim()
    || '/blocks/hero/hero_video.webm';

  // Row 1: headings — hire (cell 0) | work (cell 1)
  // Only use authored content if it contains an explicit <br> (Shift+Enter in da.live),
  // otherwise use the default which has the intended line break.
  const hireHeadingEl = rows[1]?.children[0];
  const workHeadingEl = rows[1]?.children[1];
  const hireHeading = hireHeadingEl?.querySelector('br')
    ? (hireHeadingEl.querySelector('p,h1,h2')?.innerHTML || hireHeadingEl.innerHTML)
    : 'Grow at the speed<br>of your ambition.';
  const workHeading = workHeadingEl?.querySelector('br')
    ? (workHeadingEl.querySelector('p,h1,h2')?.innerHTML || workHeadingEl.innerHTML)
    : 'The future of work<br>is yours';

  // Row 2: subtexts — hire (cell 0) | work (cell 1)
  const hireSubtext = rows[2]?.children[0]?.textContent?.trim()
    || 'Browse freelancers and hire the right person.';
  const workSubtext = rows[2]?.children[1]?.textContent?.trim()
    || 'The freelance platform designed for the highly-skilled, highly-ambitious, and AI-fluent.';

  // Row 3: CTA links — hire (cell 0) | work (cell 1)
  const hireCTALink = rows[3]?.children[0]?.querySelector('a');
  const workCTALink = rows[3]?.children[1]?.querySelector('a');

  // Row 4: trending tags — <a> links preferred, fall back to space-separated text
  const trendingCell = rows[4]?.children[0];
  const trendingLinks = [...(trendingCell?.querySelectorAll('a') || [])];
  const trendingTags = (trendingLinks.length
    ? trendingLinks.map((a) => ({ text: a.textContent.trim(), href: a.href }))
    : (trendingCell?.textContent?.trim() || '').split(/\s+/).filter(Boolean)
        .map((t) => ({ text: t, href: `/hire-talent?skills=${encodeURIComponent(t)}` })))
    .filter((t) => t.text.toLowerCase() !== 'ai');

  block.innerHTML = `
    <video class="hero-video-bg" muted loop playsinline preload="none" poster="/blocks/hero/hero-poster.jpg" fetchpriority="high" data-src="${videoSrc}">
      <source data-src="${videoSrc}" type="video/webm">
    </video>
    <div class="hero-content">
      <div class="hero-toggle-wrapper">
        <div class="hero-toggle-pill">
          <button class="hero-toggle-btn active" data-mode="hire">Hire</button>
          <button class="hero-toggle-btn" data-mode="work">Work</button>
        </div>
      </div>
      <div class="hero-text-container">
        <h1 class="hero-heading-new">${hireHeading}</h1>
        <p class="hero-subtext-new">${hireSubtext}</p>
      </div>
      <div class="hero-cta-container">
        <div class="hero-cta-hire">
          <div class="hero-search-pill">
            <input type="text" placeholder="Search for a skill e.g. React, UI/UX, Python..." class="hero-search-input-pill" aria-label="Search for a skill">
            <a href="${hireCTALink?.href || '/hire-talent'}" class="hero-btn-talent">${hireCTALink?.textContent?.trim() || 'Find Talent'}</a>
          </div>
        </div>
        <div class="hero-cta-work" style="display:none;">
          <a href="${workCTALink?.href || '/browse-projects'}" class="hero-btn-opportunities">${workCTALink?.textContent?.trim() || 'Get Hired'}</a>
        </div>
      </div>
      ${trendingTags.length ? `
      <div class="hero-trending">
        <span class="trending-label">Trending:</span>
        ${trendingTags.map((t) => `<a href="${t.href}" class="trending-tag">${t.text}</a>`).join('')}
      </div>` : ''}
    </div>
  `;

  const headingEl = block.querySelector('.hero-heading-new');
  const subtextEl = block.querySelector('.hero-subtext-new');
  const hireCTA = block.querySelector('.hero-cta-hire');
  const workCTA = block.querySelector('.hero-cta-work');
  const toggleBtns = block.querySelectorAll('.hero-toggle-btn');

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const isHire = btn.dataset.mode === 'hire';
      headingEl.innerHTML = isHire ? hireHeading : workHeading;
      subtextEl.textContent = isHire ? hireSubtext : workSubtext;
      hireCTA.style.display = isHire ? 'flex' : 'none';
      workCTA.style.display = isHire ? 'none' : 'flex';
      const trending = block.querySelector('.hero-trending');
      if (trending) trending.style.display = isHire ? '' : 'none';
    });
  });

  const searchInput = block.querySelector('.hero-search-input-pill');
  const findBtn = block.querySelector('.hero-btn-talent');
  const navigate = () => {
    const q = searchInput.value.trim();
    if (q) window.location.href = `/hire-talent?skills=${encodeURIComponent(q)}`;
  };
  searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });
  findBtn?.addEventListener('click', (e) => {
    if (searchInput?.value.trim()) { e.preventDefault(); navigate(); }
  });

  // Lazy-load video after LCP to avoid blocking performance score
  const video = block.querySelector('.hero-video-bg');
  if (video) {
    const loadVideo = () => {
      const src = video.dataset.src;
      if (src) {
        video.querySelector('source').src = src;
        video.load();
        video.play().catch(() => {});
      }
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadVideo, { timeout: 2000 });
    } else {
      setTimeout(loadVideo, 1000);
    }
  }
}
