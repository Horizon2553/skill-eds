// Replace with your real Formspree endpoint from formspree.io (e.g. https://formspree.io/f/abcdwxyz)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

export default async function decorate(block) {
  const rows = [...block.children];
  const heading = rows[0]?.children[0]?.textContent.trim() || 'Get in touch';
  const subtext = rows[1]?.children[0]?.textContent.trim() || '';
  const subject = rows[2]?.children[0]?.textContent.trim() || 'New inquiry from SkillBridge';

  block.innerHTML = `
    <div class="cf-wrap">
      <h2 class="cf-heading">${heading}</h2>
      ${subtext ? `<p class="cf-subtext">${subtext}</p>` : ''}
      <form class="cf-form">
        <input type="hidden" name="_subject" value="${subject}">
        <div class="cf-field">
          <label for="cf-name">Name</label>
          <input type="text" id="cf-name" name="name" required>
        </div>
        <div class="cf-field">
          <label for="cf-email">Email</label>
          <input type="email" id="cf-email" name="email" required>
        </div>
        <div class="cf-field">
          <label for="cf-message">Message</label>
          <textarea id="cf-message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit" class="cf-submit">Send Request</button>
        <p class="cf-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;

  const form = block.querySelector('.cf-form');
  const submitBtn = block.querySelector('.cf-submit');
  const status = block.querySelector('.cf-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';
    status.className = 'cf-status';

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        status.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
        status.classList.add('cf-status-success');
      } else {
        throw new Error('Submit failed');
      }
    } catch {
      status.textContent = 'Something went wrong. Please try again or email us directly.';
      status.classList.add('cf-status-error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Request';
    }
  });
}
