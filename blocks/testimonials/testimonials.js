// One block handles both Testimonials and FAQ
// Detection: block.classList.contains('faq') → FAQ accordion
//            block.classList.contains('testimonials') → testimonial cards

const AVATAR_COLORS = ['#4f46e5', '#1dbf73', '#e53e3e', '#f59e0b', '#0ea5e9'];

function buildTestimonials(block, rows) {
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
    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    const name = cells[1]?.textContent.trim() || '';
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <div class="testimonial-stars">★★★★★</div>
      <blockquote class="testimonial-quote">&ldquo;${cells[0]?.textContent.trim()}&rdquo;</blockquote>
      <div class="testimonial-author">
        <div class="testimonial-avatar" style="background:${color}">${name.charAt(0).toUpperCase()}</div>
        <div class="testimonial-info">
          <div class="testimonial-name">${name}</div>
          <div class="testimonial-role">${cells[2]?.textContent.trim() || ''}</div>
        </div>
      </div>
    `;
    grid.append(card);
  });

  block.innerHTML = '';
  block.append(header, grid);
}

function buildFaq(block, rows) {
  const firstCells = [...rows[0].children];
  const hasHeading = firstCells.length === 1 || !firstCells[1]?.textContent.trim();
  const headingHTML = hasHeading ? firstCells[0].innerHTML : null;
  const qaRows = hasHeading ? rows.slice(1) : rows;

  block.innerHTML = '';
  const inner = document.createElement('div');
  inner.className = 'faq-inner';

  const headingCol = document.createElement('div');
  headingCol.className = 'faq-heading-col';
  const h2 = document.createElement('h2');
  h2.className = 'faq-heading';
  h2.innerHTML = headingHTML || 'Your questions, <em>answered</em>';
  headingCol.append(h2);

  const list = document.createElement('div');
  list.className = 'faq-list';

  qaRows.forEach((row, i) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const item = document.createElement('details');
    item.className = 'faq-item';
    if (i === 0) item.open = true;
    item.innerHTML = `
      <summary class="faq-question">
        <span>${cells[0].textContent.trim()}</span>
        <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </summary>
      <div class="faq-answer">${cells[1].innerHTML}</div>
    `;
    list.append(item);
  });

  inner.append(headingCol, list);
  block.append(inner);
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (block.classList.contains('faq')) buildFaq(block, rows);
  else buildTestimonials(block, rows);
}
