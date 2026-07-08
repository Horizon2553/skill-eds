# Blocks Context Folder

This folder is documentation only — it does not change any block behavior. It exists to
answer one recurring question before anyone (human or agent) writes a new block:

> **"Does this need a custom block, or can a generic EDS block already do it?"**

## Why this folder exists

Manager guidance: stop reaching for a custom block by default. Every block in `/blocks`
is code we own forever — it has to be built, styled, made responsive, made accessible,
linted, and kept in sync with AEM markup changes manually. Adobe's default/generic blocks
get none of that maintenance burden; they're already solved. A custom block is only worth
that ongoing cost when the generic ones genuinely cannot express what's needed.

## Files in this folder

| File | Purpose |
|---|---|
| [block-policy.md](./block-policy.md) | The rule itself and the reasoning behind it (the "why"). |
| [decision-guide.md](./decision-guide.md) | A checklist to run through *before* creating any new block. |
| [generic-blocks-catalog.md](./generic-blocks-catalog.md) | What generic/default blocks already exist and what each one covers. |
| [blocks-audit.md](./blocks-audit.md) | Every block currently in `/blocks` on this project, classified as Standard / Justified-Custom / Should-Be-Generic, with reasoning for each. |
| [consolidation-plan.md](./consolidation-plan.md) | The active plan to bring 17 blocks down to ~12: which blocks convert to generic, which merge into one via variations, staged by risk. |

## How to use this

- **Adding a new section to a page?** Read `decision-guide.md` first.
- **Reviewing a PR that adds a block?** Check `generic-blocks-catalog.md` to see if it duplicates something that already exists.
- **Auditing existing blocks?** `blocks-audit.md` has the current verdicts — update it when a block's justification changes (e.g. if a generic block gets adopted to replace one).
