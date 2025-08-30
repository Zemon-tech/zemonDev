import mongoose from 'mongoose';
import env from '../config/env';
import { CrucibleProblem } from '../models';

// Interface for the new requirements structure
interface IRequirement {
  requirement: string;
  context: string;
}

interface IRequirements {
  functional: IRequirement[];
  nonFunctional: IRequirement[];
}

// Migration function to convert string arrays to IRequirement objects
function convertRequirementsToNewStructure(oldRequirements: any): IRequirements {
  const convertArray = (reqArray: any[]): IRequirement[] => {
    if (!Array.isArray(reqArray)) return [];
    
    return reqArray
      .filter(req => req && req.trim && req.trim() !== '') // Filter out empty strings
      .map(req => {
        if (typeof req === 'string') {
          // Convert string to IRequirement with empty context
          return { requirement: req.trim(), context: '' };
        } else if (req && typeof req === 'object' && 'requirement' in req) {
          // Already in new format, ensure context exists and requirement is not empty
          const requirement = req.requirement || '';
          if (!requirement.trim()) return null; // Skip empty requirements
          return { 
            requirement: requirement.trim(), 
            context: req.context || '' 
          };
        } else {
          // Fallback: treat as string
          const requirement = String(req).trim();
          if (!requirement) return null; // Skip empty requirements
          return { requirement, context: '' };
        }
      })
      .filter(req => req !== null) as IRequirement[]; // Remove null entries
  };

  return {
    functional: convertArray(oldRequirements?.functional || []),
    nonFunctional: convertArray(oldRequirements?.nonFunctional || [])
  };
}

// Main migration function
async function migrateRequirementsStructure() {
  try {
    console.log('🚀 Starting CrucibleProblem requirements structure migration...');
    
    // Connect to database
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to database');
    
    // Get all problems that need migration
    const problems = await CrucibleProblem.find({});
    console.log(`📊 Found ${problems.length} problems to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each problem
    for (const problem of problems) {
      try {
        const oldRequirements = problem.requirements;
        
        // Check if migration is needed
        if (oldRequirements && 
            (Array.isArray(oldRequirements.functional) || Array.isArray(oldRequirements.nonFunctional))) {
          
          // Convert requirements to new structure
          const newRequirements = convertRequirementsToNewStructure(oldRequirements);
          
          // Validate that we have at least some requirements
          if (newRequirements.functional.length === 0 && newRequirements.nonFunctional.length === 0) {
            console.log(`⚠️  Warning: Problem ${problem.title} has no valid requirements after conversion`);
            // Set default requirements to prevent validation errors
            newRequirements.functional = [{ requirement: 'Default requirement', context: 'Auto-generated during migration' }];
          }
          
          // Update the problem
          await CrucibleProblem.updateOne(
            { _id: problem._id },
            { 
              $set: { 
                requirements: newRequirements,
                updatedAt: new Date()
              }
            }
          );
          
          migratedCount++;
          console.log(`✅ Migrated problem: ${problem.title} (ID: ${problem._id})`);
          
          // Log the conversion details
          if (oldRequirements.functional) {
            console.log(`   Functional: ${oldRequirements.functional.length} requirements converted`);
          }
          if (oldRequirements.nonFunctional) {
            console.log(`   Non-Functional: ${oldRequirements.nonFunctional.length} requirements converted`);
          }
          
        } else {
          // Already in new format or no requirements
          skippedCount++;
          console.log(`⏭️  Skipped problem: ${problem.title} (ID: ${problem._id}) - already migrated or no requirements`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating problem ${problem._id}:`, error);
      }
    }
    
    // Migration summary
    console.log('\n📋 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} problems`);
    console.log(`⏭️  Skipped (already migrated): ${skippedCount} problems`);
    console.log(`❌ Errors: ${errorCount} problems`);
    console.log(`📊 Total processed: ${problems.length} problems`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Check logs above.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Rollback function in case we need to revert
async function rollbackRequirementsStructure() {
  try {
    console.log('🔄 Starting rollback of requirements structure...');
    
    // Connect to database
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to database');
    
    // Find problems with new structure
    const problems = await CrucibleProblem.find({
      'requirements.functional.0.requirement': { $exists: true }
    });
    
    console.log(`📊 Found ${problems.length} problems to rollback`);
    
    let rollbackCount = 0;
    
    for (const problem of problems) {
      try {
        // Convert back to old structure (extract just the requirement text)
        const oldRequirements = {
          functional: problem.requirements.functional.map((req: IRequirement) => req.requirement),
          nonFunctional: problem.requirements.nonFunctional.map((req: IRequirement) => req.requirement)
        };
        
        // Update the problem
        await CrucibleProblem.updateOne(
          { _id: problem._id },
          { 
            $set: { 
              requirements: oldRequirements,
              updatedAt: new Date()
            }
          }
        );
        
        rollbackCount++;
        console.log(`🔄 Rolled back problem: ${problem.title} (ID: ${problem._id})`);
        
      } catch (error) {
        console.error(`❌ Error rolling back problem ${problem._id}:`, error);
      }
    }
    
    console.log(`\n📋 Rollback Summary: ${rollbackCount} problems rolled back`);
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Validation function to check migration results
async function validateMigration() {
  try {
    console.log('🔍 Validating migration results...');
    
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to database');
    
    // Check for problems still using old structure
    const oldStructureProblems = await CrucibleProblem.find({
      $or: [
        { 'requirements.functional.0': { $type: 'string' } },
        { 'requirements.nonFunctional.0': { $type: 'string' } }
      ]
    });
    
    // Check for problems using new structure
    const newStructureProblems = await CrucibleProblem.find({
      'requirements.functional.0.requirement': { $exists: true }
    });
    
    // Check for problems with empty requirements
    const emptyRequirementsProblems = await CrucibleProblem.find({
      $or: [
        { 'requirements.functional.0.requirement': '' },
        { 'requirements.nonFunctional.0.requirement': '' }
      ]
    });
    
    console.log('\n📊 Validation Results:');
    console.log(`🔴 Problems with old structure: ${oldStructureProblems.length}`);
    console.log(`🟢 Problems with new structure: ${newStructureProblems.length}`);
    console.log(`⚠️  Problems with empty requirements: ${emptyRequirementsProblems.length}`);
    
    if (oldStructureProblems.length > 0) {
      console.log('\n🔴 Problems still using old structure:');
      oldStructureProblems.forEach(problem => {
        console.log(`   - ${problem.title} (ID: ${problem._id})`);
      });
    }
    
    if (emptyRequirementsProblems.length > 0) {
      console.log('\n⚠️  Problems with empty requirements:');
      emptyRequirementsProblems.forEach(problem => {
        console.log(`   - ${problem.title} (ID: ${problem._id})`);
      });
    }
    
    if (newStructureProblems.length > 0) {
      console.log('\n🟢 Sample of migrated problems:');
      newStructureProblems.slice(0, 3).forEach(problem => {
        console.log(`   - ${problem.title} (ID: ${problem._id})`);
        console.log(`     Functional: ${problem.requirements.functional.length} requirements`);
        console.log(`     Non-Functional: ${problem.requirements.nonFunctional.length} requirements`);
      });
    }
    
    if (oldStructureProblems.length === 0 && emptyRequirementsProblems.length === 0) {
      console.log('\n🎉 All problems successfully migrated to new structure!');
    } else {
      console.log('\n⚠️  Some problems still need migration or have issues.');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      await migrateRequirementsStructure();
      break;
    case 'rollback':
      await rollbackRequirementsStructure();
      break;
    case 'validate':
      await validateMigration();
      break;
    default:
      console.log('Usage: npm run migrate-requirements <command>');
      console.log('Commands:');
      console.log('  migrate   - Convert requirements to new structure');
      console.log('  rollback  - Revert to old structure (if needed)');
      console.log('  validate  - Check migration status');
      console.log('\nExample: npm run migrate-requirements migrate');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { migrateRequirementsStructure, rollbackRequirementsStructure, validateMigration };
