# Virtual Terminal Filter Debug Session Summary

## Date: February 5, 2026

## Problem

ARTM Virtual Terminal not showing when "Virtual Terminal" filter is checked, despite being visible before the home_security → virtual_terminal refactoring.

## Root Cause Analysis

### Database State

```
ARTM 1 Agent:
- agent_type: "null" (string, not actual NULL)
- object_type: "home_security" (OLD VALUE - never updated after migration)
- bank_integrations: ["Revolut"]
- exchange_integrations: []
```

### Database Schema

```sql
-- Migration adds constraint allowing 'Virtual Terminal' (with space, capitals)
'Virtual Terminal'::text
```

### Code Expectations

- Filter looks for normalized value: `'virtual_terminal'` (underscore, lowercase)
- normalizeAgentType('Virtual Terminal') → `'virtual_terminal'` ✅
- But actual database has: `object_type: "home_security"` ❌

## Actions Taken

### 1. Added Comprehensive Debugging

**File:** `src/components/ARViewer.jsx`

Added agent_type and object_type to console logs:

```javascript
console.log(
  "🔍 ALL agents before filter:",
  allFiltered.map((a) => ({
    name: a.name,
    agent_type: a.agent_type, // ADDED
    object_type: a.object_type, // ADDED
    positioning_mode: a.positioning_mode,
    // ...
  })),
);
```

Added Virtual Terminal specific debugging:

```javascript
if (f.key === "virtualTerminal" || agentType === "virtual_terminal") {
  console.log("🏧 Virtual Terminal Filter Check:", {
    agentName: agent.name,
    rawAgentType: agent.agent_type,
    normalizedAgentType: agentType,
    filterValue: f.value,
    filterActive: filters[f.key],
    matches: matches,
  });
}
```

### 2. Fixed typeFilters Array

**File:** `src/components/ARViewer.jsx` (lines 768-774)

Changed Hedera AI agent filter values from spaces to underscores:

```javascript
// BEFORE (WRONG):
{ key: "trainAgent", value: "train agent" },
{ key: "hotelAgent", value: "hotel agent" },
{ key: "flightAgent", value: "flight agent" },
{ key: "restaurantAgent", value: "restaurant agent" },
{ key: "travelAgent", value: "travel agent" },

// AFTER (FIXED):
{ key: "trainAgent", value: "train_agent" },
{ key: "hotelAgent", value: "hotel_agent" },
{ key: "flightAgent", value: "flight_agent" },
{ key: "restaurantAgent", value: "restaurant_agent" },
{ key: "travelAgent", value: "travel_agent" },
```

### 3. Created Database Check Scripts

- `check_virtual_terminal_agents.js` - Queries database to show actual agent_type values
- `fix_artm_agent_type.js` - Script to update ARTM agent (not executed)
- `fix_artm_agent_type.sql` - SQL to update agent type

## CRITICAL ISSUE REMAINING

### The ARTM agent in database has WRONG values:

```
✗ agent_type: "null" (should be "Virtual Terminal")
✗ object_type: "home_security" (should be "virtual_terminal")
```

### Why It's Not Showing:

1. Filter looks for normalized type: `'virtual_terminal'`
2. Agent has object_type: `'home_security'`
3. normalizeAgentType('home_security') → `'home_security'`
4. `'home_security'` !== `'virtual_terminal'` → **NO MATCH** ❌

## SOLUTION REQUIRED

### Option 1: Update Database (RECOMMENDED)

Run this SQL in Supabase:

```sql
UPDATE deployed_objects
SET
  agent_type = 'Virtual Terminal',
  object_type = 'virtual_terminal'
WHERE name = 'ARTM 1';
```

### Option 2: Update Filter to Also Match home_security

Add backward compatibility in filter logic:

```javascript
const isVirtualTerminalMatch =
  agentType === "virtual_terminal" || agentType === "home_security"; // Legacy compatibility
```

### Option 3: Add home_security Back to Filter Array

```javascript
{ key: "virtualTerminal", value: "virtual_terminal" },
{ key: "homeSecurity", value: "home_security" },  // Add this
```

## Files Modified

1. `/src/components/ARViewer.jsx` - Added debugging, fixed Hedera agent filter values
2. `/check_virtual_terminal_agents.js` - Created database inspection script
3. `/fix_artm_agent_type.js` - Created fix script (not executed)
4. `/fix_artm_agent_type.sql` - Created fix SQL (not executed)

## Status

❌ **UNRESOLVED** - ARTM agent still has `object_type: "home_security"` in database, preventing it from matching the `virtual_terminal` filter.

## Next Steps

1. Update ARTM agent in database using one of the solutions above
2. OR add backward compatibility filter for home_security agents
3. Test filter after database update
