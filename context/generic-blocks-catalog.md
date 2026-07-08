# Generic / default blocks available before writing a custom one

Two sources of "free" blocks exist for any AEM Edge Delivery Services project. Neither is
custom code we maintain — both come from Adobe.

## 1. No block at all — plain authored content

The single most generic option. Headings, paragraphs, tables, images, and links dropped
directly into a page section render and work with zero JS/CSS. If a "block" would just be
`block.innerHTML` reformatting text that's already there, it probably shouldn't be a block.

## 2. `aem-boilerplate` default blocks (already in this repo, ship with every EDS project)

| Block | What it's for |
|---|---|
| `header` | Site nav, logo, hamburger menu on mobile. Already present at [blocks/header](../blocks/header) — standard, unmodified pattern. |
| `footer` | Site footer content loaded as a fragment. Already present at [blocks/footer](../blocks/footer). |
| `fragment` | Includes another page's content inline (`*.plain.html`) — for content reused across pages. Already present at [blocks/fragment](../blocks/fragment), verbatim from the [official docs](https://www.aem.live/developer/block-collection/fragment). |
| `hero` | Full-bleed image/video + heading + CTA banner, typically the first section on a page. |
| `columns` | N-column layout from a simple authored table — the generic answer to "put things side by side." |
| `cards` | Repeating image + title + description tiles from authored rows — the generic answer to most "grid of things" needs (products, articles, people, projects). |

## 3. [Block collection](https://www.aem.live/developer/block-collection) (official, drop-in, not yet installed in this repo)

Adobe maintains a larger set of ready-made blocks beyond the boilerplate defaults. Anything on
this list is an adoption, not a build:

| Block | Covers |
|---|---|
| `accordion` | Expand/collapse Q&A or content groups — **this is what a hand-rolled FAQ block is reinventing.** |
| `tabs` | Click-to-switch panels — **this is what a hand-rolled "toggle pill" tab UI is reinventing.** |
| `carousel` | Sliding/rotating content, image galleries. |
| `quote` | Pull-quotes / testimonial-style single quote callouts. |
| `table-of-contents` | Auto-generated in-page navigation from headings. |
| `modal` | Popup/dialog content triggered from a link. |
| `video` | Embedded video player with lazy-loading. |
| `form` | Authorable forms wired to AEM Forms / endpoints, with built-in validation patterns. |
| `embed` | Third-party embeds (YouTube, social posts, etc.). |

## Rule of thumb for adoption

If a needed block is in this catalog: **adopt it, then restyle it** with a CSS modifier class
(e.g. `accordion.faq`, `cards.testimonials`) to match this project's design system. Don't
rewrite its interaction logic — that's the part that's already solved and tested upstream.
