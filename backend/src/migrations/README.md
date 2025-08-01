# Database Migrations

This directory contains database migration scripts for the Zemon backend.

## Available Migrations

### 1. Add User Profile Fields Migration
**File:** `add-user-profile-fields.ts`

This migration adds new fields to the User model:
- **Profile fields:** `aboutMe`, `location`, `skills`, `toolsAndTech`
- **College fields:** `collegeName`, `course`, `branch`, `year`, `city`, `state`
- **Social links:** `portfolio`, `github`, `linkedin`, `twitter`

#### Running the Migration

1. Make sure your `.env` file has the correct `MONGO_URI` or `DATABASE_URL`
2. Run the migration:
   ```bash
   npm run migrate:user-profile
   ```

### 2. Fix User Profile Fields Migration
**File:** `fix-user-profile-fields.ts`

This migration fixes issues with the previous migration by:
- Converting `null` values to empty strings for better editability
- Ensuring all nested objects (profile, college, socialLinks) exist
- Setting proper default values for all string fields

#### Running the Fix Migration

If you're experiencing issues with editing the profile fields (fields showing as null), run:
```bash
npm run migrate:fix-user-profile
```

#### What the Migration Does

- Connects to MongoDB using the environment variables
- Updates all existing user documents to include the new fields with default values
- Sets string fields to `null` and array fields to empty arrays `[]`
- Displays a summary of the migration results
- Shows sample user data after migration for verification

#### Migration Output Example

```
Connected to MongoDB
Total users in database: 150
Updated 150 users with new profile fields

Sample user after migration:
User 1:
  - Profile fields: { aboutMe: null, location: null, skills: [], toolsAndTech: [] }
  - College fields: { collegeName: null, course: null, branch: null, year: null, city: null, state: null }
  - Social links: { portfolio: null, github: null, linkedin: null, twitter: null }

Migration complete. Disconnected from MongoDB.
```

## Migration Best Practices

1. **Always backup your database** before running migrations
2. **Test migrations on a development database** first
3. **Run migrations during low-traffic periods**
4. **Monitor the migration output** for any errors
5. **Verify the migration results** by checking sample documents

## Adding New Migrations

When creating new migration scripts:

1. Follow the naming convention: `describe-what-migration-does.ts`
2. Include proper error handling and logging
3. Add a script to `package.json` for easy execution
4. Update this README with migration documentation
5. Test the migration thoroughly before running on production 