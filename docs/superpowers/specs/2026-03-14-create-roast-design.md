# Create Roast Feature Design

**Date:** 2026-03-14  
**Status:** Approved

## Overview

Implement the core functionality: users submit code, AI analyzes it, and displays the roast result on a dedicated page.

## Architecture

### Components

1. **Server Action** (`src/app/actions.ts`)
   - Function: `createRoast(formData)`
   - Receives: `code`, `language`, `roastMode`
   - Calls AI for analysis
   - Saves to database
   - Returns redirect URL to `/roast/[id]`

2. **Homepage** (`src/app/home-content.tsx`)
   - Add form with Server Action
   - Redirect on submit

3. **Roast Result Page** (`/roast/[id]/page.tsx`)
   - Fetch from database by ID
   - Display score, verdict, issues, diff

4. **Database Procedures**
   - Save submission
   - Save roast result
   - Get roast by ID

### Data Flow

```
User clicks "$ roast_my_code"
    → Server Action (code, language, roastMode)
    → AI Analysis
    → Database (submissions + roasts tables)
    → Redirect to /roast/[id]
    → Roast Result Page fetches and displays
```

## AI Analysis

### Input to AI
- `code`: The submitted code snippet
- `language`: Selected programming language (optional, for hints)
- `roastMode`: Boolean - if true, response is sarcastic

### Output from AI
- `score`: Number (0-10, lower = worse)
- `verdict`: String (e.g., "needs_serious_help")
- `roastComment`: Main criticism/commentary
- `issues`: Array of {severity, title, description}
- `diffLines`: Array of {type, content} for suggested fix

## Roast Mode

- **Roast Mode ON**: AI response is sarcastic, harsh, humorous
- **Roast Mode OFF**: AI response is constructive, gentle feedback

## Out of Scope

- Share roast functionality
- User authentication
- Pagination

## Database Schema

Already exists: `submissions` and `roasts` tables in `src/db/schema.ts`

## Implementation Steps

1. Create Server Action in `src/app/actions.ts`
2. Update homepage to use form with Server Action
3. Update roast result page to fetch from database
4. Test end-to-end flow
