# Policy: Generic blocks first, custom blocks only when justified

## The rule

Default to the blocks Adobe already ships (boilerplate defaults + the
[block collection](https://www.aem.live/developer/block-collection)) or to **no block at all**
(plain authored content — headings, tables, images — needs zero code). Build a custom block
only when a generic block genuinely cannot do the job, and be able to say *why* in one sentence.

## Why this matters (the "why" behind the "why")

1. **Every custom block is code you own forever.** Generic blocks are maintained upstream by
   Adobe, already accessible, already responsive, already performance-tuned. A custom block
   moves all of that maintenance onto this team — forever, not just at launch.
2. **Authors pay the cost too.** A generic block (accordion, cards, tabs, columns) is something
   an author already knows how to fill in from docs/examples. A custom block means new authoring
   rules to learn and a new "contract" (see AGENTS.md → *Blocks*) that has to be documented and
   remembered.
3. **More blocks = more surface area for bugs, lint issues, and CSS collisions.** Fewer, well-understood
   building blocks are easier to review, easier to keep consistent, and cheaper to test after every
   AEM markup change.
4. **Custom is still the right call sometimes** — when the page needs actual application logic
   (auth, payment, a stateful dashboard, live search/filter, cross-block shared state). No generic
   content block can express that, because generic blocks are for *content layout*, not *app behavior*.
   Forcing those into a generic block would be worse than a custom one — see
   [blocks-audit.md](./blocks-audit.md) for where this project draws that line today.

## The test to apply

Ask, in order:

1. **Can this be plain authored content** (a table, a heading, an image, a list) with no block at all?
   → Use that. No JS, no CSS, no maintenance.
2. **Does a default boilerplate block already do this** (`hero`, `columns`, `cards`, `fragment`,
   `embed`, `header`, `footer`)? → Use it, optionally with an authoring variant (extra CSS class)
   for styling differences only.
3. **Does the [block collection](https://www.aem.live/developer/block-collection) have something
   close** (`accordion`, `tabs`, `carousel`, `quote`, `table-of-contents`, `modal`, `video`, `form`)?
   → Adopt it, style it to match the design system. Do not reinvent its JS.
4. **Does this genuinely require app state, an API call, form submission logic, or behavior no
   content block models** (login, checkout, a dashboard, saved/liked state, plan-gated limits)?
   → Then, and only then, write a custom block. Document why in
   [blocks-audit.md](./blocks-audit.md) when you do.

If you can't clear step 4 with a concrete answer ("because it needs to persist a session" /
"because it calls an API" / "because the interaction has no content-block equivalent"), it's not
custom-block-worthy — go back to steps 1–3.
