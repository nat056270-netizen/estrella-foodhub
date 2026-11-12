const sequelize = require('../backend/src/config/database');
const models = require('../backend/src/models');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    // Create missing tables while preserving existing data.
    await sequelize.sync();

    console.log('✓ Database migration completed successfully');
    console.log('✓ Missing tables created; existing records preserved');

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
