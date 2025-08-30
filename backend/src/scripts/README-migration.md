# Requirements Structure Migration Guide

This guide explains how to migrate existing CrucibleProblem data from the old string array format to the new `IRequirement` object format.

## Overview

The migration converts requirements from:
```typescript
// Old format
requirements: {
  functional: ['requirement 1', 'requirement 2'],
  nonFunctional: ['requirement 3']
}

// New format
requirements: {
  functional: [
    { requirement: 'requirement 1', context: '' },
    { requirement: 'requirement 2', context: '' }
  ],
  nonFunctional: [
    { requirement: 'requirement 3', context: '' }
  ]
}
```

## Migration Scripts

### 1. Run Migration
```bash
npm run migrate:requirements
```
This command will:
- Connect to the database
- Find all CrucibleProblem documents
- Convert string arrays to IRequirement objects
- Set context to empty string for existing requirements
- Update all documents in the database

### 2. Validate Migration
```bash
npm run migrate:requirements:validate
```
This command will:
- Check how many problems still use the old structure
- Check how many problems use the new structure
- Show sample of migrated problems
- Provide validation summary

### 3. Rollback Migration (if needed)
```bash
npm run migrate:requirements:rollback
```
This command will:
- Revert all problems back to the old string array format
- Extract requirement text from IRequirement objects
- **WARNING**: This will lose any context data that was added

## Safety Features

### Backup Recommendation
Before running migration in production:
1. Create a database backup
2. Test migration on development database first
3. Verify data integrity after migration

### Error Handling
- The migration processes problems one by one
- If one problem fails, others continue processing
- All errors are logged with problem IDs
- Migration summary shows success/error counts

### Rollback Safety
- Rollback function is available if issues arise
- Can restore to previous state
- No data loss during rollback

## Migration Process

1. **Pre-migration**: Run validation to see current state
2. **Migration**: Execute migration script
3. **Post-migration**: Run validation to confirm success
4. **Verification**: Check UI displays correctly

## Example Output

### Migration
```
🚀 Starting CrucibleProblem requirements structure migration...
✅ Connected to database
📊 Found 15 problems to migrate
✅ Migrated problem: Design a URL Shortener (ID: 507f1f77bcf86cd799439011)
   Functional: 3 requirements converted
   Non-Functional: 1 requirements converted
✅ Migrated problem: Real-Time Chat System (ID: 507f1f77bcf86cd799439012)
   Functional: 3 requirements converted
   Non-Functional: 1 requirements converted

📋 Migration Summary:
✅ Successfully migrated: 15 problems
⏭️  Skipped (already migrated): 0 problems
❌ Errors: 0 problems
📊 Total processed: 15 problems

🎉 Migration completed successfully!
🔌 Disconnected from database
```

### Validation
```
🔍 Validating migration results...

📊 Validation Results:
🔴 Problems with old structure: 0
🟢 Problems with new structure: 15

🟢 Sample of migrated problems:
   - Design a URL Shortener (ID: 507f1f77bcf86cd799439011)
     Functional: 3 requirements
     Non-Functional: 1 requirements
   - Real-Time Chat System (ID: 507f1f77bcf86cd799439012)
     Functional: 3 requirements
     Non-Functional: 1 requirements

🎉 All problems successfully migrated to new structure!
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure MongoDB is running and connection string is correct
2. **Permission Error**: Ensure database user has write permissions
3. **Validation Shows Old Structure**: Re-run migration if some problems were missed

### Manual Rollback
If the rollback script fails, you can manually revert using MongoDB:
```javascript
// Connect to MongoDB and run:
db.crucibleproblems.updateMany(
  { 'requirements.functional.0.requirement': { $exists: true } },
  {
    $set: {
      'requirements.functional': { $map: { input: '$requirements.functional', as: 'req', in: '$$req.requirement' } },
      'requirements.nonFunctional': { $map: { input: '$requirements.nonFunctional', as: 'req', in: '$$req.requirement' } }
    }
  }
)
```

## Post-Migration

After successful migration:
1. Verify UI displays requirements correctly
2. Check that existing functionality works
3. Consider adding context to requirements for better user experience
4. Update any other systems that consume this data

## Support

If you encounter issues:
1. Check the migration logs for specific error messages
2. Verify database connectivity and permissions
3. Test on a small dataset first
4. Use the validation command to check migration status
