# Five-member ERP workflow

Each member receives the complete application in an independent Git repository. The assigned branch and owned files define the feature responsibility. Existing application roles and permissions continue to control access in the running system.

The original folder remains your working system. Generated copies live in `team-workspaces/`, outside the source snapshot, and are ignored by the original repository.

## Assignment map

| Member | Feature responsibility | Branch | Frontend / API ports | Local database |
| --- | --- | --- | --- | --- |
| Member 1 | POS & Sales | `feature/member-1-pos-sales` | 5181 / 5011 | `estrella_member_1` |
| Member 2 | Products, Categories & Menu | `feature/member-2-catalog` | 5182 / 5012 | `estrella_member_2` |
| Member 3 | Inventory, Purchases & Suppliers | `feature/member-3-inventory-purchasing` | 5183 / 5013 | `estrella_member_3` |
| Member 4 | Customers, Authentication & Access | `feature/member-4-customers-access` | 5184 / 5014 | `estrella_member_4` |
| Member 5 | Dashboard, Reports, Expenses & Core UI | `feature/member-5-reports-core` | 5185 / 5015 | `estrella_member_5` |

Exact file ownership is in `team/assignments.json`. Each member also has a `team/member-N.md` guide. Update names there when your members' names are known.

Member 5 coordinates shared components, integration, application wiring and configuration. The member responsible for a feature owns its page, controller, routes and models. For example, a POS change that affects inventory should be coordinated between Members 1 and 3. Preserve existing API request and response formats unless all affected owners agree on the change.

## First publish: one integration baseline

The generated `_baseline` folder holds one local commit containing the current redesign, the supplied menu, responsive changes, and this team setup. All five member branches start from that same commit. The original repository's main branch and working index are not changed by the copy generator.

From the original repository root, the team leader publishes the prepared baseline once:

```powershell
git -C team-workspaces/_baseline push -u origin team/integration
```

If the remote already has an integration branch or newer work, fetch and review it before merging; do not force-push. Open a GitHub pull request for baseline review if your team uses main as the release branch. Keep feature pull requests targeted at `team/integration` while the five members develop their modules.

No push to GitHub is performed by the setup script.

## Give each member their copy

Give each member the entire corresponding `team-workspaces/member-...` folder, including its hidden `.git` folder. Each has an independent object store and a GitHub origin. The copies do not depend on the original folder or on each other.

Alternatively, after the leader publishes integration:

```powershell
git clone https://github.com/nat056270-netizen/estrella-foodhub.git
cd estrella-foodhub
git switch -c feature/member-1-pos-sales origin/team/integration
```

Use the assigned branch name for the actual member. On a fresh remote clone, copy the frontend/backend `.env.example` files to `.env` and configure that member's ports/database from the table. Generated copies already include local ignored environment files and an `OPEN_ME_FIRST.md` guide.

All members need their own GitHub accounts with write access granted by the repository owner, or they can use forks and pull requests. This setup does not change GitHub collaborator permissions.

## Run a member copy

1. Install Node.js and start MySQL in Laragon.
2. Read `OPEN_ME_FIRST.md` and confirm the backend `DB_NAME` is the member's local database.
3. Create that empty MySQL database through HeidiSQL/phpMyAdmin.
4. Install dependencies in both folders:

```powershell
cd estrella-foodhub/backend
npm.cmd ci
cd ../frontend
npm.cmd ci
```

5. On the new member database only, run from `backend/`:

```powershell
npm.cmd run migrate
npm.cmd run seed
```

The migration command now creates missing tables without dropping existing tables. The seeder is for an empty development database. Do not seed an existing business database.

6. Start `npm.cmd run dev` in separate backend and frontend terminals. The generated environment files choose that member's ports. Each copy contains the complete supplied six-stall menu. Actual stock/costs must be configured locally.

The copies carry source code and menu definitions. They do not carry production transactions or database dumps. Git pull/push transfers code; MySQL changes stay in each member's local database. Additive schema changes should be written as reviewed migration scripts.

## Daily pull, edit, check and push

From inside your member folder, first commit or stash work you need to retain. Example for Member 1:

```powershell
git switch feature/member-1-pos-sales
git fetch origin
git merge origin/team/integration
```

Edit your assigned files. Coordinate changes to shared files such as `App.jsx`, `server.js`, `models/index.js`, global CSS and package files.

Before committing:

```powershell
node tools/check-assignment.cjs
npm.cmd --prefix estrella-foodhub/frontend run check
npm.cmd --prefix estrella-foodhub/frontend test
npm.cmd --prefix estrella-foodhub/frontend run build
node --test tools/ownership.test.cjs
```

The assignment checker reports owned, shared and other-module files. It is a coordination aid. Add `--strict` to return a failure for changes to another member's owned files. A remote clone can pass an explicit ID, for example `node tools/check-assignment.cjs member-1`. After integration advances, use `--base origin/team/integration` to compare against its current remote baseline.

Set your own Git name/email before your first commit. Stage the intended source files, then:

```powershell
git commit -m "Improve POS checkout feedback"
git push -u origin feature/member-1-pos-sales
```

Open a pull request from your feature branch into `team/integration`. The team leader reviews and merges it. All members then fetch and merge `origin/team/integration` to receive the combined features. A later push on an already tracked feature branch can use `git push`; `git pull` updates that feature branch, while fetching/merging integration receives other members' merged work.

After each release is checked, the team leader can open a pull request from integration to main. Avoid force-pushing, copying whole edited folders over another member's working files, or committing local environment files/database dumps.

## Responsive checks and phone access

The app adapts to the workspace width: the POS uses a reachable order dock and modal on narrower screens, management tables become labeled cards on phones, and laptop/tablet layouts retain the full workflows.

Check widths 320, 375, 768, 1024, 1440 and 1920px, portrait/landscape, short laptop heights, both themes, keyboard navigation, dialogs, tables and checkout. Native browser access was unavailable in the implementation session; these visual and interaction checks must still be done on actual browsers.

For a physical phone/tablet, put both devices on the same trusted Wi-Fi. In the member frontend terminal:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

Open `http://YOUR-PC-LAN-IP:5181` using the appropriate member port. Keep `VITE_API_URL=/api`; Vite proxies API requests to that copy's backend. Using localhost as the API address on a phone would refer to the phone. Production hosting needs an equivalent /api reverse proxy or a real API URL.

## Regenerating copies

From a fresh source checkout with no `team-workspaces/` directory:

```powershell
node tools/create-team-copies.cjs
```

The script refuses to overwrite existing member work. It preserves the original repository, excludes local credentials/dependencies/build output/backups, creates a shared baseline commit in the generated baseline repository, and creates five independent branch checkouts. It never runs migrations, imports a menu into a database, or pushes remotely.


## Existing Git history

The new baseline excludes current local environment files and uses .env.example templates. The original initial commit tracked .env files; the independent clones retain that existing ancestry so normal Git merges work. Any real credentials previously committed should be rotated by the repository owner. This setup does not rewrite or force-push shared history.
