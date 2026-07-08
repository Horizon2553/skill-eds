# Decision guide — before you create a new block

Run through this checklist before adding a new folder under `/blocks`. Stop at the first
"yes" — that's your answer.

```
Start: "I need to show/do X on a page"
│
├─ 1. Is X just content (text, image, table, list, links)?
│      → YES: author it directly in the page. No block needed at all.
│      → NO: continue
│
├─ 2. Does an existing block in THIS repo already do this (or 90% of it)?
│      → YES: reuse it / extend it with a CSS variant class. Do not fork a near-duplicate.
│      → NO: continue
│
├─ 3. Does a default/generic EDS block do this?
│      (see generic-blocks-catalog.md — cards, columns, accordion, tabs, quote,
│       carousel, embed, hero, fragment, table-of-contents, modal, video, form)
│      → YES: use it. If only the visuals differ, add a modifier class
│              (e.g. `cards.testimonials`) and style with CSS only.
│      → NO: continue
│
├─ 4. Is the gap ONLY visual/layout (not behavior)?
│      → YES: it's still a generic block + CSS. Do not write JS to re-solve
│              something CSS already solves (grids, tabs via <details>, etc.)
│      → NO: continue
│
└─ 5. Does X require one of these?
       - persisted session / user state (login, "saved" state, cart, plan limits)
       - a form submission with validation/business rules
       - reading/writing data that isn't page content (localStorage, an API, a paywall)
       - cross-block or cross-page shared state
      → YES: custom block is justified. Write it, and add one line to
              blocks-audit.md explaining which of the above applies.
      → NO: you've missed something in steps 1–4 — go back and re-check.
```

## Red flags that a "custom" block should have been generic

- The JS is just building an accordion/tabs/carousel from scratch (`<details>`, tab-click
  handlers with `.active` toggling) with no app state involved — that's what `accordion`/`tabs`
  already do.
- Two unrelated content types are jammed into one block file, switched on a CSS class
  (e.g. `if (block.classList.contains('faq')) ... else ...`). This means neither variant was
  actually custom enough to need its own logic — it's a styling difference wearing custom JS.
- The block has no `localStorage`/`sessionStorage`/`fetch`/form submission anywhere in it —
  if it's pure "take these authored rows and lay them out," it's a layout problem, not an app
  logic problem.

## Red flags that a block genuinely needs to stay custom

- It reads/writes `localStorage` or `sessionStorage` for session, cart, likes, saved items, plan limits.
- It gates behavior on business rules (proposal limits, paid plan tiers, paywalls).
- It's a multi-step form with validation, submission, and state carried between steps.
- It renders data that depends on the URL (`?uid=&pid=`) or synthesizes content no author wrote.
- It has to synchronize two live UI regions (e.g. one dropdown filtering another block's grid).
