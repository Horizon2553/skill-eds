// Demo credentials — no real backend, capstone demo only
const DEMO_USERS = [
  { email: 'rahul@skillbridge.com', password: 'demo123', name: 'Rahul Sharma', role: 'freelancer' },
  { email: 'aditi@skillbridge.com', password: 'demo123', name: 'Aditi Rao', role: 'freelancer' },
  { email: 'client@skillbridge.com', password: 'demo123', name: 'Jane Doe', role: 'client' },
];

function getSession() {
  try { return JSON.parse(localStorage.getItem('sb_session')) || null; } catch { return null; }
}

function setSession(user) {
  localStorage.setItem('sb_session', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('sb_session');
}

export default async function decorate(block) {
  const rows = [...block.children];
  const mode = rows[0]?.children[0]?.textContent.trim().toLowerCase() || 'login';
  const isSignup = mode === 'signup' || mode === 'register';

  // If already logged in, redirect home
  if (getSession()) {
    window.location.href = '/';
    return;
  }

  block.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo">SkillBridge<span class="auth-dot">•</span></div>
        <h1 class="auth-title">${isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p class="auth-sub">${isSignup ? 'Join thousands of freelancers and clients.' : 'Sign in to your SkillBridge account.'}</p>

        <form class="auth-form" novalidate>
          ${isSignup ? `
            <div class="auth-field">
              <label for="auth-name">Full Name</label>
              <input type="text" id="auth-name" name="name" placeholder="Rahul Sharma" autocomplete="name" required>
            </div>
          ` : ''}
          <div class="auth-field">
            <label for="auth-email">Email address</label>
            <input type="email" id="auth-email" name="email" placeholder="you@example.com" autocomplete="email" required>
          </div>
          <div class="auth-field">
            <label for="auth-password">Password</label>
            <div class="auth-pw-wrap">
              <input type="password" id="auth-password" name="password" placeholder="••••••••" autocomplete="${isSignup ? 'new-password' : 'current-password'}" required>
              <button type="button" class="auth-pw-toggle" aria-label="Show password">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          ${isSignup ? `
            <div class="auth-role-wrap">
              <span class="auth-role-label">I am a</span>
              <div class="auth-role-btns">
                <button type="button" class="auth-role-btn active" data-role="freelancer">Freelancer</button>
                <button type="button" class="auth-role-btn" data-role="client">Client</button>
              </div>
            </div>
          ` : ''}
          <p class="auth-error" role="alert"></p>
          <button type="submit" class="auth-submit">${isSignup ? 'Create Account' : 'Sign In'}</button>
        </form>

        <p class="auth-switch">
          ${isSignup
    ? 'Already have an account? <a href="/login">Sign in</a>'
    : "Don't have an account? <a href='/signup'>Get started free</a>"}
        </p>

        ${!isSignup ? `
          <div class="auth-demo-hint">
            <strong>Demo credentials:</strong><br>
            Freelancer: rahul@skillbridge.com / demo123<br>
            Client: client@skillbridge.com / demo123
          </div>
        ` : ''}
      </div>
    </div>
  `;

  const form = block.querySelector('.auth-form');
  const errorEl = block.querySelector('.auth-error');
  const submitBtn = block.querySelector('.auth-submit');
  const pwInput = block.querySelector('#auth-password');
  const pwToggle = block.querySelector('.auth-pw-toggle');

  // Password visibility toggle
  pwToggle?.addEventListener('click', () => {
    pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
  });

  // Role selector (signup only)
  let selectedRole = 'freelancer';
  block.querySelectorAll('.auth-role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.auth-role-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.dataset.role;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = isSignup ? 'Creating account…' : 'Signing in…';

    const email = block.querySelector('#auth-email').value.trim();
    const password = block.querySelector('#auth-password').value;
    const name = block.querySelector('#auth-name')?.value.trim() || '';

    setTimeout(() => {
      if (isSignup) {
        if (!name) { showError('Please enter your full name.'); return; }
        if (!email.includes('@')) { showError('Please enter a valid email address.'); return; }
        if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }
        setSession({ name, email, role: selectedRole });
        window.location.href = '/';
      } else {
        const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
        if (!user) { showError('Invalid email or password. Try the demo credentials below.'); return; }
        setSession(user);
        window.location.href = '/';
      }
    }, 600);
  });

  function showError(msg) {
    errorEl.textContent = msg;
    submitBtn.disabled = false;
    submitBtn.textContent = isSignup ? 'Create Account' : 'Sign In';
  }
}
