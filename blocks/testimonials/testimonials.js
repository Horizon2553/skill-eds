const AVATAR_COLORS = ['#4f46e5', '#1dbf73', '#e53e3e', '#f59e0b', '#0ea5e9'];

export default async function decorate(block) {
  const rows = [...block.children];

  const header = document.createElement('div');
  header.className = 'testimonials-header';
  header.innerHTML = `
    <h2>Trusted by leaders &amp; freelancers</h2>
    <p>Here's what people are saying about working on SkillHire.</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'testimonials-grid';

  rows.forEach((row, idx) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const quote = cells[0]?.textContent.trim() || '';
    const name = cells[1]?.textContent.trim() || '';
    const role = cells[2]?.textContent.trim() || '';
    const initial = name.charAt(0).toUpperCase();
    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];

    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <div class="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
      <blockquote class="testimonial-quote">&ldquo;${quote}&rdquo;</blockquote>
      <div class="testimonial-author">
        <div class="testimonial-avatar" style="background:${color}" aria-hidden="true">${initial}</div>
        <div class="testimonial-info">
          <div class="testimonial-name">${name}</div>
          <div class="testimonial-role">${role}</div>
        </div>
      </div>
    `;
    grid.append(card);
  });

  block.innerHTML = '';
  block.append(header);
  block.append(grid);
}
