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

  // Variant hook: if a heading was authored directly above the block, pull
  // it and the tablist into a small dedicated row so they can sit side by
  // side. Scoped to this one variant, and scoped to a wrapper we build
  // ourselves — never touches display on the shared section, so unrelated
  // sibling content (e.g. a hero block sharing the same section) can't be
  // affected by it.
  const headingWrapper = block.classList.contains('how-it-works')
    ? block.closest('.section')?.querySelector(':scope > .default-content-wrapper')
    : null;

  if (headingWrapper) {
    const headingRow = document.createElement('div');
    headingRow.className = 'tabs-heading-row';
    headingWrapper.replaceWith(headingRow);
    tablist.classList.add('tabs-list-lifted');
    headingRow.append(headingWrapper, tablist);
  } else {
    block.prepend(tablist);
  }
}
