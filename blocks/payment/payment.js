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
      period: '/post',
      highlight: 'Great for getting started with proposals',
      features: ['5 proposals', '30-day visibility', 'Basic support'],
    };
  }

  const checkSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  block.innerHTML = `
    <div class="pay-page">

      <!-- LEFT: Form -->
      <div class="pay-left">
        <div id="pay-form-wrap">
          <h1 class="pay-title">${title}</h1>
          <p class="pay-sub">${subtitle}</p>

          <div class="pay-methods">
            <button class="pay-method-btn active" data-method="upi">UPI</button>
            <button class="pay-method-btn" data-method="card">Card</button>
            <button class="pay-method-btn" data-method="netbanking">Net Banking</button>
          </div>

          <!-- UPI -->
          <div class="pay-panel" id="pay-panel-upi">
            <div class="pay-field">
              <label class="pay-label" for="upi-id">UPI ID</label>
              <input type="text" class="pay-input" id="upi-id" placeholder="e.g. yourname@upi" autocomplete="off">
              <p class="pay-hint">Works with Google Pay, PhonePe, Paytm, BHIM and any UPI app.</p>
            </div>
          </div>

          <!-- Card -->
          <div class="pay-panel" id="pay-panel-card" style="display:none">
            <div class="pay-section-label">Billing details</div>
            <div class="pay-field">
              <label class="pay-label" for="billing-name">Full Name</label>
              <input type="text" class="pay-input" id="billing-name" placeholder="Jane Doe" autocomplete="name">
            </div>
            <div class="pay-field">
              <label class="pay-label" for="billing-email">Email</label>
              <input type="email" class="pay-input" id="billing-email" placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="pay-section-label" style="margin-top:4px">Card details</div>
            <div class="pay-card-icons">
              <span class="pay-card-icon pay-card-visa">VISA</span>
              <span class="pay-card-icon pay-card-mc"></span>
              <span class="pay-card-icon pay-card-rupay">RuPay</span>
            </div>
            <div class="pay-field">
              <label class="pay-label" for="card-number">Card Number</label>
              <input type="text" class="pay-input" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric">
            </div>
            <div class="pay-row">
              <div class="pay-field">
                <label class="pay-label" for="card-expiry">Expiry</label>
                <input type="text" class="pay-input" id="card-expiry" placeholder="MM / YY" maxlength="7" inputmode="numeric">
              </div>
              <div class="pay-field">
                <label class="pay-label" for="card-cvv">CVV / CVC</label>
                <input type="password" class="pay-input" id="card-cvv" placeholder="•••" maxlength="4" inputmode="numeric">
              </div>
            </div>
            <div class="pay-field">
              <label class="pay-label" for="card-name">Name on Card</label>
              <input type="text" class="pay-input" id="card-name" placeholder="e.g. JANE DOE" autocomplete="cc-name">
            </div>
          </div>

          <!-- Net Banking -->
          <div class="pay-panel" id="pay-panel-netbanking" style="display:none">
            <div class="pay-field">
              <label class="pay-label" for="nb-bank">Select Bank</label>
              <select class="pay-input pay-select" id="nb-bank">
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
              <label class="pay-label" for="nb-uid">Net Banking User ID</label>
              <input type="text" class="pay-input" id="nb-uid" placeholder="Your user ID">
            </div>
            <div class="pay-field">
              <label class="pay-label" for="nb-pwd">Password</label>
              <input type="password" class="pay-input" id="nb-pwd" placeholder="Net banking password">
            </div>
          </div>

          <button class="pay-submit" id="pay-now">Pay now — ${plan.price}</button>
        </div>

        <!-- Success screen -->
        <div id="pay-success" style="display:none;text-align:center;padding:40px 0">
          <div class="pay-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 class="pay-success-title">Payment successful!</h2>
          <p class="pay-success-body">Your <strong>${plan.name} Plan</strong> is now active.</p>
          <a href="/browse-projects" class="pay-success-btn">Start Applying Now →</a>
        </div>
      </div>

      <!-- RIGHT: Order summary -->
      <div class="pay-right">
        <div class="pay-summary">
          <div class="pay-summary-label">ORDER SUMMARY</div>
          <div class="pay-summary-plan">${plan.name} Plan</div>
          <div class="pay-summary-desc">${plan.highlight}</div>
          <ul class="pay-summary-features">
            ${plan.features.map((f) => `<li>${checkSVG}${f}</li>`).join('')}
          </ul>
          <hr class="pay-summary-divider">
          <div class="pay-summary-total">
            <span>Total due today</span>
            <span class="pay-summary-price">${plan.price}</span>
          </div>
          <div class="pay-summary-gst">Incl. 18% GST</div>
          <div class="pay-summary-security">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            256-bit SSL encrypted · Powered by SkillHire Pay
          </div>
        </div>
      </div>

    </div>
  `;

  // Tab switching
  const methodBtns = [...block.querySelectorAll('.pay-method-btn')];
  methodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      methodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      block.querySelectorAll('.pay-panel').forEach((p) => { p.style.display = 'none'; });
      block.querySelector(`#pay-panel-${btn.dataset.method}`).style.display = 'block';
    });
  });

  // Card number formatting
  const cardNum = block.querySelector('#card-number');
  if (cardNum) {
    cardNum.addEventListener('input', () => {
      const v = cardNum.value.replace(/\D/g, '').substring(0, 16);
      cardNum.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  // Expiry formatting
  const cardExp = block.querySelector('#card-expiry');
  if (cardExp) {
    cardExp.addEventListener('input', () => {
      let v = cardExp.value.replace(/\D/g, '');
      if (v.length >= 2) v = `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
      cardExp.value = v;
    });
  }

  // Pay now — show success screen (no real payment)
  block.querySelector('#pay-now').addEventListener('click', () => {
    block.querySelector('#pay-form-wrap').style.display = 'none';
    block.querySelector('#pay-success').style.display = 'block';
    // Mark plan as active
    try {
      const session = JSON.parse(localStorage.getItem('skillbridge_auth'));
      if (session) {
        session.activePlan = plan.name;
        localStorage.setItem('skillbridge_auth', JSON.stringify(session));
        // Clear the paywall flag so they can submit proposals again
        const key = session.id || session.email;
        if (key) localStorage.removeItem(`bp_used_free_${key}`);
      }
    } catch { /* empty */ }
  });
}
