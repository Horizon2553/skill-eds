export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: heading (1 cell — may contain <em> for accent word)
  const firstCells = [...rows[0].children];
  const hasHeading = firstCells.length === 1 || (firstCells.length >= 1 && !firstCells[1]?.textContent.trim());
  const headingHTML = hasHeading ? firstCells[0].innerHTML : null;
  const qaRows = hasHeading ? rows.slice(1) : rows;

  block.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'faq-inner';

  // Heading column
  const headingCol = document.createElement('div');
  headingCol.className = 'faq-heading-col';
  const heading = document.createElement('h2');
  heading.className = 'faq-heading';
  heading.innerHTML = headingHTML || 'Your questions, <em>answered</em>';
  headingCol.append(heading);
  inner.append(headingCol);

  // Q&A list
  const list = document.createElement('div');
  list.className = 'faq-list';

  qaRows.forEach((row, i) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const question = cells[0].textContent.trim();
    const answer = cells[1].innerHTML;

    const item = document.createElement('details');
    item.className = 'faq-item';
    if (i === 0) item.open = true;

    item.innerHTML = `
      <summary class="faq-question">
        <span>${question}</span>
        <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </summary>
      <div class="faq-answer">${answer}</div>
    `;
    list.append(item);
  });

  inner.append(list);
  block.append(inner);
}
