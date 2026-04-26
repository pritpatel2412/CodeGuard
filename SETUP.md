# Setup Guide

## Required Environment Variables

The application needs the following environment variables to run:

### 1. DATABASE_URL (Required)
PostgreSQL connection string. Format: `postgresql://username:password@host:port/database`

**Options:**
- **Local PostgreSQL**: If you have PostgreSQL installed locally:
  ```
  DATABASE_URL=postgresql://postgres:password@localhost:5432/pr_reviewer
  ```
- **Cloud Database**: Use services like:
  - [Neon](https://neon.tech) (free tier available)
  - [Supabase](https://supabase.com) (free tier available)
  - [Railway](https://railway.app) (free tier available)
  - [ElephantSQL](https://www.elephantsql.com) (free tier available)

### 2. OPENAI_API_KEY (Required for AI Reviews)
Get your API key from: https://platform.openai.com/api-keys

### 3. GITLAB_TOKEN (Required for GitLab Integration)
A Personal Access Token from GitLab with `api` scope.
Get it from: https://gitlab.com/-/profile/personal_access_tokens
*Note: The `api` scope covers all necessary permissions including Merge Requests, Repository access, and Comments.*

### 4. PORT (Optional)
Server port. Defaults to 5000 if not set.

### 5. SESSION_SECRET (Required in production)
Must be at least **32 characters**. The server **exits** on startup if this is missing or too short when `NODE_ENV=production`.

### 6. APP_ORIGIN (Required in production)
Comma-separated browser origins allowed to call the API with cookies (CORS), e.g. `https://your-app.vercel.app`. Copy variable names from [.env.example](.env.example).

## Quick Start

### Option 1: Using .env file (Recommended)

1. Create a `.env` file in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/pr_reviewer
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   ```

2. Install a package to load .env files:
   ```bash
   npm install dotenv
   ```

3. Update `server/index.ts` to load .env file (add at the top):
   ```typescript
   import 'dotenv/config';
   ```

### Option 2: Set environment variables in PowerShell

```powershell
$env:DATABASE_URL="postgresql://user:password@localhost:5432/pr_reviewer"
$env:OPENAI_API_KEY="your_openai_api_key_here"
$env:PORT="5000"
npm run dev
```

### Option 3: Set environment variables in Command Prompt

```cmd
set DATABASE_URL=postgresql://user:password@localhost:5432/pr_reviewer
set OPENAI_API_KEY=your_openai_api_key_here
set PORT=5000
npm run dev
```

## Database Setup

After setting DATABASE_URL, you need to create the database schema:

```bash
npm run db:push
```

This will create all the required tables in your database.

## Running the Application

```bash
npm run dev
```

The server will start on port 5000 (or the port specified in PORT environment variable).

Access the application at: http://localhost:5000

## Troubleshooting

### "DATABASE_URL must be set" error
- Make sure you've set the DATABASE_URL environment variable
- Check that the connection string is correct

### Database connection errors
- Verify PostgreSQL is running (if using local database)
- Check that the database exists
- Verify username, password, host, and port are correct

### OpenAI API errors
- Verify your OPENAI_API_KEY is correct
- Check that you have API credits available
- Ensure the API key has the necessary permissions

