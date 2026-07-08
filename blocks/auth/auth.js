const SKILLS = [
  'Frontend Developer', 'Full-Stack Developer', 'MERN Developer',
  'UI/UX Designer', 'Python Developer', 'Mobile Developer',
  'Java Developer', 'Graphic Designer', 'Other',
];

function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')) || null; } catch { return null; }
}
function setSession(user) { localStorage.setItem('skillbridge_auth', JSON.stringify(user)); }

function getUsers() {
  try { return JSON.parse(localStorage.getItem('sb_users_v1')) || []; } catch { return []; }
}
function saveUsers(users) { localStorage.setItem('sb_users_v1', JSON.stringify(users)); }

export default async function decorate(block) {
  const rows = [...block.children];
  const mode = rows[0]?.children[0]?.textContent.trim().toLowerCase() || 'login';
  const startTab = (mode === 'signup' || mode === 'register') ? 'register' : 'login';

  if (getSession()) { window.location.href = '/'; return; }

  block.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-brand">SkillHire<span class="auth-brand-dot">•</span></div>

        <div class="auth-tabs">
          <button class="auth-tab${startTab === 'login' ? ' active' : ''}" data-tab="login">Log In</button>
          <button class="auth-tab${startTab === 'register' ? ' active' : ''}" data-tab="register">Register</button>
        </div>

        <!-- LOGIN PANEL -->
        <div class="auth-panel" id="panel-login" style="display:${startTab === 'login' ? 'block' : 'none'}">
          <form id="login-form" novalidate>
            <div class="auth-field">
              <label for="login-email">Email <span class="req">*</span></label>
              <input type="email" id="login-email" placeholder="eg@gmail.com" autocomplete="email" required>
            </div>
            <div class="auth-field">
              <label for="login-pw">Password <span class="req">*</span></label>
              <div class="pw-wrap">
                <input type="password" id="login-pw" placeholder="Your password" autocomplete="current-password" required>
                <button type="button" class="pw-eye" data-for="login-pw" aria-label="Show password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <p class="auth-error" id="login-err"></p>
            <button type="submit" class="auth-btn">Continue</button>
          </form>
          <p class="auth-switch">Don't have an account? <button class="auth-link" data-goto="register">Sign up free</button></p>
        </div>

        <!-- REGISTER PANEL -->
        <div class="auth-panel" id="panel-register" style="display:${startTab === 'register' ? 'block' : 'none'}">
          <div class="role-cards">
            <div class="role-card selected" data-role="freelancer">
              <div class="role-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div class="role-text">
                <div class="role-title">I'm a Freelancer</div>
                <div class="role-desc">Find projects &amp; get hired</div>
              </div>
              <div class="role-check">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div class="role-card" data-role="client">
              <div class="role-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <div class="role-text">
                <div class="role-title">I'm a Client</div>
                <div class="role-desc">Post projects &amp; hire talent</div>
              </div>
              <div class="role-check">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>

          <form id="register-form" novalidate>
            <div class="auth-form-row">
              <div class="auth-field">
                <label for="reg-name">Full Name <span class="req">*</span></label>
                <input type="text" id="reg-name" placeholder="Jane Doe" autocomplete="name" required>
              </div>
              <div class="auth-field">
                <label for="reg-email">Email <span class="req">*</span></label>
                <input type="email" id="reg-email" placeholder="you@example.com" autocomplete="email" required>
              </div>
            </div>
            <div class="auth-field">
              <label for="reg-pw">Password <span class="req">*</span></label>
              <div class="pw-wrap">
                <input type="password" id="reg-pw" placeholder="Min. 8 characters" autocomplete="new-password" required>
                <button type="button" class="pw-eye" data-for="reg-pw" aria-label="Show password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <div class="pw-rules">
                <span class="pw-rule" data-rule="length">8+ characters</span>
                <span class="pw-rule" data-rule="upper">Uppercase letter</span>
                <span class="pw-rule" data-rule="number">Number</span>
                <span class="pw-rule" data-rule="special">Special character</span>
              </div>
            </div>
            <div class="auth-form-row" id="reg-extra-row">
              <div class="auth-field" id="reg-skill-wrap">
                <label for="reg-skill">Primary Skill</label>
                <select id="reg-skill">
                  ${SKILLS.map((s) => `<option value="${s}">${s}</option>`).join('')}
                </select>
              </div>
              <div class="auth-field" id="reg-company-wrap" style="display:none">
                <label for="reg-company">Company <span class="optional">(optional)</span></label>
                <input type="text" id="reg-company" placeholder="Your company name">
              </div>
            </div>
            <label class="auth-tc">
              <input type="checkbox" id="reg-tc" required>
              <span>I agree to the <a href="/policies" target="_blank">Terms of Service</a> and <a href="/policies" target="_blank">Privacy Policy</a></span>
            </label>
            <p class="auth-error" id="register-err"></p>
            <button type="submit" class="auth-btn">Create Account</button>
          </form>
          <p class="auth-switch">Already have an account? <button class="auth-link" data-goto="login">Log in</button></p>
        </div>

      </div>
    </div>
  `;

  // Demo users (checked first before localStorage users)
  const DEMO = [
    { id: 'rahul-sharma', email: 'rahul@skillbridge.com', password: 'demo123', role: 'freelancer', name: 'Rahul Sharma' },
    { id: 'aditi-rao', email: 'aditi@skillbridge.com', password: 'demo123', role: 'freelancer', name: 'Aditi Rao' },
    { id: 'client-jane', email: 'client@skillbridge.com', password: 'demo123', role: 'client', name: 'Jane Doe' },
  ];

  // Tab switching
  let activeRole = 'freelancer';
  const tabs = [...block.querySelectorAll('.auth-tab')];
  const panels = { login: block.querySelector('#panel-login'), register: block.querySelector('#panel-register') };

  function showTab(tab) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    panels.login.style.display = tab === 'login' ? 'block' : 'none';
    panels.register.style.display = tab === 'register' ? 'block' : 'none';
  }
  tabs.forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
  block.querySelectorAll('.auth-link').forEach((l) => l.addEventListener('click', () => showTab(l.dataset.goto)));

  // Role cards
  block.querySelectorAll('.role-card').forEach((card) => {
    card.addEventListener('click', () => {
      block.querySelectorAll('.role-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      activeRole = card.dataset.role;
      block.querySelector('#reg-skill-wrap').style.display = activeRole === 'freelancer' ? 'block' : 'none';
      block.querySelector('#reg-company-wrap').style.display = activeRole === 'client' ? 'block' : 'none';
    });
  });

  // Password show/hide
  block.querySelectorAll('.pw-eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inp = block.querySelector(`#${btn.dataset.for}`);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  });

  // Password strength rules
  const regPw = block.querySelector('#reg-pw');
  regPw.addEventListener('input', () => {
    const v = regPw.value;
    const map = { length: v.length >= 8, upper: /[A-Z]/.test(v), number: /\d/.test(v), special: /[^A-Za-z0-9]/.test(v) };
    block.querySelectorAll('.pw-rule').forEach((r) => r.classList.toggle('met', !!map[r.dataset.rule]));
  });

  // Login submit
  block.querySelector('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = block.querySelector('#login-email').value.trim().toLowerCase();
    const pw = block.querySelector('#login-pw').value;
    const errEl = block.querySelector('#login-err');
    errEl.textContent = '';

    // Check DEMO first, then localStorage users
    const demoUser = DEMO.find((u) => u.email.toLowerCase() === email && u.password === pw);
    const lsUser = getUsers().find((u) => u.email.toLowerCase() === email && u.password === pw);
    const user = demoUser || lsUser;
    if (!user) { errEl.textContent = 'Invalid email or password.'; return; }

    // If it's a localStorage user, merge with full profile data from sb_users_v1
    // (so avatar, bio, skills etc are restored even after page refresh)
    let fullUser = user;
    if (lsUser) {
      const stored = getUsers().find((u) => u.email.toLowerCase() === email);
      if (stored) fullUser = { ...user, ...stored };
    }

    // Correct role if saved wrong
    const ROLE_FIX = { 'vanshi00@gmail.com': 'freelancer', 'vanshi11@gmail.com': 'client' };
    if (ROLE_FIX[fullUser.email.toLowerCase()]) {
      fullUser.role = ROLE_FIX[fullUser.email.toLowerCase()];
      const allUsers = getUsers();
      const idx = allUsers.findIndex((u) => u.email.toLowerCase() === fullUser.email.toLowerCase());
      if (idx > -1) { allUsers[idx].role = fullUser.role; saveUsers(allUsers); }
    }
    setSession(fullUser);
    window.location.href = '/';
  });

  // Register submit
  block.querySelector('#register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = block.querySelector('#reg-name').value.trim();
    const email = block.querySelector('#reg-email').value.trim().toLowerCase();
    const pw = block.querySelector('#reg-pw').value;
    const tc = block.querySelector('#reg-tc').checked;
    const errEl = block.querySelector('#register-err');
    errEl.textContent = '';

    if (!name) { errEl.textContent = 'Please enter your full name.'; return; }
    if (!email.includes('@')) { errEl.textContent = 'Please enter a valid email.'; return; }
    if (pw.length < 8) { errEl.textContent = 'Password must be at least 8 characters.'; return; }
    if (!tc) { errEl.textContent = 'Please accept the Terms of Service.'; return; }

    const allUsers = [...DEMO, ...getUsers()];
    if (allUsers.some((u) => u.email.toLowerCase() === email)) { errEl.textContent = 'Email already registered.'; return; }

    const skill = block.querySelector('#reg-skill')?.value || 'Frontend Developer';
    const company = block.querySelector('#reg-company')?.value.trim() || '';
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    const newUser = { id, name, email, password: pw, role: activeRole, skill, company };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    setSession(newUser);
    window.location.href = '/my-profile';
  });
}
