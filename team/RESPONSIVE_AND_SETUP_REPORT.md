# Responsive ERP and five-member setup

## Implemented

- Narrow-workspace POS order dock and modal retain the existing cart/payment state and server request format.
- Phone table cards display each field's column label and keep actions touch-sized. Desktop tables remain available.
- Workspace-aware dashboard layout, tablet login, bounded dialogs, safe-area padding, short-laptop adjustments, horizontal category scrolling and consistent touch controls.
- Same-origin API proxy support for phones/tablets. Configurable frontend port, host and backend proxy target.
- Six-stall menu and existing authentication, checkout, stock, receipt and report flows retained.
- Five independent full-code copies, each with a feature branch, owned-file guide, local ignored environment configuration, unique ports and a unique development database name.
- Shared local integration baseline prepared from the current source without changing the original main branch or index.
- Dependency lockfiles retained for reproducible npm ci installations.
- Default database migration now creates missing tables without dropping existing tables.
- Pull request template, ownership checker, and the documented integration/pull/push process.

## Validation

- Frontend source checker: passed for 41 source files.
- Frontend tests: 34 passed.
- Assignment/migration tooling tests: 5 passed.
- Production build: passed.
- Assignment patterns tested for correct ownership and shared-file handling.
- Copy integrity, branch, origin and original-repository checks are performed when creating the copies.

No database migration, seeder, transaction, database copy or remote push is run by the team-copy generator. Each member initializes their own empty development database.

Native/browser computer access was unavailable. Actual screenshot checks at 320, 375, 768, 1024, 1440 and 1920px, keyboard navigation, phone keyboard behavior and printer output remain manual checks. See WORKFLOW.md for physical phone/tablet access and the full collaboration process.

