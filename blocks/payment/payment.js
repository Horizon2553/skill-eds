const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const LOCK_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

export default async function decorate(block) {
  const rows = [...block.children];
  let title = 'Complete your payment';
  let subtitle = "You're one step away from unlocking more proposals on SkillHire.";

  rows.forEach((row) => {
    const cells = [...row.children];
    const firstCell = cells[0];
    if (!firstCell) return;
    if (firstCell.querySelector('strong, b')) {
      title = firstCell.textContent.trim();
      subtitle = cells[1]?.textContent.trim() || subtitle;
    }
  });

  let plan = null;
  try { plan = JSON.parse(sessionStorage.getItem('sh_selected_plan')); } catch { /* empty */ }
  if (!plan) {
    plan = {
      name: 'Starter',
      price: '₹499',
      highlight: 'Great for getting started with proposals',
      features: ['5 proposals', '30-day visibility', 'Basic support'],
    };
  }

  block.innerHTML = `
    <div class="pay-wrap">

      <!-- LEFT: Form -->
      <div class="pay-form-card">
        <div id="pay-form-wrap">
          <h1>${title}</h1>
          <p class="pay-subtitle">${subtitle}</p>

          <div class="pay-method-tabs">
            <button class="pay-method-tab active" data-method="upi">UPI</button>
            <button class="pay-method-tab" data-method="card">Card</button>
            <button class="pay-method-tab" data-method="netbanking">Net Banking</button>
          </div>

          <!-- UPI -->
          <div class="pay-method-section active" id="pm-upi">
            <div class="pay-field">
              <label for="upi-id">UPI ID</label>
              <input type="text" id="upi-id" placeholder="e.g. yourname@upi" autocomplete="off">
              <p class="pay-hint">Works with Google Pay, PhonePe, Paytm, BHIM and any UPI app.</p>
            </div>
          </div>

          <!-- Card -->
          <div class="pay-method-section" id="pm-card">
            <div class="pay-section-label">Billing details</div>
            <div class="pay-field">
              <label for="billing-name">Full Name</label>
              <input type="text" id="billing-name" placeholder="Jane Doe" autocomplete="name">
            </div>
            <div class="pay-field">
              <label for="billing-email">Email</label>
              <input type="email" id="billing-email" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="pay-section-label">Card details</div>
            <div class="card-icons">
              <div class="card-icon visa">VISA</div>
              <div class="card-icon mc"></div>
              <div class="card-icon rupay">RuPay</div>
            </div>
            <div class="pay-field">
              <label for="card-number">Card Number</label>
              <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric" autocomplete="cc-number">
            </div>
            <div class="pay-row">
              <div class="pay-field">
                <label for="card-expiry">Expiry</label>
                <input type="text" id="card-expiry" placeholder="MM / YY" maxlength="7" inputmode="numeric" autocomplete="cc-exp">
              </div>
              <div class="pay-field">
                <label for="card-cvv">CVV / CVC</label>
                <input type="password" id="card-cvv" placeholder="•••" maxlength="4" inputmode="numeric" autocomplete="cc-csc">
              </div>
            </div>
            <div class="pay-field">
              <label for="card-name">Name on Card</label>
              <input type="text" id="card-name" placeholder="e.g. JANE DOE" autocomplete="cc-name">
            </div>
          </div>

          <!-- Net Banking -->
          <div class="pay-method-section" id="pm-netbanking">
            <div class="pay-field">
              <label for="nb-bank">Select Bank</label>
              <select class="bank-select" id="nb-bank">
                <option value="">— Choose your bank —</option>
                <option>State Bank of India (SBI)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
                <option>Yes Bank</option>
                <option>IndusInd Bank</option>
              </select>
            </div>
            <div class="pay-field">
              <label for="nb-uid">Net Banking User ID</label>
              <input type="text" id="nb-uid" placeholder="Your user ID">
            </div>
            <div class="pay-field">
              <label for="nb-pwd">Password</label>
              <input type="password" id="nb-pwd" placeholder="Net banking password">
            </div>
          </div>

          <button type="button" id="pay-now">Pay now — ${plan.price}</button>
        </div>

        <!-- Success screen -->
        <div id="pay-success">
          <div class="success-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2>Payment successful!</h2>
          <p>Your <strong>${plan.name} Plan</strong> is now active.</p>
          <a href="${(() => { try { const s = JSON.parse(localStorage.getItem('skillbridge_auth')); return s?.role === 'client' ? '/post-project' : '/browse-projects'; } catch { return '/browse-projects'; } })()}" class="btn-back" id="pay-success-link">Continue →</a>
        </div>
      </div>

      <!-- RIGHT: Order summary -->
      <div class="pay-order">
        <div class="order-header">Order summary</div>
        <div class="order-plan-name">${plan.name} Plan</div>
        <div class="order-plan-desc">${plan.highlight}</div>
        <ul class="order-features">
          ${plan.features.map((f) => `<li>${CHECK_SVG}${f}</li>`).join('')}
        </ul>
        <hr class="order-divider">
        <div class="order-total-row">
          <span class="order-total-label">Total due today</span>
          <span class="order-total-amount">${plan.price}</span>
        </div>
        <div class="order-gst">Incl. 18% GST</div>
        <div class="order-secure">${LOCK_SVG} 256-bit SSL encrypted · Powered by SkillHire Pay</div>
      </div>

    </div>
  `;

  // Tab switching
  const tabs = [...block.querySelectorAll('.pay-method-tab')];
  const sections = [...block.querySelectorAll('.pay-method-section')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      sections.forEach((s) => s.classList.remove('active'));
      tab.classList.add('active');
      block.querySelector(`#pm-${tab.dataset.method}`).classList.add('active');
    });
  });

  // Card number auto-format
  const cardNum = block.querySelector('#card-number');
  if (cardNum) {
    cardNum.addEventListener('input', () => {
      const v = cardNum.value.replace(/\D/g, '').substring(0, 16);
      cardNum.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  // Expiry auto-format
  const cardExp = block.querySelector('#card-expiry');
  if (cardExp) {
    cardExp.addEventListener('input', () => {
      let v = cardExp.value.replace(/\D/g, '');
      if (v.length >= 2) v = `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
      cardExp.value = v;
    });
  }

  // Pay now → success screen
  block.querySelector('#pay-now').addEventListener('click', () => {
    block.querySelector('#pay-form-wrap').style.display = 'none';
    block.querySelector('#pay-success').style.display = 'block';
    // Save plan to session + users list + clear old flag
    try {
      const session = JSON.parse(localStorage.getItem('skillbridge_auth'));
      if (session) {
        session.activePlan = plan.name;
        localStorage.setItem('skillbridge_auth', JSON.stringify(session));
        // Also persist plan in sb_users_v1 so it survives re-login
        const users = JSON.parse(localStorage.getItem('sb_users_v1') || '[]');
        const idx = users.findIndex((u) => u.id === session.id || u.email === session.email);
        if (idx > -1) { users[idx].activePlan = plan.name; localStorage.setItem('sb_users_v1', JSON.stringify(users)); }
        // Clear old free-tier flag
        const key = session.id || session.email;
        if (key) localStorage.removeItem(`bp_used_free_${key}`);
      }
    } catch { /* empty */ }
  });
}
