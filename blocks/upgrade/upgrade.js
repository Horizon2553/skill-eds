const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹499',
    period: '/post',
    highlight: '5 Proposals',
    features: ['30-day visibility', 'Up to 5 proposals', 'Basic support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹1,299',
    period: '/month',
    highlight: '15 Proposals / month',
    features: ['60-day visibility', 'Unlimited proposals', 'Featured listing'],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹3,499',
    period: '/month',
    highlight: 'Unlimited Proposals',
    features: ['90-day visibility', 'Priority support', 'Dedicated manager'],
    cta: 'Go Business',
    popular: false,
  },
];

export default async function decorate(block) {
  block.innerHTML = `
    <div class="up-page">
      <div class="up-hero">
        <div class="up-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h1 class="up-title">Upgrade to Submit More Proposals</h1>
        <p class="up-sub">Your first proposal was free. Pick a plan below to keep applying.</p>
        <p class="up-plans-summary">
          <strong>Starter</strong> — 5 proposals for ₹499 &nbsp;·&nbsp;
          <strong>Pro</strong> — 15 proposals/month for ₹1,299 &nbsp;·&nbsp;
          <strong>Business</strong> — unlimited for ₹3,499/month
        </p>
      </div>

      <div class="up-cards">
        ${PLANS.map((p) => `
          <div class="up-card ${p.popular ? 'up-card-popular' : ''}">
            ${p.popular ? '<span class="up-popular-badge">Popular</span>' : ''}
            <div class="up-card-name">${p.name}</div>
            <div class="up-card-price">${p.price}<span class="up-period">${p.period}</span></div>
            <div class="up-card-highlight">${p.highlight}</div>
            <ul class="up-card-features">
              ${p.features.map((f) => `<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${f}</li>`).join('')}
            </ul>
            <button class="up-cta-btn ${p.popular ? 'up-cta-primary' : 'up-cta-secondary'}" data-plan="${p.id}">
              ${p.cta}
            </button>
          </div>
        `).join('')}
      </div>

      <p class="up-back"><a href="/browse-projects">← Back to Browse Projects</a></p>
    </div>
  `;

  // CTA buttons — show coming soon toast since no payment backend
  block.querySelectorAll('.up-cta-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      const names = { starter: 'Starter', pro: 'Pro', business: 'Business' };
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:13px 24px;border-radius:99px;font-size:0.88rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgb(0 0 0/25%);text-align:center;max-width:320px';
      toast.textContent = `${names[plan]} plan selected — payment integration coming soon!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    });
  });
}
