const sequelize = require('../backend/src/config/database');
const {
  User,
  Category,
  Supplier,
  Product,
  Customer,
  Setting
} = require('../backend/src/models');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Create users
    console.log('Creating users...');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@estrellafoodhub.com',
      password: 'admin123',
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      phone: '09123456789',
      status: 'active'
    });

    const manager = await User.create({
      username: 'manager',
      email: 'manager@estrellafoodhub.com',
      password: 'manager123',
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      role: 'manager',
      phone: '09234567890',
      status: 'active'
    });

    const cashier = await User.create({
      username: 'cashier',
      email: 'cashier@estrellafoodhub.com',
      password: 'cashier123',
      first_name: 'Maria',
      last_name: 'Santos',
      role: 'cashier',
      phone: '09345678901',
      status: 'active'
    });

    const inventoryStaff = await User.create({
      username: 'inventory',
      email: 'inventory@estrellafoodhub.com',
      password: 'inventory123',
      first_name: 'Pedro',
      last_name: 'Reyes',
      role: 'inventory_staff',
      phone: '09456789012',
      status: 'active'
    });

    console.log('✓ Users created');

    // Create categories
    console.log('Creating categories...');
    const categories = await Category.bulkCreate([
      { name: 'Food', description: 'Food products', status: 'active' },
      { name: 'Beverages', description: 'Drinks and beverages', status: 'active' },
      { name: 'Snacks', description: 'Snack items', status: 'active' },
      { name: 'Frozen Products', description: 'Frozen food items', status: 'active' },
      { name: 'Grocery', description: 'Grocery items', status: 'active' },
      { name: 'Others', description: 'Other products', status: 'active' }
    ]);

    console.log('✓ Categories created');

    // Create suppliers
    console.log('Creating suppliers...');
    const suppliers = await Supplier.bulkCreate([
      {
        name: 'Manila Food Distributors',
        contact_person: 'Roberto Garcia',
        phone: '02-1234-5678',
        email: 'info@manilafoods.com',
        address: '123 Quezon Avenue, Quezon City',
        status: 'active'
      },
      {
        name: 'Fresh Harvest Supplies',
        contact_person: 'Elena Rodriguez',
        phone: '02-2345-6789',
        email: 'sales@freshharvest.com',
        address: '456 Rizal Street, Makati City',
        status: 'active'
      },
      {
        name: 'Metro Beverages Inc',
        contact_person: 'Carlos Mendoza',
        phone: '02-3456-7890',
        email: 'orders@metrobev.com',
        address: '789 Taft Avenue, Manila',
        status: 'active'
      },
      {
        name: 'Golden Snacks Trading',
        contact_person: 'Ana Lim',
        phone: '02-4567-8901',
        email: 'contact@goldensnacks.com',
        address: '321 Ortigas Avenue, Pasig City',
        status: 'active'
      },
      {
        name: 'Frozen Foods Express',
        contact_person: 'Miguel Santos',
        phone: '02-5678-9012',
        email: 'info@frozenexpress.com',
        address: '654 EDSA, Mandaluyong City',
        status: 'active'
      }
    ]);

    console.log('✓ Suppliers created');

    // Create products
    console.log('Creating products...');
    const products = await Product.bulkCreate([
      // Food items
      {
        sku: 'FOOD-001',
        barcode: '1234567890001',
        name: 'Chicken Burger',
        description: 'Delicious chicken burger',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        cost_price: 35.00,
        selling_price: 65.00,
        current_stock: 50,
        minimum_stock: 20,
        maximum_stock: 200,
        unit: 'pcs',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'FOOD-002',
        barcode: '1234567890002',
        name: 'Beef Tapa',
        description: 'Marinated beef tapa',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        cost_price: 80.00,
        selling_price: 120.00,
        current_stock: 40,
        minimum_stock: 15,
        maximum_stock: 150,
        unit: 'pcs',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'FOOD-003',
        barcode: '1234567890003',
        name: 'Fried Rice',
        description: 'Special fried rice',
        category_id: categories[0].id,
        supplier_id: suppliers[1].id,
        cost_price: 25.00,
        selling_price: 45.00,
        current_stock: 60,
        minimum_stock: 25,
        maximum_stock: 200,
        unit: 'pcs',
        status: 'active'
      },
      {
        sku: 'FOOD-004',
        barcode: '1234567890004',
        name: 'Pancit Canton',
        description: 'Filipino style noodles',
        category_id: categories[0].id,
        supplier_id: suppliers[1].id,
        cost_price: 30.00,
        selling_price: 55.00,
        current_stock: 45,
        minimum_stock: 20,
        maximum_stock: 180,
        unit: 'pcs',
        status: 'active'
      },
      // Beverages
      {
        sku: 'BEV-001',
        barcode: '1234567890005',
        name: 'Coke 1.5L',
        description: 'Coca-Cola 1.5 Liter',
        category_id: categories[1].id,
        supplier_id: suppliers[2].id,
        cost_price: 45.00,
        selling_price: 70.00,
        current_stock: 80,
        minimum_stock: 30,
        maximum_stock: 250,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'BEV-002',
        barcode: '1234567890006',
        name: 'Sprite 1.5L',
        description: 'Sprite 1.5 Liter',
        category_id: categories[1].id,
        supplier_id: suppliers[2].id,
        cost_price: 45.00,
        selling_price: 70.00,
        current_stock: 75,
        minimum_stock: 30,
        maximum_stock: 250,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'BEV-003',
        barcode: '1234567890007',
        name: 'Bottled Water 500ml',
        description: 'Purified drinking water',
        category_id: categories[1].id,
        supplier_id: suppliers[2].id,
        cost_price: 8.00,
        selling_price: 15.00,
        current_stock: 150,
        minimum_stock: 50,
        maximum_stock: 500,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'BEV-004',
        barcode: '1234567890008',
        name: 'Iced Tea 500ml',
        description: 'Refreshing iced tea',
        category_id: categories[1].id,
        supplier_id: suppliers[2].id,
        cost_price: 18.00,
        selling_price: 30.00,
        current_stock: 90,
        minimum_stock: 35,
        maximum_stock: 300,
        unit: 'bottle',
        status: 'active'
      },
      // Snacks
      {
        sku: 'SNK-001',
        barcode: '1234567890009',
        name: 'Potato Chips',
        description: 'Crispy potato chips',
        category_id: categories[2].id,
        supplier_id: suppliers[3].id,
        cost_price: 25.00,
        selling_price: 40.00,
        current_stock: 100,
        minimum_stock: 40,
        maximum_stock: 300,
        unit: 'pack',
        status: 'active'
      },
      {
        sku: 'SNK-002',
        barcode: '1234567890010',
        name: 'Cheese Crackers',
        description: 'Cheese flavored crackers',
        category_id: categories[2].id,
        supplier_id: suppliers[3].id,
        cost_price: 20.00,
        selling_price: 35.00,
        current_stock: 85,
        minimum_stock: 35,
        maximum_stock: 280,
        unit: 'pack',
        status: 'active'
      },
      {
        sku: 'SNK-003',
        barcode: '1234567890011',
        name: 'Chocolate Bar',
        description: 'Milk chocolate bar',
        category_id: categories[2].id,
        supplier_id: suppliers[3].id,
        cost_price: 15.00,
        selling_price: 25.00,
        current_stock: 120,
        minimum_stock: 50,
        maximum_stock: 400,
        unit: 'pcs',
        status: 'active'
      },
      {
        sku: 'SNK-004',
        barcode: '1234567890012',
        name: 'Peanuts',
        description: 'Roasted peanuts',
        category_id: categories[2].id,
        supplier_id: suppliers[3].id,
        cost_price: 30.00,
        selling_price: 50.00,
        current_stock: 70,
        minimum_stock: 30,
        maximum_stock: 250,
        unit: 'pack',
        status: 'active'
      },
      // Frozen Products
      {
        sku: 'FRZ-001',
        barcode: '1234567890013',
        name: 'Ice Cream Pint',
        description: 'Vanilla ice cream pint',
        category_id: categories[3].id,
        supplier_id: suppliers[4].id,
        cost_price: 80.00,
        selling_price: 130.00,
        current_stock: 35,
        minimum_stock: 15,
        maximum_stock: 120,
        unit: 'pint',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'FRZ-002',
        barcode: '1234567890014',
        name: 'Frozen French Fries',
        description: 'Frozen french fries 1kg',
        category_id: categories[3].id,
        supplier_id: suppliers[4].id,
        cost_price: 65.00,
        selling_price: 110.00,
        current_stock: 25,
        minimum_stock: 10,
        maximum_stock: 100,
        unit: 'pack',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        sku: 'FRZ-003',
        barcode: '1234567890015',
        name: 'Chicken Nuggets',
        description: 'Frozen chicken nuggets',
        category_id: categories[3].id,
        supplier_id: suppliers[4].id,
        cost_price: 120.00,
        selling_price: 180.00,
        current_stock: 30,
        minimum_stock: 12,
        maximum_stock: 150,
        unit: 'pack',
        expiration_tracking: true,
        expiration_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      // Grocery
      {
        sku: 'GRC-001',
        barcode: '1234567890016',
        name: 'Rice 5kg',
        description: 'Premium rice 5 kilograms',
        category_id: categories[4].id,
        supplier_id: suppliers[1].id,
        cost_price: 180.00,
        selling_price: 250.00,
        current_stock: 40,
        minimum_stock: 15,
        maximum_stock: 150,
        unit: 'pack',
        status: 'active'
      },
      {
        sku: 'GRC-002',
        barcode: '1234567890017',
        name: 'Cooking Oil 1L',
        description: 'Vegetable cooking oil',
        category_id: categories[4].id,
        supplier_id: suppliers[1].id,
        cost_price: 85.00,
        selling_price: 130.00,
        current_stock: 55,
        minimum_stock: 20,
        maximum_stock: 200,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'GRC-003',
        barcode: '1234567890018',
        name: 'Soy Sauce 500ml',
        description: 'Premium soy sauce',
        category_id: categories[4].id,
        supplier_id: suppliers[1].id,
        cost_price: 35.00,
        selling_price: 55.00,
        current_stock: 65,
        minimum_stock: 25,
        maximum_stock: 250,
        unit: 'bottle',
        status: 'active'
      },
      {
        sku: 'GRC-004',
        barcode: '1234567890019',
        name: 'Instant Noodles',
        description: 'Instant ramen noodles',
        category_id: categories[4].id,
        supplier_id: suppliers[1].id,
        cost_price: 8.00,
        selling_price: 15.00,
        current_stock: 200,
        minimum_stock: 80,
        maximum_stock: 600,
        unit: 'pack',
        status: 'active'
      },
      {
        sku: 'GRC-005',
        barcode: '1234567890020',
        name: 'Canned Sardines',
        description: 'Sardines in tomato sauce',
        category_id: categories[4].id,
        supplier_id: suppliers[1].id,
        cost_price: 22.00,
        selling_price: 35.00,
        current_stock: 90,
        minimum_stock: 35,
        maximum_stock: 350,
        unit: 'can',
        status: 'active'
      }
    ]);

    console.log('✓ Products created');

    // Create default walk-in customer
    console.log('Creating default customer...');
    await Customer.create({
      customer_id: 'CUST-000001',
      name: 'Walk-in Customer',
      phone: 'N/A',
      email: null,
      address: null,
      status: 'active'
    });

    console.log('✓ Default customer created');

    // Create system settings
    console.log('Creating system settings...');
    await Setting.bulkCreate([
      {
        key: 'business_name',
        value: 'ESTRELLA FOOD HUB',
        description: 'Business name'
      },
      {
        key: 'business_address',
        value: '123 Main Street, City, Province',
        description: 'Business address'
      },
      {
        key: 'business_phone',
        value: '09123456789',
        description: 'Business phone number'
      },
      {
        key: 'business_email',
        value: 'info@estrellafoodhub.com',
        description: 'Business email'
      },
      {
        key: 'tax_rate',
        value: '0',
        description: 'Tax rate percentage'
      },
      {
        key: 'currency',
        value: 'PHP',
        description: 'Currency code'
      },
      {
        key: 'currency_symbol',
        value: '₱',
        description: 'Currency symbol'
      }
    ]);

    console.log('✓ Settings created');

    console.log('\n========================================');
    console.log('✓ Database seeding completed successfully!');
    console.log('========================================\n');
    console.log('Test Accounts:');
    console.log('----------------------------');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('----------------------------');
    console.log('Manager:');
    console.log('  Username: manager');
    console.log('  Password: manager123');
    console.log('----------------------------');
    console.log('Cashier:');
    console.log('  Username: cashier');
    console.log('  Password: cashier123');
    console.log('----------------------------');
    console.log('Inventory Staff:');
    console.log('  Username: inventory');
    console.log('  Password: inventory123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
