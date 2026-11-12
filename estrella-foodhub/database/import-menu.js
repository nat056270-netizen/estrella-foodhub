const fs = require('node:fs');
const path = require('node:path');
require('../backend/node_modules/dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
const sequelize = require('../backend/src/config/database');
const { Op } = require('../backend/node_modules/sequelize');
const { Product, Category, Sale, SaleItem, Purchase, InventoryMovement, ActivityLog } = require('../backend/src/models');
const { catalog, categoryValues, productValues, validateCatalog } = require('./menu/catalog');
sequelize.options.logging = false;

async function historyCounts(transaction) {
  const models = { sales: Sale, saleItems: SaleItem, purchases: Purchase, movements: InventoryMovement };
  const result = {};
  for (const [key,model] of Object.entries(models)) result[key] = await model.count({transaction});
  return result;
}

async function verify(transaction) {
  const products = await Product.findAll({where:{status:'active'},transaction});
  const categories = await Category.findAll({where:{status:'active'},transaction});
  const expected = validateCatalog();
  if (products.length !== expected.products || categories.length !== expected.categories) throw new Error('Active catalog counts do not match the supplied menu');
  for (const section of catalog.sections) {
    const category = categories.find(row => row.name === categoryValues(section).name);
    if (!category) throw new Error('Missing category: ' + section.name);
    for (const item of section.items) {
      const product = products.find(row => row.sku === item.sku);
      if (!product || product.name !== item.name || Number(product.selling_price) !== item.price || product.category_id !== category.id) throw new Error('Menu mismatch: ' + item.name);
    }
  }
  return expected;
}

async function main() {
  const expected = validateCatalog();
  const flags = process.argv.slice(2);
  if (flags.some(flag => !['--apply','--check'].includes(flag)) || flags.length > 1) throw new Error('Use no arguments for a dry run, --apply to import, or --check to verify');
  await sequelize.authenticate();
  if (flags.includes('--check')) {
    console.log(JSON.stringify({verified:await verify(),history:await historyCounts()},null,2));
    return;
  }
  if (!flags.includes('--apply')) {
    console.log(JSON.stringify({mode:'dry-run',database:sequelize.config.database,...expected,activeProductsToArchive:await Product.count({where:{status:'active',sku:{[Op.notIn]:catalog.sections.flatMap(section=>section.items.map(item=>item.sku))}}}),newProductStock:0,newProductCost:0},null,2));
    return;
  }
  const backupDirectory = path.resolve(__dirname,'backups');
  fs.mkdirSync(backupDirectory,{recursive:true});
  const backupPath = path.join(backupDirectory,'menu-before-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
  const result = await sequelize.transaction(async transaction => {
    const categories = await Category.findAll({transaction,lock:transaction.LOCK.UPDATE,order:[['id','ASC']]});
    const products = await Product.findAll({transaction,lock:transaction.LOCK.UPDATE,order:[['id','ASC']]});
    const history = await historyCounts(transaction);
    fs.writeFileSync(backupPath,JSON.stringify({createdAt:new Date().toISOString(),database:sequelize.config.database,categories:categories.map(row=>row.toJSON()),products:products.map(row=>row.toJSON()),history},null,2),{encoding:'utf8',flag:'wx'});
    const ids = [];
    const skus = [];
    let created = 0;
    for (const section of catalog.sections) {
      const values = categoryValues(section);
      let category = categories.find(row => row.name === values.name);
      if (category) await category.update(values,{transaction});
      else category = await Category.create(values,{transaction});
      ids.push(category.id);
      for (const item of section.items) {
        const values = {...productValues(section,item),category_id:category.id};
        const product = products.find(row=>row.sku===item.sku);
        if (product) await product.update(values,{transaction});
        else {
          await Product.create({...values,supplier_id:null,barcode:null,cost_price:0,current_stock:0,minimum_stock:0,maximum_stock:0,expiration_tracking:false,expiration_date:null},{transaction});
          created++;
        }
        skus.push(item.sku);
      }
    }
    const [archivedProducts] = await Product.update({status:'inactive'},{where:{status:'active',sku:{[Op.notIn]:skus}},transaction});
    const [archivedCategories] = await Category.update({status:'inactive'},{where:{status:'active',id:{[Op.notIn]:ids}},transaction});
    await verify(transaction);
    const after = await historyCounts(transaction);
    if (JSON.stringify(history) !== JSON.stringify(after)) throw new Error('History counts changed during import; rolling back catalog changes');
    await ActivityLog.create({user_id:null,action:'Import Menu',module:'Products',description:'Imported supplied six-stall menu: '+expected.products+' items in '+expected.categories+' sections. Archived '+archivedProducts+' previous products. New cost and stock values require setup.'},{transaction});
    return {...expected,created,archivedProducts,archivedCategories,history};
  });
  console.log(JSON.stringify({applied:true,database:sequelize.config.database,...result,backup:backupPath},null,2));
}

main().catch(error=>{ console.error(error.message); process.exitCode=1; }).finally(()=>sequelize.close());

