function getSession() {
  try { return JSON.parse(localStorage.getItem('skillbridge_auth')); } catch { return null; }
}
function saveSession(s) { localStorage.setItem('skillbridge_auth', JSON.stringify(s)); }

const FREELANCER_STEPS = [
  {
    id: 'bio', title: 'About You',
    desc: 'Write a short bio to help clients understand who you are.',
    label: 'Bio / About', required: true, type: 'textarea',
    placeholder: "I'm a frontend developer with 3+ years of experience building React apps...",
  },
  {
    id: 'skills', title: 'Your Skills',
    desc: 'Add at least one skill so clients can find you.',
    label: 'Skills', required: true, type: 'tags',
    placeholder: 'e.g. React, Node.js, Python...',
  },
  {
    id: 'rate', title: 'Your Hourly Rate',
    desc: 'Set a starting rate. You can negotiate project-by-project.',
    label: 'Hourly Rate (₹/hr)', required: true, type: 'number',
    placeholder: '500',
  },
  {
    id: 'links', title: 'Professional Links',
    desc: 'LinkedIn is required so clients can verify your identity.',
    required: true, type: 'links',
  },
  {
    id: 'photo', title: 'Upload Your Profile Photo',
    desc: 'A real photo builds trust. This is required to complete your profile.',
    required: false, type: 'photo',
  },
];

const CLIENT_STEPS = [
  {
    id: 'company', title: 'Your Company',
    desc: 'Tell freelancers a bit about who you are.',
    label: 'Company / Organization', required: false, type: 'text',
    placeholder: 'e.g. Acme Corp, Solo Founder, Startup...',
  },
  {
    id: 'needs', title: 'What do you need?',
    desc: 'Describe the type of projects you usually post.',
    label: 'Project Needs', required: true, type: 'textarea',
    placeholder: 'e.g. We build SaaS products and need frontend developers...',
  },
  {
    id: 'budget', title: 'Typical Budget',
    desc: 'What is your usual project budget range?',
    label: 'Budget Range', required: false, type: 'select',
    options: ['₹5,000 – ₹15,000', '₹15,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+', 'Varies per project'],
  },
  {
    id: 'website', title: 'Your Website',
    desc: 'Optional, but helps freelancers understand your business.',
    label: 'Website URL (optional)', required: false, type: 'text',
    placeholder: 'https://yourcompany.com',
  },
  {
    id: 'photo', title: 'Company Logo / Photo',
    desc: 'Optional — helps build trust with freelancers.',
    required: false, type: 'photo',
  },
];

function circularProgress(pct) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return `
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="#e8e8e8" stroke-width="5"/>
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="#1dbf73" stroke-width="5"
        stroke-dasharray="${dash} ${circ - dash}"
        stroke-dashoffset="${circ / 4}" stroke-linecap="round"
        style="transition:stroke-dasharray 0.4s ease"/>
      <text x="32" y="37" text-anchor="middle" font-size="13" font-weight="700" fill="${pct === 100 ? '#1dbf73' : '#111'}">${pct}%</text>
    </svg>
  `;
}

export default async function decorate(block) {
  const session = getSession();
  if (!session) { window.location.href = '/login'; return; }
  if (session.profileComplete) { window.location.href = '/dashboard'; return; }

  const isClient = session.role === 'client';
  const steps = isClient ? CLIENT_STEPS : FREELANCER_STEPS;
  const data = {};
  let currentStep = 0;
  let tags = [];

  function render() {
    const pct = Math.round((currentStep / steps.length) * 100);
    const remaining = steps.length - currentStep;
    const step = steps[currentStep];
    const isDone = currentStep >= steps.length;

    if (isDone) {
      const firstName = session.name.split(' ')[0];
      block.innerHTML = `
        <div class="ps-container">
          <div class="ps-progress-bar">
            ${circularProgress(100)}
            <div class="ps-progress-text">
              <div class="ps-progress-title">Profile complete!</div>
              <div class="ps-progress-sub">You're all set!</div>
            </div>
          </div>
          <div class="ps-step-card ps-done-card">
            <div class="ps-done-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>You're all set, ${firstName}!</h2>
            <p>${isClient ? 'Start posting projects and find the right talent.' : 'Your profile is ready. Start exploring SkillHire and make your first move.'}</p>
            <div class="ps-done-btns">
              <a href="${isClient ? '/browse-projects' : '/browse-projects'}" class="ps-btn-primary">${isClient ? 'Post a Project' : 'Find Work'}</a>
              <a href="/dashboard" class="ps-btn-secondary">Go to Dashboard</a>
            </div>
          </div>
          <div class="ps-dots">${steps.map((_, i) => `<div class="ps-dot done"></div>`).join('')}</div>
        </div>
      `;
      return;
    }

    block.innerHTML = `
      <div class="ps-container">
        <div class="ps-progress-bar">
          ${circularProgress(pct)}
          <div class="ps-progress-text">
            <div class="ps-progress-title">${pct === 100 ? 'Profile complete!' : 'Complete your profile'}</div>
            <div class="ps-progress-sub">${remaining} step${remaining !== 1 ? 's' : ''} remaining</div>
          </div>
        </div>

        <div class="ps-step-card">
          <div class="ps-step-num">Step ${currentStep + 1} of ${steps.length}</div>
          <h2 class="ps-step-title">${step.title}</h2>
          <p class="ps-step-desc">${step.desc}</p>

          ${renderField(step)}

          <p class="ps-err" id="ps-err"></p>

          <div class="ps-btns">
            ${currentStep > 0 ? `<button class="ps-btn-back" id="ps-back">← Back</button>` : '<div></div>'}
            <button class="ps-btn-continue" id="ps-continue">Continue</button>
          </div>
        </div>

        <div class="ps-dots">
          ${steps.map((_, i) => `<div class="ps-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>`).join('')}
        </div>
      </div>
    `;

    if (step.type === 'tags') initTagInput(step);
    if (step.type === 'photo') initPhotoUpload(step);
    if (data[step.id]) prefillField(step);

    block.querySelector('#ps-continue')?.addEventListener('click', advance);
    block.querySelector('#ps-back')?.addEventListener('click', () => { currentStep--; render(); });
    block.querySelector('#ps-step-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') advance(); });
  }

  function renderField(step) {
    if (step.type === 'textarea') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label} ${step.required ? '<span class="ps-req">*</span>' : ''}</label>
          <textarea id="ps-step-input" rows="5" placeholder="${step.placeholder || ''}"></textarea>
        </div>
      `;
    }
    if (step.type === 'text' || step.type === 'number') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label} ${step.required ? '<span class="ps-req">*</span>' : ''}</label>
          <input type="${step.type === 'number' ? 'number' : 'text'}" id="ps-step-input" placeholder="${step.placeholder || ''}">
        </div>
      `;
    }
    if (step.type === 'select') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label}</label>
          <select id="ps-step-input">
            ${step.options.map((o) => `<option value="${o}">${o}</option>`).join('')}
          </select>
        </div>
      `;
    }
    if (step.type === 'tags') {
      return `
        <div class="ps-field">
          <label class="ps-label">${step.label} ${step.required ? '<span class="ps-req">*</span>' : ''} <span class="ps-hint">(press Enter or comma to add)</span></label>
          <div class="ps-tag-input-wrap" id="ps-tag-wrap">
            <input type="text" id="ps-tag-inp" placeholder="${step.placeholder || ''}">
          </div>
        </div>
      `;
    }
    if (step.type === 'links') {
      return `
        <div class="ps-field">
          <label class="ps-label">LinkedIn Profile URL <span class="ps-req">*</span></label>
          <input type="url" id="ps-linkedin" placeholder="https://linkedin.com/in/yourname">
        </div>
        <div class="ps-field" style="margin-top:14px">
          <label class="ps-label">GitHub Profile URL <span class="ps-opt">(optional)</span></label>
          <input type="url" id="ps-github" placeholder="https://github.com/yourname">
        </div>
      `;
    }
    if (step.type === 'photo') {
      return `
        <div class="ps-photo-wrap">
          <div class="ps-photo-circle" id="ps-photo-preview">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Click or drag<br>photo here</span>
          </div>
          <input type="file" id="ps-photo-inp" accept="image/*" style="display:none">
          <button type="button" class="ps-choose-photo" id="ps-photo-btn">⬆ Choose Photo</button>
          <p class="ps-photo-hint">JPG, PNG or WEBP · Max 4MB</p>
        </div>
      `;
    }
    return '';
  }

  function prefillField(step) {
    const val = data[step.id];
    if (!val) return;
    if (step.type === 'text' || step.type === 'number' || step.type === 'textarea') {
      const inp = block.querySelector('#ps-step-input');
      if (inp) inp.value = val;
    }
    if (step.type === 'tags' && Array.isArray(val)) {
      tags = [...val];
      renderTags();
    }
    if (step.type === 'links') {
      if (block.querySelector('#ps-linkedin')) block.querySelector('#ps-linkedin').value = val.linkedin || '';
      if (block.querySelector('#ps-github')) block.querySelector('#ps-github').value = val.github || '';
    }
  }

  function renderTags() {
    const wrap = block.querySelector('#ps-tag-wrap');
    const inp = block.querySelector('#ps-tag-inp');
    if (!wrap || !inp) return;
    wrap.querySelectorAll('.ps-tag').forEach((t) => t.remove());
    tags.forEach((t) => {
      const pill = document.createElement('span');
      pill.className = 'ps-tag';
      pill.innerHTML = `${t} <button type="button" data-tag="${t}">×</button>`;
      pill.querySelector('button').addEventListener('click', () => {
        tags = tags.filter((x) => x !== t);
        renderTags();
      });
      wrap.insertBefore(pill, inp);
    });
  }

  function initTagInput(step) {
    tags = Array.isArray(data[step.id]) ? [...data[step.id]] : [];
    renderTags();
    const inp = block.querySelector('#ps-tag-inp');
    inp?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const v = inp.value.replace(',', '').trim();
        if (v && !tags.includes(v)) { tags.push(v); renderTags(); }
        inp.value = '';
      }
    });
    block.querySelector('#ps-tag-wrap')?.addEventListener('click', () => inp?.focus());
  }

  function initPhotoUpload() {
    const btn = block.querySelector('#ps-photo-btn');
    const inp = block.querySelector('#ps-photo-inp');
    const preview = block.querySelector('#ps-photo-preview');
    btn?.addEventListener('click', () => inp?.click());
    preview?.addEventListener('click', () => inp?.click());
    inp?.addEventListener('change', () => {
      const file = inp.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) { block.querySelector('#ps-err').textContent = 'File too large. Max 4MB.'; return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        data.photo = e.target.result;
        preview.innerHTML = `<img src="${e.target.result}" alt="Profile photo">`;
        preview.classList.add('has-photo');
      };
      reader.readAsDataURL(file);
    });
  }

  function advance() {
    const step = steps[currentStep];
    const err = block.querySelector('#ps-err');
    if (err) err.textContent = '';

    if (step.type === 'textarea' || step.type === 'text' || step.type === 'number') {
      const val = block.querySelector('#ps-step-input')?.value.trim();
      if (step.required && !val) { if (err) err.textContent = 'This field is required.'; return; }
      data[step.id] = val;
    } else if (step.type === 'tags') {
      const inpVal = block.querySelector('#ps-tag-inp')?.value.trim();
      if (inpVal && !tags.includes(inpVal)) tags.push(inpVal);
      if (step.required && tags.length === 0) { if (err) err.textContent = 'Add at least one skill.'; return; }
      data[step.id] = tags;
    } else if (step.type === 'links') {
      const linkedin = block.querySelector('#ps-linkedin')?.value.trim();
      const github = block.querySelector('#ps-github')?.value.trim();
      if (step.required && !linkedin) { if (err) err.textContent = 'LinkedIn URL is required.'; return; }
      data[step.id] = { linkedin, github };
    } else if (step.type === 'select') {
      data[step.id] = block.querySelector('#ps-step-input')?.value;
    } else if (step.type === 'photo') {
      // optional — already in data.photo from reader
    }

    currentStep++;

    if (currentStep >= steps.length) {
      const updated = {
        ...session,
        bio: data.bio || data.needs || '',
        skills: data.skills || [],
        hourlyRate: data.rate || '',
        links: data.links || {},
        company: data.company || '',
        avatar: data.photo || '',
        profileComplete: true,
      };
      saveSession(updated);
    }

    render();
  }

  render();
}
