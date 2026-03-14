# Leaderboard Page Design

**Date:** 2026-03-14  
**Status:** Approved

## Overview

Implement a full leaderboard page that displays the top 20 most roasted code submissions, sorted by the lowest score. This involves creating a tRPC procedure to fetch data from the database and updating the frontend to use server-side data fetching with client-side interactivity.

## Architecture

### Server Component (`src/app/leaderboard/page.tsx`)

The server component follows the established "Server Page + Client Content Split" pattern used in `src/app/page.tsx`.

- Prefetch the top 20 leaderboard entries using the new tRPC procedure.
- Wrap the client content with `<HydrateClient>` for server-side data hydration.
- Pass leaderboard data as a slot prop to the client component.

### Client Component (`src/app/leaderboard/leaderboard-content.tsx`)

A new `"use client"` component that handles all interactive UI:

- Receive leaderboard entries via slot prop.
- Render each entry using `CodeBlock`, `CodeBlockBody`, and `CodeBlockHeader` components.
- Implement collapsible functionality for code blocks (clicking the header expands/collapses the code).
- Apply Shiki syntax highlighting via `CodeBlockBody`.

### Data Model

Each leaderboard entry contains:

- `rank`: Number (position in leaderboard)
- `score`: Number (roast score, lower is worse/more embarrassing)
- `language`: String (programming language name)
- `shikiLanguage`: BundledLanguage (Shiki-compatible language identifier)
- `code`: String (the roasted code snippet)

### tRPC Procedure

Create a new procedure in the leaderboard router to fetch the data:

- **Procedure:** `leaderboard.getAll`
- **Input:** `{ limit: number }` (default: 20)
- **Output:** Array of leaderboard entries sorted by score (ascending)
- **Query:** Use Drizzle ORM to fetch from the database, ordered by score ascending

## Implementation Steps

1. Create the tRPC procedure in the leaderboard router.
2. Create `src/app/leaderboard/leaderboard-content.tsx` client component.
3. Update `src/app/leaderboard/page.tsx` to:
   - Import and use `prefetch` for the new tRPC query.
   - Wrap with `<HydrateClient>`.
   - Pass data as slot prop to `LeaderboardContent`.
4. Remove all hardcoded dummy data from `page.tsx`.

## UI/UX

The leaderboard page uses the same visual components as the homepage preview:

- Terminal/IDE-inspired aesthetic with monospace fonts.
- Green accent for the title prefix (`>`).
- Red accent for scores.
- Amber accent for rank numbers.
- Syntax highlighting with Shiki (vesper theme).
- Collapsible code blocks with header showing rank, score, language, and line count.

## Error Handling

- If the database query fails, display an appropriate error message in the leaderboard section.
- Handle empty results gracefully (show a "No submissions yet" message).

## Testing

- Verify that exactly 20 entries are displayed.
- Verify sorting by lowest score (ascending).
- Verify collapsible functionality works correctly.
- Verify syntax highlighting renders for different languages.
