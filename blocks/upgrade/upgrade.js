export default async function decorate(block) {
  const rows = [...block.children];
  let title = 'Upgrade to Submit More Proposals';
  let subtitle = 'Your first proposal was free. Pick a plan below to keep applying.';
  const plans = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const firstCell = cells[0];
    const isBold = !!firstCell.querySelector('strong, b');

    if (isBold) {
      // Header row — title | subtitle
      title = firstCell.textContent.trim();
      subtitle = cells[1]?.textContent.trim() || subtitle;
    } else {
      // Plan row — name | price | period | highlight | features | cta | popular
      const name = cells[0]?.textContent.trim() || '';
      if (!name) return;
      const featuresRaw = cells[4]?.textContent.trim() || '';
      plans.push({
        name,
        price: cells[1]?.textContent.trim() || '',
        period: cells[2]?.textContent.trim() || '',
        highlight: cells[3]?.textContent.trim() || '',
        features: featuresRaw.split(',').map((f) => f.trim()).filter(Boolean),
        cta: cells[5]?.textContent.trim() || 'Get Started',
        popular: (cells[6]?.textContent.trim().toLowerCase() || '') === 'popular',
      });
    }
  });

  const summary = plans.map((p) => `<strong>${p.name}</strong> — ${p.highlight} for ${p.price}${p.period}`).join(' &nbsp;·&nbsp; ');

  block.innerHTML = `
    <div class="up-page">
      <div class="up-hero">
        <div class="up-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h1 class="up-title">${title}</h1>
        <p class="up-sub">${subtitle}</p>
        ${summary ? `<p class="up-plans-summary">${summary}</p>` : ''}
      </div>

      <div class="up-cards">
        ${plans.map((p) => `
          <div class="up-card ${p.popular ? 'up-card-popular' : ''}">
            ${p.popular ? '<span class="up-popular-badge">Popular</span>' : ''}
            <div class="up-card-name">${p.name}</div>
            <div class="up-card-price">${p.price}<span class="up-period">${p.period}</span></div>
            <div class="up-card-highlight">${p.highlight}</div>
            <ul class="up-card-features">
              ${p.features.map((f) => `
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ${f}
                </li>
              `).join('')}
            </ul>
            <button class="up-cta-btn ${p.popular ? 'up-cta-primary' : 'up-cta-secondary'}" data-plan="${p.name}">
              ${p.cta}
            </button>
          </div>
        `).join('')}
      </div>

      <p class="up-back"><a href="/browse-projects">← Back to Browse Projects</a></p>
    </div>
  `;

  block.querySelectorAll('.up-cta-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:13px 24px;border-radius:99px;font-size:0.88rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgb(0 0 0/25%);text-align:center;max-width:340px';
      toast.textContent = `${btn.dataset.plan} plan selected — payment integration coming soon!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    });
  });
}
