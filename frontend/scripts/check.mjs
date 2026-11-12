import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;
const files = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(path.join(dir,entry.name)) : /\.(jsx|js)$/.test(entry.name) ? [path.join(dir,entry.name)] : []);
const failures = [];
const hasReadableContent = children => children.some(child =>
  child.type === 'JSXText' && child.value.trim() ||
  child.type === 'JSXExpressionContainer' ||
  child.type === 'JSXElement' && hasReadableContent(child.children)
);
let count = 0;
for (const file of files('src')) {
  count++;
  let ast;
  try { ast = parse(fs.readFileSync(file,'utf8'),{sourceType:'module',plugins:['jsx']}); }
  catch(error) { failures.push(file+': '+error.message); continue; }
  const ids = new Set();
  const labels = [];
  const controls = [];
  traverse(ast,{
    JSXOpeningElement(p) {
      const node = p.node;
      const name = node.name.name;
      const attrs = new Map();
      for (const attr of node.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attrs.has(attr.name.name)) failures.push(file+': duplicate '+attr.name.name+' on '+name);
        attrs.set(attr.name.name,attr.value);
      }
      const id = attrs.get('id');
      if (id?.type === 'StringLiteral') ids.add(id.value);
      if (name === 'label' && attrs.get('htmlFor')?.type === 'StringLiteral') labels.push(attrs.get('htmlFor').value);
      if (['input','select','textarea'].includes(name) && attrs.get('type')?.value !== 'hidden') controls.push({node:p.parentPath.node,attrs,name});
      if (name === 'button') {
        if (!attrs.has('type')) failures.push(file+': button missing explicit type');
        const children = p.parentPath.node.children || [];
        const hasText = hasReadableContent(children);
        if (!hasText && !attrs.has('aria-label') && !attrs.has('aria-labelledby') && !attrs.has('title')) failures.push(file+': icon button missing accessible name');
      }
    }
  });
  for(const id of labels) if(!ids.has(id)) failures.push(file+': label has no matching control '+id);
  for(const {node,attrs,name} of controls) {
    const id = attrs.get('id')?.value;
    const wrapped = name === 'input' && attrs.get('type')?.value === 'checkbox';
    if(!attrs.has('aria-label') && !attrs.has('aria-labelledby') && !(id && labels.includes(id)) && !wrapped) failures.push(file+': '+name+' missing associated label'+(id ? ' ('+id+')' : ''));
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode=1; }
else console.log('Source checks passed for '+count+' files (syntax, duplicate attributes, control names, label targets, button types).');

