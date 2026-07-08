# Consolidation plan — 17 blocks → 12

Manager's ask: don't cap creativity, cap the **block count**. Build as many visual/behavioral
variations as needed, but express them as variations of a generic block (extra CSS class,
internal step/tab switching) rather than a new folder under `/blocks` every time. This is the
same mechanism EDS calls "block variations," and it's the same trick `auth` already uses
internally (one block, two panels — Login / Register — switched by a tab click, not two blocks).

This plan is staged in three tiers by risk/effort. **Do Tier 1 and Tier 2. Tier 3 is optional** —
only pull it in if the number must go below 12.

## Current state: 17 blocks

`header, footer, fragment, hero, faq, testimonials, how-it-works, featured-work, auth, payment,
dashboard, browse-projects, hire-talent, post-project, profile, profile-setup, project-detail, upgrade`

---

## Tier 1 — adopt generic blocks (safe, do first) → 17 → 14 — ✅ DONE (code side)

These three had **no app state, no API, no business rule** — see
[blocks-audit.md](./blocks-audit.md). They were hand-built but duplicated a generic block. Zero
functional risk to convert.

| Removed custom block | Replaced with generic | What changed |
|---|---|---|
| `faq` | **`accordion`** | Generic expand/collapse block, one row per Q&A pair. The old "heading row inside the block" trick was dropped — the section heading is now plain authored content (an `<h2>`) sitting above the block, not a special first row the block's JS had to sniff out. |
| `testimonials` | **`cards`** | Generic card grid, one row per testimonial (quote / name / role, no image cell). The colored-initial avatar circle (previously JS-generated) was dropped in favor of plain CSS typography — no image was authored for it anyway, so this is a straight simplification, not a feature loss. Section heading is now plain content above the block. |
| `how-it-works` | **`tabs`** | Generic tab switcher, one row per persona (**For Clients** / **For Freelancers**). The 3 icon+title+description tiles inside each tab are now a plain `<ul>` of `<li>` items (title in `<strong>`, description in `<p>`, optional link) — styled into a card-like grid purely with a `tabs.how-it-works` CSS variant. This avoided needing a nested block-in-a-block (the boilerplate's `decorateBlocks` only decorates blocks one level deep inside a section, so a `cards` block nested inside a `tabs` panel would never get initialized without extra plumbing — using plain content sidesteps that entirely). The hand-drawn SVG icons were dropped; if icons come back, add them as an authored image per `<li>`, not custom JS. |

**Code changes made:**
- Added [blocks/accordion](../blocks/accordion), [blocks/cards](../blocks/cards), [blocks/tabs](../blocks/tabs) — generic, reusable, not tied to this project's copy.
- Deleted `blocks/faq`, `blocks/testimonials`, `blocks/how-it-works`.
- Updated [drafts/index.html](../drafts/index.html) to the new markup shape (see the da.live steps below — the drafts file is the local stand-in for what the real da.live document needs to become).

**Net effect:** 3 custom folders removed, 3 generic folders added — `accordion` and `cards` are
now proven, reusable primitives available to any future section (this is where the count keeps
paying off: the *next* content-only block idea likely needs zero new code, just a new `cards` or
`accordion` variant class).

---

## Doing the same migration in da.live (content side — do this next)

The code above only changes how the block *renders*. The actual page content lives in da.live,
not in this repo, so an author has to update the authored document for each page that uses these
three sections. Do this once per page (e.g. the home page) that has a How It Works / Testimonials
/ FAQ section.

### 1. FAQ → `accordion`

1. Open the page doc in da.live and find the **FAQ** block table (top-left cell of the table
   currently says `FAQ`).
2. If the first row is currently a single-cell heading (e.g. "Your questions, *answered*"),
   **cut that row out of the table entirely** and paste it as a normal `## Heading` paragraph
   directly above the table, in the same section. It's no longer part of the block.
3. Rename the block: click into the table's top-left header cell and change the text from
   `FAQ` to `Accordion`.
4. Leave the remaining rows as-is — question in the left cell, answer in the right cell. That
   row shape (label | body) is exactly what `accordion` expects, no restructuring needed.
5. Add a second word to the header cell to carry the styling variant: `Accordion (faq)` — the
   parenthesized word becomes an extra CSS class (`accordion faq`), which is what
   `blocks/accordion/accordion.css`'s `.accordion.faq` styling hooks into (today that's just
   inherited default styling — add rules there if FAQ needs to look different from a generic
   accordion elsewhere).
6. Preview the page (da.live's preview / the `{branch}--{repo}--{owner}.aem.page` URL) and confirm
   each question expands/collapses.

### 2. Testimonials → `cards`

1. Find the **Testimonials** block table.
2. Cut the heading + subheading text (if authored inside the table) out to plain paragraphs
   above the table, same as FAQ.
3. Rename the header cell from `Testimonials` to `Cards (testimonials)`.
4. Row shape stays the same: quote text | author name | author role — three cells, no image.
   `cards` handles "no image cell" automatically (every cell just becomes a card-body row).
5. If you want a photo per testimonial, add a 4th cell with an image *before* the quote cell —
   `cards` will automatically detect any cell containing only an image and render it as the
   card's image area; no code change needed for that later.
6. Preview and confirm the quote/name/role styling still reads as a testimonial (italic quote,
   bold name, muted role — driven by `.cards.testimonials` CSS).

### 3. How It Works → `tabs`

This one has the biggest content-shape change, so take it slowly:

1. Find the **How It Works** block table. Today it likely has: a heading row, then a bold-only
   row per persona ("**For Clients**", "**For Freelancers**"), then several separate 2–3 cell
   rows per card underneath each persona row.
2. Cut the section heading out to a plain `## How SkillBridge works` paragraph above the table.
3. Rename the header cell from `How It Works` to `Tabs (how-it-works)`.
4. Restructure so **each persona is exactly one row with two cells**:
   - Left cell: the persona label, e.g. `For Clients` (plain text, no longer needs `**bold**` —
     bold was only ever a marker the old custom JS used to detect "this is a new tab").
   - Right cell: a bulleted list, one bullet per step. For each bullet: bold the step title,
     then a normal paragraph for the description, then (optionally) a link on its own line for
     the CTA. Example for one bullet:
     ```
     **Post a Project**
     Describe what you need, set your budget, and publish. Receive tailored proposals within hours.
     [Post a Project](/post-project)
     ```
   - Do this for all 3 steps per persona, in one list, in one cell.
5. Repeat for the second row (`For Freelancers` + its 3-step list).
6. Preview. Clicking a tab label should swap which persona's list is visible; the list should
   render as a 3-up card grid on desktop via the `tabs.how-it-works` CSS — no icons anymore
   (see note above) unless you add an image per bullet later.

### After all three

- Run a PageSpeed check and a manual click-through per AGENTS.md's publishing process before
  opening the PR (accordion/tabs interactivity is worth eyeballing in a real browser, not just
  reading the markup).
- Update [blocks-audit.md](./blocks-audit.md) to move `faq`, `testimonials`, `how-it-works` out
  of the audit table (they no longer exist) and add `accordion`, `cards`, `tabs` as 🟢 Standard.

---

## Tier 2 — merge two-step funnels into one block (do second) → 14 → 12

These pairs are already coupled by a session/sessionStorage handoff — one screen sets state,
the next reads it. That's a strong signal they're one flow wearing two block folders. Merge them
the same way `auth` already merges Login/Register: one block, internal panel/step switching.

| Merge these two | Into | Why it's safe |
|---|---|---|
| `upgrade` + `payment` | **`checkout`** (step 1: plan cards, step 2: payment form) | `upgrade` already writes `sh_selected_plan` to `sessionStorage` purely so `payment` can read it back — that hand-off *is* the seam of a single block's internal state, not two independent pages. |
| `profile-setup` + `profile` | **`profile`** (default = view mode; a `setup`/`edit` trigger flips it into the step wizard) | Both read/write the same `skillbridge_auth` session object and represent the same entity (a user's profile) in two modes — this is exactly what a variant should express. |

**Net effect:** 4 folders → 2 folders (`checkout`, `profile`).

---

## Result after Tier 1 + Tier 2: 12 blocks

| # | Block | Kind |
|---|---|---|
| 1 | `header` | standard |
| 2 | `footer` | standard |
| 3 | `fragment` | standard |
| 4 | `hero` | standard (customized) |
| 5 | `accordion` | generic (variant: `faq`) |
| 6 | `cards` | generic (variants: `testimonials`, plus reused inside `tabs (how-it-works)`) |
| 7 | `tabs` | generic (variant: `how-it-works`) |
| 8 | `auth` | justified custom — session/login state |
| 9 | `checkout` | justified custom — plan selection + payment, session-linked funnel |
| 10 | `dashboard` | justified custom — reads/writes multiple localStorage collections |
| 11 | `browse-projects` | justified custom — paywall-gated proposal flow |
| 12 | `hire-talent` | justified custom — live search/filter over dynamic data |
| — | `post-project` | justified custom — gated posting form |
| — | `profile` | justified custom (now also covers setup wizard) |
| — | `project-detail` | justified custom — URL-param + localStorage-driven rendering |
| — | `featured-work` | justified custom — persisted like/save state |

That's actually 15 rows above — Tier 1+2 alone lands at **15**, not 12. If the manager's number
is a hard 10–12, Tier 3 below is what closes the remaining gap. Read the honesty note before
doing it.

---

## Tier 3 — optional, higher risk (only if you must go below 12–13)

These merges are **plausible but riskier**: the pages look structurally similar (search + grid,
or single-item detail view), but they carry different data sources and different business rules.
Forcing them into one block trades clarity for a lower number — get sign-off before doing this,
don't do it silently.

| Merge these | Into | The honest tradeoff |
|---|---|---|
| `browse-projects` + `hire-talent` | **`directory`** (variant: `jobs` vs `talent`) | Both are "search bar + filter + grid of cards," but one lists jobs (with a paywall-gated proposal modal) and the other lists people. Shared shell is real; shared business logic is not — you'd be building one config-driven engine, not literally simplifying. |
| `profile` + `project-detail` | **`detail`** (variant: `profile` vs `project`) | Both are single-entity detail pages (hero info + about/gallery + like/contact CTA), but resolve data differently (`sb_users_v1` vs URL `?uid=&pid=` project lookup). |

Doing both of these takes 15 → **13**. Also folding `dashboard` in as a third `directory` variant
(it's really "my proposals / my requests / my saved," same card-grid shape, different data scope)
would reach **12**, but dashboard's data is user-owned activity, not marketplace listings — that's
the one merge in this whole plan I'd push back on if asked, since it mixes "browse the
marketplace" with "manage my account" under one roof.

## Suggested order of work

1. Do Tier 1 (`faq`→`accordion`, `testimonials`→`cards`, `how-it-works`→`tabs`). Ship this alone
   first — it's zero-risk and already gets you real, defensible progress to show your manager.
2. Do Tier 2 (`checkout`, merged `profile`). Test the session hand-off carefully — this is the
   part with actual logic to get right.
3. Only reach for Tier 3 if 12 isn't good enough in practice — and flag the `dashboard` merge as
   a judgment call, not a given.
