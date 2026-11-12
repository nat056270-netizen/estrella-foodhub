const { catalog, categoryValues, productValues, validateCatalog } = require('./menu/catalog');
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

    // Seed the supplied stall menu instead of the previous sample categories.
    validateCatalog();
    const categories = await Category.bulkCreate(catalog.sections.map(categoryValues));
    console.log('Menu categories created: ' + categories.length);

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

    // Opening stock and costs were not supplied. Never invent inventory quantities.
    const products = await Product.bulkCreate(catalog.sections.flatMap((section, index) =>
      section.items.map(item => ({
        ...productValues(section, item),
        category_id: categories[index].id,
        supplier_id: null,
        cost_price: 0,
        current_stock: 0,
        minimum_stock: 0,
        maximum_stock: 0,
        expiration_tracking: false
      }))
    ));
    console.log('Menu products created: ' + products.length);

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
