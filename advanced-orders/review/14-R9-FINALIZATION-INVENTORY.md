# R9 Finalization Inventory

Status: `R9H_FINALIZATION_INVENTORY_COMPLETE`

Purpose: classify every file currently required for the final `advanced-orders` deliverable before destructive cleanup. This file is temporary construction evidence and is itself classified `REMOVABLE` after cleanup verification.

## Verified pre-inventory snapshot

The `advanced-orders` tree contained 61 files before this inventory file was added:

- 1 generated learner-facing master
- 40 files under `source/` = exactly 39 `ready` manifest sources + `manifest.json`
- 2 files under `build/`
- 3 files under `print/`
- 2 legacy files under `parts/`
- 13 files under `review/`

After this inventory commit, the tree contains 62 files because this file becomes the 14th `review/` file.

The source tree was compared against `source/manifest.json`: there are no extra source files outside the 39 manifest entries plus the manifest itself.

## Classification

### FINAL-COURSE — keep

- `advanced-orders/ADVANCED-ORDER-MASTERY.md`

Reason: final generated learner-facing printable course. Its deterministic SHA-256 is recorded in the manifest and has already passed CI generation and browser-level print verification.

### BUILD-REQUIRED — keep

- `advanced-orders/source/manifest.json`
- all 39 Markdown files referenced by `manifest.entries`
- `advanced-orders/build/assemble.mjs`
- `.github/workflows/advanced-orders-generate.yml`

Reason: these are the canonical sources and deterministic external generation path. `source/` is already clean: every Markdown file there is a ready manifest entry.

### PRINT-REQUIRED / VERIFICATION-REQUIRED — keep

- `advanced-orders/print/index.html`
- `advanced-orders/print/serve.mjs`
- `advanced-orders/print/verify-print.mjs`
- `.github/workflows/advanced-orders-print-verify.yml`

Reason: these files provide the compact print viewer and the external browser/print verification that already passed in Chromium via GitHub Actions.

### REMOVABLE — delete in cleanup

#### Entire legacy parts tree

- `advanced-orders/parts/10C-EXIT-DECISION.md`
- `advanced-orders/parts/10D-FULL-DECISION-ENGINE.md`

Reason: obsolete pre-canonical duplicates. Canonical replacements exist under `advanced-orders/source/` and the manifest references only those canonical source files.

#### Entire review/audit tree

- `advanced-orders/review/01-STRUCTURE-COVERAGE-CLARITY.md`
- `advanced-orders/review/02-PROFESSIONAL-DEPTH-MISSING-ADVANCED-ORDER-CONCEPTS.md`
- `advanced-orders/review/03-WHY-WHEN-WHY-NOT-COMPARISONS-EXAMPLES.md`
- `advanced-orders/review/04-CONSISTENCY-TERMINOLOGY-DUPLICATION-CONTRADICTIONS.md`
- `advanced-orders/review/05-ENGINE-FIT-PRIORITY-AND-OPERATIONAL-MAPPING.md`
- `advanced-orders/review/06-PRODUCTION-SAFETY-FAILURE-COMPLETENESS.md`
- `advanced-orders/review/07-LEARNING-COMPLETENESS-PRACTITIONER-INSIGHTS.md`
- `advanced-orders/review/08-FINAL-GAP-LIST.md`
- `advanced-orders/review/09-R4-CLOSEOUT-AUDIT.md`
- `advanced-orders/review/10-R5-CLOSEOUT-AUDIT.md`
- `advanced-orders/review/11-R6-CLOSEOUT-AUDIT.md`
- `advanced-orders/review/12-R7-CLOSEOUT-AUDIT.md`
- `advanced-orders/review/13-R8-CLOSEOUT-AUDIT.md`
- `advanced-orders/review/14-R9-FINALIZATION-INVENTORY.md` (this temporary inventory)

Reason: construction/review evidence only. The final learner-facing deliverable does not depend on these files, and `finalizationPolicy.removeBeforeFinalCompletion` explicitly requires review and closeout audit files to be removed.

#### Superseded local runner

- `advanced-orders/build/generate-course.cmd`

Reason: the canonical runner is now GitHub Actions. CI has already generated and verified the master without local-runtime dependency, so the Windows-only helper no longer contributes to the required final build path.

## Cleanup target

Delete exactly 17 files from the post-inventory tree:

- 14 files in `review/`
- 2 files in `parts/`
- 1 superseded local `.cmd` runner

Expected retained `advanced-orders` tree after cleanup: 45 files:

- 1 final master
- 40 canonical source/manifest files
- 1 deterministic assembler
- 3 print/verification files

The two GitHub Actions workflows remain outside `advanced-orders` as required external generation/verification infrastructure.

## Safety gates before final completion

After deletion, final closeout must verify all of the following:

1. `parts/` and `review/` no longer exist as tracked trees.
2. `build/` contains only `assemble.mjs`.
3. `source/` still contains exactly the 39 ready manifest sources plus `manifest.json`.
4. `node advanced-orders/build/assemble.mjs --check` succeeds in CI against the retained generated master.
5. Browser-level print verification still succeeds from the retained files.
6. No unexpected file exists under `advanced-orders` outside `ADVANCED-ORDER-MASTERY.md`, `source/`, `build/`, and `print/`.
7. Final manifest state is advanced to completed only after the post-deletion assembly and print checks are green.
