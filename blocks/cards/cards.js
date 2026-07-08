/*
 * Cards Block
 * Generic grid of tiles. Each row = one card. A cell containing only an
 * image becomes the card image; every other cell becomes a card body row.
 * https://github.com/adobe/aem-block-collection/tree/main/blocks/cards
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

// Variant: pricing plan cards. Cell order per row:
// name | price | period | highlight | features (comma-separated) | CTA text | popular flag
function enhancePlanCards(block) {
  const cards = [...block.querySelectorAll('.cards-card')];

  cards.forEach((card) => {
    const [nameEl, priceEl, periodEl, highlightEl, featuresEl, ctaEl, popularEl] = [
      ...card.querySelectorAll('.cards-card-body'),
    ];
    if (!nameEl) return;

    const planName = nameEl.textContent.trim();
    const isPopular = (popularEl?.textContent.trim().toLowerCase() || '') === 'popular';
    const features = (featuresEl?.textContent || '').split(',').map((f) => f.trim()).filter(Boolean);

    nameEl.className = 'cards-plan-name';

    if (isPopular) {
      card.classList.add('cards-plan-popular');
      const badge = document.createElement('span');
      badge.className = 'cards-plan-badge';
      badge.textContent = 'Popular';
      nameEl.after(badge);
    }
    popularEl?.remove();

    if (priceEl) {
      priceEl.className = 'cards-plan-price';
      if (periodEl) {
        const period = document.createElement('span');
        period.className = 'cards-plan-period';
        period.textContent = periodEl.textContent.trim();
        priceEl.append(period);
        periodEl.remove();
      }
    }

    if (highlightEl) highlightEl.className = 'cards-plan-highlight';

    if (featuresEl) {
      const ul = document.createElement('ul');
      ul.className = 'cards-plan-features';
      features.forEach((f) => {
        const li = document.createElement('li');
        li.textContent = f;
        ul.append(li);
      });
      featuresEl.replaceWith(ul);
    }

    if (ctaEl) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cards-plan-cta${isPopular ? ' cards-plan-cta-primary' : ''}`;
      btn.textContent = ctaEl.textContent.trim();
      ctaEl.replaceWith(btn);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sessionStorage.setItem('sh_selected_plan', JSON.stringify({
          name: planName,
          price: priceEl?.textContent.trim() || '',
          highlight: highlightEl?.textContent.trim() || '',
          features,
        }));
        window.location.href = '/payment';
      });
    }

    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('cards-plan-selected'));
      card.classList.add('cards-plan-selected');
      sessionStorage.setItem('sh_selected_plan', JSON.stringify({
        name: planName,
        price: priceEl?.textContent.trim() || '',
        highlight: highlightEl?.textContent.trim() || '',
        features,
      }));
    });
  });
}

export default async function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('plans')) enhancePlanCards(block);
}
