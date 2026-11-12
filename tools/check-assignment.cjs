const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root,'team/assignments.json'),'utf8').replace(/^\uFEFF/,''));
const localPath = path.join(root,'.team-member.json');
const local = fs.existsSync(localPath) ? JSON.parse(fs.readFileSync(localPath,'utf8')) : {};
const args = process.argv.slice(2);
const id = args.find(value => value.startsWith('member-')) || local.id;
const member = config.members.find(value => value.id === id);
const git = (...values) => execFileSync('git',['-C',root,...values],{encoding:'utf8'}).trim();
const { classify } = require('./ownership.cjs');
try {
  if(!member) throw new Error('Use node tools/check-assignment.cjs member-1 (through member-5), or run it inside your generated member copy.');
  const baseIndex=args.indexOf('--base');
  const base=baseIndex>=0 ? args[baseIndex+1] : config.integrationBranch;
  const committed=git('diff','--name-only',base+'...HEAD').split(/\r?\n/);
  const pending=git('diff','--name-only','HEAD').split(/\r?\n/);
  const untracked=git('ls-files','--others','--exclude-standard').split(/\r?\n/);
  const files=[...new Set([...committed,...pending,...untracked])].filter(Boolean);
  const result={member:member.name,feature:member.title,owned:[],shared:[],coordinate:[]};
  for(const file of files) {
    const {type,owner}=classify(config,member.id,file);
    if(type==='owned') result.owned.push(file);
    else if(type==='shared') result.shared.push(file);
    else result.coordinate.push({file,owner:owner?.name || 'Integration owner'});
  }
  console.log(JSON.stringify(result,null,2));
  if(args.includes('--strict') && result.coordinate.length) process.exitCode=1;
} catch(error) { console.error(error.message); process.exitCode=1; }


