import { config } from '../src/config/env';
import addProfileBackgroundField from '../src/migrations/add-profile-background-field';

const runMigration = async () => {
  try {
    console.log('Starting profile background migration...');
    await addProfileBackgroundField();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration(); 