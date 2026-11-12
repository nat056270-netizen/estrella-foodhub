const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {matches,ownerOf,classify}=require('./ownership.cjs');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../team/assignments.json'),'utf8').replace(/^\uFEFF/,''));
test('all five members have separate branches, folders, ports and databases',()=>{
  assert.equal(config.members.length,5);
  for(const key of ['branch','folder','frontendPort','backendPort','database'])assert.equal(new Set(config.members.map(member=>member[key])).size,5,key);
});
test('module patterns match nested paths and escape literal filename punctuation',()=>{
  assert.equal(matches('estrella-foodhub/frontend/src/components/Modal.jsx','estrella-foodhub/frontend/src/components/**'),true);
  assert.equal(matches('test.jsx','test.jsx'),true);
  assert.equal(matches('testXjsx','test.jsx'),false);
  assert.equal(matches('a/b/config.js','a/*/config.js'),true);
});
test('specific receipt ownership takes priority over shared component-folder ownership',()=>{
  assert.equal(ownerOf(config,'estrella-foodhub/frontend/src/components/Receipt.jsx').id,'member-1');
  assert.equal(ownerOf(config,'estrella-foodhub/frontend/src/components/Modal.jsx').id,'member-5');
});
test('shared infrastructure changes are visible without blocking normal feature ownership',()=>{
  assert.equal(classify(config,'member-2','estrella-foodhub/frontend/src/pages/Products.jsx').type,'owned');
  assert.equal(classify(config,'member-1','estrella-foodhub/backend/src/server.js').type,'shared');
  assert.equal(classify(config,'member-2','estrella-foodhub/frontend/src/pages/POS.jsx').type,'coordinate');
});


