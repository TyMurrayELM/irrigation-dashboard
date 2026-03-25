# Irrigation Dashboard

React app for managing irrigation zones, controllers, and schedules across ELM properties. Built with React 19, Tailwind CSS, and Supabase.

## Getting Started

```bash
npm install
npm start        # dev server on http://localhost:3000
npm run build    # production build
```

## Adding New Properties

Properties live in the Supabase `properties` table. There are three ways to add them:

### Option 1: CSV Upload (Admin UI)

1. Log in as an admin user
2. Upload a CSV with these columns:
   - Job Name, Region, Branch, Account Manager, Property Type, Days Since Irrigation Invoice, Days Since Irrigation Visit, Gate Code
3. Existing properties (matched by name) are updated; new ones are created

### Option 2: Ask Claude Code

From this project directory, ask Claude to insert into Supabase. Provide:

- **name** (required) - property name or address
- **region** - `Phoenix` or `Las Vegas`
- **branch** - one of: `Phx - North`, `Phx - SouthWest`, `Phx - SouthEast`, `Las Vegas`
- **account_manager** - manager's full name
- **property_type** - one of: `Office`, `HOA`, `Retail`, `Industrial`, `Residential`, `Restaurant`

Example: "Add property 'Heritage West Shopping Center', Phoenix region, Phx - SouthWest branch, Emily Thompson, Retail"

### Option 3: Direct Supabase Insert

Insert directly into the `properties` table via the Supabase dashboard or API. Required fields:

```json
{
  "name": "Property Name",
  "address": "Property Name",
  "region": "Phoenix",
  "branch": "Phx - North",
  "account_manager": "First Last",
  "property_type": "Retail",
  "notes": []
}
```

Once a property exists, zones and controllers are managed through the app UI.

## Database Tables

| Table | Purpose |
|-------|---------|
| `properties` | Property name, region, branch, account manager, type, gate code, notes |
| `zones` | Irrigation zones per property (type, duration, frequency, schedule) |
| `zone_history` | Change log for zone modifications |
| `property_controllers` | Controller/timer hardware info per property |

## Auth

Google OAuth via Supabase. Admin users (defined in `src/services/authService.js` `ADMIN_EMAILS`) get access to CSV upload and the activity dashboard.
