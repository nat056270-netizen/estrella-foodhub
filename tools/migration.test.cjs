const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
test('normal migration creates missing tables without requesting a destructive reset',async()=>{
  const calls=[];
  let exitCode;
  const source=fs.readFileSync(path.join(__dirname,'../estrella-foodhub/database/migrate.js'),'utf8');
  vm.runInNewContext(source,{
    require:name=>name.includes('config/database')?{sync:async(...args)=>calls.push(args)}:{},
    console:{log(){},error(){}},process:{exit:code=>{exitCode=code}}
  });
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls.length,1);
  assert.deepEqual(calls[0],[]);
  assert.equal(exitCode,0);
});

