/*
 * Accordion Block
 * Generic expand/collapse block. Each row = one item: cell 0 is the
 * label (summary), cell 1 is the body content.
 * https://github.com/adobe/aem-block-collection/tree/main/blocks/accordion
 */

export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.classList.add('accordion-item');
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    const details = document.createElement('details');
    details.className = 'accordion-item-body-wrapper';
    if (i === 0) details.open = true;
    details.append(summary);

    const body = row.children[1];
    if (body) {
      body.className = 'accordion-item-body';
      details.append(body);
    }

    label.remove();
    row.append(details);
  });

  // Variant hook: if a heading was authored directly above the block, pull
  // it and the block into a small dedicated layout row together so they can
  // sit side by side. Scoped to this one variant, and built from a wrapper
  // we create ourselves — never touches display on the shared section, so
  // unrelated sibling content (e.g. another block sharing the same section)
  // can't be affected by it.
  if (block.classList.contains('faq')) {
    const section = block.closest('.section');
    const headingWrapper = section?.querySelector(':scope > .default-content-wrapper');
    const blockWrapper = block.parentElement;
    if (headingWrapper && blockWrapper) {
      const layout = document.createElement('div');
      layout.className = 'accordion-faq-layout';
      headingWrapper.replaceWith(layout);
      layout.append(headingWrapper, blockWrapper);
    }
  }
}
