const ICONS = [
  [
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  ],
  [
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  ],
];

export default async function decorate(block) {
  const rows = [...block.children];

  const firstCells = [...rows[0].children];
  const hasTitle = firstCells.length === 1 && !firstCells[0].querySelector('strong, b');
  const titleText = hasTitle ? firstCells[0].textContent.trim() : 'How it works';
  const cardRows = hasTitle ? rows.slice(1) : rows;

  const tabs = [];
  let currentTab = null;

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const isBoldOnly = cells.length >= 1
      && cells[0].querySelector('strong, b')
      && cells.slice(1).every((c) => !c.textContent.trim());

    if (isBoldOnly) {
      currentTab = { label: cells[0].textContent.trim(), cards: [] };
      tabs.push(currentTab);
    } else if (currentTab && cells.length >= 2 && cells[0].textContent.trim()) {
      const link = cells[2]?.querySelector('a') || cells[1]?.querySelector('a') || null;
      currentTab.cards.push({
        title: cells[0].textContent.trim(),
        desc: cells[1].textContent.trim(),
        link,
      });
    }
  });

  block.innerHTML = '';

  // Header row: title left, toggle right
  const header = document.createElement('div');
  header.className = 'hiw-header-row';

  const titleEl = document.createElement('h2');
  titleEl.className = 'hiw-section-title';
  titleEl.textContent = titleText;
  header.append(titleEl);

  const tabNav = document.createElement('div');
  tabNav.className = 'hiw-toggle-pill';
  tabs.forEach((tab, i) => {
    const btn = document.createElement('button');
    btn.className = `hiw-toggle-btn${i === 0 ? ' active' : ''}`;
    btn.textContent = tab.label;
    btn.dataset.tab = i;
    tabNav.append(btn);
  });
  header.append(tabNav);
  block.append(header);

  // Tab panels
  tabs.forEach((tab, tabIdx) => {
    const panel = document.createElement('div');
    panel.className = `hiw-panel${tabIdx === 0 ? ' active' : ''}`;
    panel.dataset.panel = tabIdx;
    panel.setAttribute('aria-hidden', tabIdx === 0 ? 'false' : 'true');

    tab.cards.forEach((card, cardIdx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'hiw-card';

      const iconEl = document.createElement('div');
      iconEl.className = 'hiw-icon';
      iconEl.innerHTML = (ICONS[tabIdx] && ICONS[tabIdx][cardIdx]) || '';
      cardEl.append(iconEl);

      const titleH3 = document.createElement('h3');
      titleH3.className = 'hiw-card-title';
      titleH3.textContent = card.title;
      cardEl.append(titleH3);

      const descP = document.createElement('p');
      descP.className = 'hiw-card-desc';
      descP.textContent = card.desc;
      cardEl.append(descP);

      if (card.link) {
        const linkEl = document.createElement('a');
        linkEl.className = 'hiw-cta-link';
        linkEl.href = card.link.href;
        linkEl.textContent = `${card.link.textContent} →`;
        cardEl.append(linkEl);
      }

      panel.append(cardEl);
    });

    block.append(panel);
  });

  // Tab switching
  tabNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.hiw-toggle-btn');
    if (!btn) return;
    const idx = btn.dataset.tab;
    block.querySelectorAll('.hiw-toggle-btn').forEach((b) => b.classList.remove('active'));
    block.querySelectorAll('.hiw-panel').forEach((p) => {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });
    btn.classList.add('active');
    const activePanel = block.querySelector(`.hiw-panel[data-panel="${idx}"]`);
    activePanel.classList.add('active');
    activePanel.setAttribute('aria-hidden', 'false');
  });
}
