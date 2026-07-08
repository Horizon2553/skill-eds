/*
 * Tabs Block
 * Generic tab switcher. Each row = one tab: cell 0 is the tab label,
 * cell 1 is the panel content (any plain authored content — text,
 * links, lists — styled per-variant with CSS).
 * https://github.com/adobe/aem-block-collection/tree/main/blocks/tabs
 */

import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children];

  rows.forEach((row, i) => {
    const label = row.children[0];
    const panel = row.children[1];
    const id = toClassName(label.textContent.trim());

    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = label.innerHTML;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', i === 0);
    tablist.append(button);

    row.className = 'tabs-panel';
    row.id = `tabpanel-${id}`;
    row.dataset.tabIndex = i;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', `tab-${id}`);
    if (i !== 0) row.setAttribute('aria-hidden', 'true');
    label.remove();
    if (panel) panel.className = 'tabs-panel-content';
  });

  tablist.addEventListener('click', (e) => {
    const button = e.target.closest('.tabs-tab');
    if (!button) return;
    tablist.querySelectorAll('.tabs-tab').forEach((btn) => btn.setAttribute('aria-selected', 'false'));
    button.setAttribute('aria-selected', 'true');
    block.querySelectorAll('.tabs-panel').forEach((panel) => panel.setAttribute('aria-hidden', 'true'));
    block.querySelector(`#${button.getAttribute('aria-controls')}`).setAttribute('aria-hidden', 'false');
  });

  // If a heading was authored above the block (as plain content, in its own
  // wrapper), lift the tablist up to sit beside it instead of inside the
  // block — purely a layout hook, styled per-variant with flexbox order.
  const section = block.closest('.section');
  const heading = section?.querySelector(':scope > .default-content-wrapper');
  if (heading) {
    tablist.classList.add('tabs-list-lifted');
    section.insertBefore(tablist, block.parentElement);
  } else {
    block.prepend(tablist);
  }
}
