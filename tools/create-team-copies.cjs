#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const assignments = JSON.parse(fs.readFileSync(path.join(root, 'team/assignments.json'), 'utf8').replace(/^\uFEFF/, ''));
const output = path.join(root, 'team-workspaces');
const baseline = path.join(output, '_baseline');
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const inside = target => target.startsWith(root + path.sep);
function write(target, value) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, value, 'utf8'); }
function localEnv(target, values) { write(target, Object.entries(values).map(([key,value]) => key + '=' + value).join('\n') + '\n'); }

try {
  if (fs.existsSync(output)) throw new Error('team-workspaces already exists. Existing member work was left untouched. Choose a fresh checkout to create another set.');
  const sourceHead = git(root, 'rev-parse', 'HEAD');
  const sourceBranch = git(root, 'branch', '--show-current');
  const sourceIndex = fs.readFileSync(path.join(root,'.git/index'));
  const remote = git(root, 'remote', 'get-url', 'origin');
  if (!/^https:\/\/github\.com\/[^\s]+$/.test(remote) && !/^git@github\.com:[^\s]+$/.test(remote)) throw new Error('Expected a GitHub origin; inspect the repository remote before creating team copies.');
  fs.mkdirSync(output);
  execFileSync('git', ['clone', '--no-hardlinks', '--no-checkout', root, baseline], { stdio: 'pipe' });
  git(baseline, 'update-ref', 'refs/heads/' + assignments.integrationBranch, sourceHead);
  git(baseline, 'symbolic-ref', 'HEAD', 'refs/heads/' + assignments.integrationBranch);
  const candidates = execFileSync('git', ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  let copied = 0;
  for (const relative of new Set(candidates)) {
    if (/^(?:team-workspaces|\.git|\.vscode)(?:\/|$)/.test(relative)) continue;
    if (/(?:^|\/)(?:node_modules|dist|backups)(?:\/|$)/.test(relative)) continue;
    if (/(?:^|\/)\.env(?:$|\.(?!example$))/.test(relative)) continue;
    if (/(?:^|\/)(?:\.team-member\.json|OPEN_ME_FIRST\.md)$/.test(relative)) continue;
    const source = path.resolve(root, relative), destination = path.resolve(baseline, relative);
    if (!inside(source) || !destination.startsWith(baseline + path.sep)) throw new Error('Invalid snapshot path: ' + relative);
    if (!fs.existsSync(source) || !fs.lstatSync(source).isFile()) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied++;
  }
  git(baseline, 'add', '-A');
  const staged = git(baseline, 'ls-files').split(/\r?\n/);
  if (staged.some(file => /(?:^|\/)\.env(?:$|\.(?!example$))/.test(file))) throw new Error('A local environment file reached the snapshot. Stopping before commit.');
  git(baseline, '-c', 'user.name=Estrella Team Setup', '-c', 'user.email=local-setup@estrella.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', 'Prepare responsive ERP baseline and five-member collaboration workflow');
  git(baseline, 'remote', 'set-url', 'origin', remote);
  const commit = git(baseline, 'rev-parse', 'HEAD');
  const members = [];
  for (const member of assignments.members) {
    const directory = path.join(output, member.folder);
    execFileSync('git', ['clone', '--no-hardlinks', '--branch', assignments.integrationBranch, baseline, directory], { stdio: 'pipe' });
    git(directory, 'remote', 'set-url', 'origin', remote);
    git(directory, 'switch', '-c', member.branch);
    git(directory, 'config', 'pull.rebase', 'false');
    git(directory, 'config', 'push.default', 'current');
    const project = path.join(directory, 'estrella-foodhub');
    localEnv(path.join(project, 'backend/.env'), {
      DB_HOST:'127.0.0.1',DB_PORT:'3306',DB_USER:'root',DB_PASSWORD:'',DB_NAME:member.database,
      PORT:member.backendPort,NODE_ENV:'development',JWT_SECRET:crypto.randomBytes(32).toString('hex'),JWT_EXPIRE:'7d',
      FRONTEND_URL:'http://localhost:' + member.frontendPort
    });
    localEnv(path.join(project, 'frontend/.env'), {
      VITE_API_URL:'/api',VITE_API_PROXY_TARGET:'http://127.0.0.1:' + member.backendPort,
      VITE_PORT:member.frontendPort,VITE_DEV_HOST:'localhost'
    });
    write(path.join(directory, '.team-member.json'), JSON.stringify({ ...member, baselineCommit:commit }, null, 2) + '\n');
    write(path.join(directory, 'OPEN_ME_FIRST.md'), [
      '# ' + member.name + ' - ' + member.title, '',
      'This is a complete independent copy of the ERP. Your branch is ' + member.branch + '.',
      'Start with team/WORKFLOW.md and team/' + member.id + '.md.',
      'Frontend: http://localhost:' + member.frontendPort,
      'Backend: http://localhost:' + member.backendPort + '/api',
      'Local MySQL database: ' + member.database + ' (create this empty database before first setup).',
      '', 'Install dependencies with npm.cmd ci in estrella-foodhub/backend and estrella-foodhub/frontend.',
      'On the new member database only, run npm.cmd run migrate and npm.cmd run seed from backend.',
      'Start npm.cmd run dev from backend and frontend in separate terminals.',
      '', 'No production database or current local environment files were copied. Your new .env files are local and ignored. See the workflow for the retained original Git history.',
      'Do not rerun the menu importer on other members databases unless replacing that database catalog is intended.',
      '', 'Publish integration first as described in team/WORKFLOW.md, then push your assigned feature branch.',
      'Never force-push or replace the main branch. Git transfers code; each member keeps separate local data.', ''
    ].join('\n'));
    if (git(directory, 'status', '--porcelain')) throw new Error('Member checkout should be clean: ' + member.id);
    members.push({ member:member.name, feature:member.title, branch:member.branch, directory, frontendPort:member.frontendPort, backendPort:member.backendPort, database:member.database });
  }
  if (git(root,'rev-parse','HEAD') !== sourceHead || git(root,'branch','--show-current') !== sourceBranch || !fs.readFileSync(path.join(root,'.git/index')).equals(sourceIndex)) throw new Error('Original repository state unexpectedly changed');
  write(path.join(output, 'COPIES.json'), JSON.stringify({ baselineCommit:commit, integrationBranch:assignments.integrationBranch, origin:remote, sourceHead, sourceFiles:copied, members }, null, 2) + '\n');
  write(path.join(output, 'START_HERE.md'), '# Five independent ERP copies\n\nSee ../team/WORKFLOW.md for assignments and the pull/push process.\n\nPublish the shared baseline from _baseline first, using the exact command in the workflow. Each member folder has OPEN_ME_FIRST.md with its own ports, database and branch. No remote pushes were performed.\n\nThe original working folder and database were preserved.\n');
  console.log(JSON.stringify({ created:true, baselineCommit:commit, integrationBranch:assignments.integrationBranch, sourceFiles:copied, members }, null, 2));
} catch (error) {
  console.error(error.message);
  if (error.stderr) console.error(String(error.stderr).slice(0,2000));
  process.exitCode = 1;
}

