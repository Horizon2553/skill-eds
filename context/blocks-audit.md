# Blocks audit — this project, current state

Every block in [/blocks](../blocks) as of this audit, classified into three verdicts:

- 🟢 **Standard** — a default EDS block, unmodified in kind. Not "custom" in the wasteful sense; keep.
- 🟡 **Should be generic** — currently hand-built, but a generic block (catalog above) already covers
  this. Recommend replacing or rebuilding on top of the generic block.
- 🔵 **Justified custom** — genuinely needs app logic/state a generic content block cannot express.
  Kept as custom, with the specific reason stated.

Re-run this checklist ([decision-guide.md](./decision-guide.md)) whenever a block changes materially.

| Block | Verdict | Why |
|---|---|---|
| `header` | 🟢 Standard | Unmodified aem-boilerplate nav pattern (desktop/mobile menu toggle). This is required infrastructure, not a discretionary custom block. |
| `footer` | 🟢 Standard | Unmodified aem-boilerplate footer-as-fragment pattern. |
| `fragment` | 🟢 Standard | Copied verbatim from the [official fragment block](https://www.aem.live/developer/block-collection/fragment). Zero custom logic. |
| `accordion` | 🟢 Standard (generic) | Replaces the old `faq` custom block. Reusable expand/collapse block, not tied to FAQ specifically — the `faq` variant class only carries styling. See [consolidation-plan.md](./consolidation-plan.md). |
| `cards` | 🟢 Standard (generic) | Replaces the old `testimonials` custom block. Reusable card-grid block — the `testimonials` variant class only carries styling. Available for any future "grid of tiles" need with zero new code. |
| `tabs` | 🟢 Standard (generic) | Replaces the old `how-it-works` custom block. Reusable tab-switcher block — the `how-it-works` variant class only carries styling. Panel content is plain authored lists, not nested blocks. |
| `hero` | 🔵 Justified custom | Default `hero` block covers image/video + heading + CTA. This one adds: autoplay/lazy-loaded video background swapped post-LCP, a stateful Hire/Work mode toggle that swaps heading/subtext/CTA content client-side, and a search input that redirects to a filtered URL. That's interactive, stateful behavior a content block doesn't model — legitimately custom, though scoped tightly to those three behaviors. |
| `featured-work` | 🔵 Justified custom | Two synced tab panels (Projects / Freelancers) where cards carry **persisted interactive state**: like counts and "saved" bookmarks stored in `localStorage` and reflected back into the UI (`fw_liked`, `fw_saved`, `fw_saved_data`), plus hardcoded title→URL resolution maps. No generic block persists per-user interaction state. |
| `auth` | 🔵 Justified custom | Login/register forms with tabbed panels, role selection, password-visibility toggle, and a client-side "session" (`skillbridge_auth` in `localStorage`) plus a user store (`sb_users_v1`). Authentication flows have no generic-block equivalent. *(Note: this is a localStorage-backed prototype, not real auth — flag for real identity/session backend before production, independent of the custom-block question.)* |
| `payment` | 🔵 Justified custom | Payment method tabs (UPI/Card/Net Banking) driven by a plan pulled from `sessionStorage` (`sh_selected_plan`), with its own validation. No generic block models a checkout flow. *(Same production caveat as `auth` — needs a real payment gateway, not a reason to change the custom-block verdict.)* |
| `dashboard` | 🔵 Justified custom | Authenticated user dashboard reading/writing multiple `localStorage` collections (`sb_proposals`, `sb_hire_requests`, `sb_fav_*`), seeding demo data, computing relative timestamps. This is application state rendering, not content layout. |
| `browse-projects` | 🔵 Justified custom | Job board with a proposal submission modal gated by plan limits (`getPlanLimit`/`getMyProposalCount` against `sb_proposals`), redirecting to `/upgrade` when the paywall is hit. Business-rule-gated interaction, not content layout. |
| `hire-talent` | 🔵 Justified custom | Freelancer directory with live search/filter and session-aware rendering (`skillbridge_auth`). Interactive filtering over dynamic data, not a static content grid. |
| `post-project` | 🔵 Justified custom | Multi-field project-posting form gated by `canPostFree()` business rule (first post free, paid plans unlimited) against `sb_posted_jobs_*` in `localStorage`. Form + business-rule logic, no generic equivalent. |
| `profile` | 🔵 Justified custom | Renders a user's public profile by reading `sb_users_v1` / hire-request data, resolves project links via URL params (`?uid=&pid=`) rather than authored content. Data-driven rendering, not authored layout. |
| `profile-setup` | 🔵 Justified custom | Multi-step wizard (bio → skills → rate → links → …) writing to the session object in `localStorage`. Stepper + form-state logic, no generic equivalent. |
| `project-detail` | 🔵 Justified custom | Resolves project data either from authored content or from a user's self-uploaded project (`?uid=&pid=` against `sb_users_v1`), plus like-state via `localStorage` (`sb_liked_projects`). Same data-driven-rendering justification as `profile`. |
| `upgrade` | 🔵 Justified custom | Plan comparison cards where selecting a plan writes to `sessionStorage` (`sh_selected_plan`) and redirects into the `payment` flow. It's a pricing/business-logic step in a checkout funnel, not a static content grid. |

## Net read

**Update:** `faq`, `testimonials`, and `how-it-works` have been converted (code side — see
[consolidation-plan.md](./consolidation-plan.md) for the da.live content steps still needed).
The repo now has 17 folders, but 3 of them (`accordion`, `cards`, `tabs`) are generic/reusable
rather than one-off custom, and the remaining 12 non-infrastructure blocks (`hero`, `featured-work`,
`auth`, `payment`, `dashboard`, `browse-projects`, `hire-talent`, `post-project`, `profile`,
`profile-setup`, `project-detail`, `upgrade`) are all genuinely justified — each touches
`localStorage`/`sessionStorage`/business rules/session state, real application behavior a content
block can't express. See [consolidation-plan.md](./consolidation-plan.md) for how those 11 get
merged down further (Tier 2/3) toward the 10–12 target.
