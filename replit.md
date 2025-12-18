# AI PR Reviewer System

## Overview

This is an AI-powered Pull Request reviewer system that integrates with GitHub (and GitLab) via webhooks. When a PR is opened or updated, the system analyzes code diffs using OpenAI and produces actionable review comments focused on bugs, security issues, performance problems, and maintainability concerns. The system includes a dashboard for managing repositories, viewing reviews, and tracking analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript using Vite as the build tool
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack Query (React Query) for server state management
- **UI Components:** shadcn/ui component library built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Design System:** Developer tool pattern inspired by Linear, GitHub, and Vercel with focus on information density and clarity

### Backend Architecture
- **Runtime:** Node.js with Express server
- **Language:** TypeScript with ESM modules
- **API Pattern:** RESTful JSON API endpoints under `/api/*`
- **Build System:** esbuild for server bundling, Vite for client bundling

### Data Storage
- **Database:** PostgreSQL with Drizzle ORM
- **Schema Location:** `shared/schema.ts` contains all table definitions
- **Migrations:** Drizzle Kit for schema management (`drizzle-kit push`)
- **Tables:**
  - `repositories` - Connected GitHub/GitLab repos
  - `reviews` - PR review records with metadata
  - `reviewComments` - Individual review comments with type/severity
  - `users` - User accounts

### External Integrations
- **GitHub API:** Using Octokit via Replit's connector system for OAuth token management
- **OpenAI:** GPT model for code diff analysis and review generation
- **Webhook System:** Receives PR events from GitHub/GitLab to trigger reviews

### Key Design Patterns
- **Shared Types:** `@shared/*` path alias for schemas and types used by both client and server
- **Storage Interface:** Abstract `IStorage` interface implemented by `DatabaseStorage` for database operations
- **Query Client:** Centralized fetch wrapper with error handling in `client/src/lib/queryClient.ts`

## External Dependencies

### Third-Party Services
- **OpenAI API:** Requires `OPENAI_API_KEY` environment variable for code analysis
- **GitHub:** Connected via Replit's connector system (handles OAuth automatically)
- **PostgreSQL:** Requires `DATABASE_URL` environment variable

### Key NPM Packages
- `@octokit/rest` - GitHub API client
- `openai` - OpenAI API client
- `drizzle-orm` + `drizzle-zod` - Database ORM with Zod validation
- `@tanstack/react-query` - Data fetching and caching
- `recharts` - Charts for analytics dashboard
- `wouter` - Client-side routing
- `date-fns` - Date formatting utilities