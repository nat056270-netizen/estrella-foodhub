const sequelize = require('../backend/src/config/database');
const models = require('../backend/src/models');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    // Create all tables
    await sequelize.sync({ force: true });

    console.log('✓ Database migration completed successfully');
    console.log('✓ All tables created');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
