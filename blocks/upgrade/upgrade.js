export default async function decorate(block) {
  const rows = [...block.children];
  let title = 'Upgrade to Submit More Proposals';
  let subtitle = 'Your first proposal was free. Pick a plan below to keep applying.';
  const plans = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const firstCell = cells[0];
    if (!firstCell) return;
    const isBold = !!firstCell.querySelector('strong, b');

    if (isBold) {
      title = firstCell.textContent.trim();
      subtitle = cells[1]?.textContent.trim() || subtitle;
    } else {
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
          <div class="up-card ${p.popular ? 'up-card-popular' : ''}" data-plan-name="${p.name}">
            <div class="up-card-header">
              <span class="up-card-name">${p.name}</span>
              ${p.popular ? '<span class="up-popular-badge">Popular</span>' : ''}
            </div>
            <div class="up-card-price">${p.price}<span class="up-period">${p.period}</span></div>
            <div class="up-card-highlight">${p.highlight}</div>
            <ul class="up-card-features">
              ${p.features.map((f) => `<li>${f}</li>`).join('')}
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

  const cards = [...block.querySelectorAll('.up-card')];

  function selectCard(card) {
    cards.forEach((c) => c.classList.remove('up-card-selected'));
    card.classList.add('up-card-selected');
    const planName = card.dataset.planName;
    const plan = plans.find((p) => p.name === planName);
    if (plan) sessionStorage.setItem('sh_selected_plan', JSON.stringify(plan));
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => selectCard(card));
  });

  block.querySelectorAll('.up-cta-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const planName = btn.dataset.plan;
      const plan = plans.find((p) => p.name === planName);
      if (plan) {
        sessionStorage.setItem('sh_selected_plan', JSON.stringify(plan));
        window.location.href = '/payment';
      }
    });
  });
}
