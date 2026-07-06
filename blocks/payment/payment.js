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
      highlight: 'Great for getting started',
      features: ['5 proposals', '30-day visibility', 'Basic support'],
    };
  }

  block.innerHTML = `
    <div class="pay-page">
      <div class="pay-left">
        <h1 class="pay-title">${title}</h1>
        <p class="pay-sub">${subtitle}</p>

        <div class="pay-methods">
          <button class="pay-method-btn active" data-method="upi">UPI</button>
          <button class="pay-method-btn" data-method="card">Card</button>
          <button class="pay-method-btn" data-method="netbanking">Net Banking</button>
        </div>

        <div class="pay-panel" id="pay-panel-upi">
          <label class="pay-label">UPI ID</label>
          <input type="text" class="pay-input" id="upi-id" placeholder="e.g. yourname@upi">
          <p class="pay-hint">Works with Google Pay, PhonePe, Paytm, BHIM and any UPI app.</p>
        </div>

        <div class="pay-panel" id="pay-panel-card" style="display:none">
          <label class="pay-label">Card Number</label>
          <input type="text" class="pay-input" id="card-num" placeholder="1234 5678 9012 3456" maxlength="19">
          <div class="pay-row">
            <div>
              <label class="pay-label">Expiry</label>
              <input type="text" class="pay-input" id="card-exp" placeholder="MM/YY" maxlength="5">
            </div>
            <div>
              <label class="pay-label">CVV</label>
              <input type="text" class="pay-input" id="card-cvv" placeholder="123" maxlength="3">
            </div>
          </div>
          <label class="pay-label">Name on Card</label>
          <input type="text" class="pay-input" id="card-name" placeholder="Full name">
        </div>

        <div class="pay-panel" id="pay-panel-netbanking" style="display:none">
          <label class="pay-label">Select Bank</label>
          <select class="pay-input pay-select" id="bank-select">
            <option value="">Choose your bank</option>
            <option>SBI</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
            <option>Kotak Bank</option>
            <option>Punjab National Bank</option>
            <option>Other</option>
          </select>
        </div>

        <button class="pay-submit" id="pay-now">Pay now — ${plan.price}</button>
      </div>

      <div class="pay-right">
        <div class="pay-summary">
          <div class="pay-summary-label">ORDER SUMMARY</div>
          <div class="pay-summary-plan">${plan.name} Plan</div>
          <div class="pay-summary-desc">${plan.highlight}</div>
          <ul class="pay-summary-features">
            ${plan.features.map((f) => `<li>${f}</li>`).join('')}
          </ul>
          <div class="pay-summary-divider"></div>
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

  const methodBtns = [...block.querySelectorAll('.pay-method-btn')];
  methodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      methodBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      block.querySelectorAll('.pay-panel').forEach((p) => { p.style.display = 'none'; });
      block.querySelector(`#pay-panel-${btn.dataset.method}`).style.display = 'block';
    });
  });

  const cardNum = block.querySelector('#card-num');
  if (cardNum) {
    cardNum.addEventListener('input', () => {
      const v = cardNum.value.replace(/\D/g, '').substring(0, 16);
      cardNum.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const cardExp = block.querySelector('#card-exp');
  if (cardExp) {
    cardExp.addEventListener('input', () => {
      let v = cardExp.value.replace(/\D/g, '');
      if (v.length >= 2) v = `${v.substring(0, 2)}/${v.substring(2)}`;
      cardExp.value = v;
    });
  }

  block.querySelector('#pay-now').addEventListener('click', () => {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:13px 24px;border-radius:99px;font-size:0.88rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgb(0 0 0/25%);text-align:center;max-width:380px';
    toast.textContent = 'Payment integration coming soon! Your plan selection has been saved.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  });
}
