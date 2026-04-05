# EcoSol Copilot Instructions

## Quick Start

### Build, Test, and Lint

```bash
# Install dependencies
npm install

# Run development server (live reloading)
npm run dev

# Build for production
npm run build

# Lint code (ESLint)
npm lint

# Type check (via TypeScript)
npx tsc --noEmit

# Generate/update Prisma client (run after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate deploy        # Production
npx prisma migrate dev           # Development (applies + creates migration)
```

**Single test note:** This project uses ESLint for linting but does not currently have a test framework configured. Linting is the primary quality check.

### Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in required values:
   - `DATABASE_URL` - PostgreSQL connection string (required for Prisma)
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
3. Run `npx prisma generate` after setting `DATABASE_URL`

## High-Level Architecture

**EcoSol** is a Solidarity Economy platform connecting service providers directly with consumers, eliminating financial intermediaries. The core principle is that 100% of payment goes to the service provider.

### Stack Overview

- **Framework:** Next.js 14 (App Router) + TypeScript 5
- **UI:** React 19 + Tailwind CSS 4 + shadcn/ui (Radix UI components)
- **Database:** PostgreSQL (via Supabase) + Prisma ORM
- **Backend:** Next.js API Routes (serverless on Vercel)
- **Authentication:** Custom with role-based access control (RBAC)
- **Hosting:** Vercel (serverless)
- **Email:** Nodemailer + Resend
- **File Storage:** Supabase Storage (via Vercel Blob integration)
- **UI Feedback:** SweetAlert2 + custom Toast notifications

### Core Domains

1. **Service Providers** (`/provider`) - Register services, manage profiles, view analytics
2. **Consumers** (home page) - Browse and search services by category, connect via WhatsApp
3. **Admin Dashboard** (`/admin`) - Approve services, manage users, view platform metrics
4. **User Profiles** (`/profile`) - User account management, preferences, notification settings
5. **Authentication** (`/login`, `/signup`) - Custom auth with email/password

### Data Model

**Key Entities:**
- `Service` - Service offerings with category, social links, approval status, view count
- `User` - Platform users with role (USER/ADMIN), LGPD compliance fields (acceptedTerms, acceptedAt)
- `Notification` - User notifications for real-time platform updates

**Soft Delete Pattern:** Services have `deletedAt` field for logical deletion (no hard deletes).

### Key Architectural Principles

1. **Direct Communication:** No built-in messaging—users connect via WhatsApp to ensure service providers receive payments directly
2. **Role-Based Access Control:** Users have roles (USER/ADMIN) that determine feature access
3. **LGPD Compliance:** Terms of Service tracking with version history (`termsVersion`, `acceptedAt`)
4. **Soft Deletes:** Services use `deletedAt` for data retention without removing history
5. **Transparency:** All code is open-source; processes are public and auditable

## Key Conventions

### Directory Structure

```
/app               # Next.js App Router pages and layouts
  /admin          # Admin dashboard routes
  /api            # API route handlers
  /login, /signup # Authentication pages
  /profile        # User profile pages
  /provider       # Service provider pages
/components        # React components
  /ui             # shadcn/ui base components (Radix UI)
/lib               # Utilities and helpers
  prisma.ts       # Prisma client singleton
  supabase.ts     # Supabase client for storage
  mail.ts         # Nodemailer configuration
  swal.ts         # SweetAlert2 + custom Toast configurations
  auth-check.ts   # Authentication utilities
/prisma            # Database schema and migrations
  schema.prisma   # Prisma data model
```

### Naming Conventions

- **Files:** kebab-case (e.g., `service-card.tsx`, `auth-check.ts`)
- **Components:** PascalCase exports (e.g., `export function ServiceCard()`)
- **Utilities:** camelCase (e.g., `confirmDestructiveAction`, `notifySuccess`)
- **Enums/Constants:** UPPER_CASE (check `/constants`)

### Component Patterns

1. **UI Components** (`/components/ui`) - Unstyled base components from shadcn/ui (Radix wrappers)
2. **Feature Components** (`/components`) - Composed from UI components with styling
3. **Page Components** (`/app/*/page.tsx`) - Full page layouts using feature components
4. **Server vs Client:**
   - Use `"use client"` at top of files needing browser APIs (hooks, events, state)
   - API routes and data fetching prefer Server Components when possible
   - Leverage Next.js 14 App Router server-first approach

### API Route Structure

Routes live in `/app/api/`:
- `POST /api/admin/*` - Admin-only operations
- `POST /api/user/*` - User account operations
- `GET /api/search` - Service search/filtering
- `GET /api/submissions` - Service submissions (admin review)

**Pattern:** Check user role/authorization at route start before processing. Return appropriate HTTP status codes (401 Unauthorized, 403 Forbidden, 500 Server Error).

### Prisma Patterns

- Import as: `import prisma from "@/lib/prisma"`
- Always use the singleton export to avoid connection pool exhaustion
- Soft delete check: Include `where: { deletedAt: null }` in queries to exclude deleted items
- Use `prisma.$transaction()` for atomic multi-step operations
- Migrations: `npx prisma migrate dev` (dev) or `npx prisma migrate deploy` (production)

### Tailwind + shadcn/ui Integration

- Tailwind 4 with `@tailwindcss/postcss`
- Component composition uses Radix UI via shadcn/ui for accessibility
- Custom CSS in `globals.css` for page-level styles
- Class merging via `clsx` and `tailwind-merge` to avoid conflicts

### Authentication Flow

- No built-in session management—custom auth with password hashing
- Admin approval required for service providers (via `/admin` dashboard)
- RBAC determines which pages/API routes are accessible
- Check `role` field in User model to gate features

### SweetAlert2 & Notifications

- Import utilities from `@/lib/swal`:
  - `confirmDestructiveAction()` - Confirm before delete
  - `confirmAction()` - General confirmation
  - `notifySuccess()` / `Toast` - Feedback notifications
- Avoid using browser `alert()` or `confirm()`

### Environment Variables

Required (in `.env.local`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase key (public)

Optional:
- Resend API keys for email
- Storage/CDN configuration for image uploads

### Deployment Considerations

- **Version Management:** Update `version` in `package.json` to change app-wide version display
- **Build Command:** `npm run build` runs `prisma generate && next build`
- **Runtime:** Node.js 18+ required
- **Database Migrations:** Run `npx prisma migrate deploy` before starting production server

## PostgreSQL & Database Management

EcoSol uses **PostgreSQL** (hosted on Supabase) as its primary database, accessed through Prisma ORM.

### Connection

```bash
# Connection string format (in .env.local)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### Common Operations

```bash
# View database schema
npx prisma studio  # Opens interactive database browser at http://localhost:5555

# Create new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Review pending migrations
npx prisma migrate status

# Reset database (DESTRUCTIVE - dev only)
npx prisma migrate reset

# Execute raw SQL
npx prisma db execute --stdin < query.sql
```

### Schema Management

- Schema file: `/prisma/schema.prisma`
- Migrations stored in: `/prisma/migrations/`
- Always test schema changes locally before production
- Use `prisma generate` after schema edits to regenerate Prisma client

### Querying the Database

From within API routes or server components:

```typescript
import prisma from "@/lib/prisma";

// Read
const services = await prisma.service.findMany({
  where: { deletedAt: null, approved: true },
});

// Create
const newService = await prisma.service.create({
  data: { name: "Service", category: "Design" },
});

// Update with transaction
await prisma.$transaction([
  prisma.service.update({ where: { id: 1 }, data: { approved: true } }),
  prisma.notification.create({ data: { userId, message: "Approved!" } }),
]);

// Soft delete
await prisma.service.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
});
```

## MCP Servers

### 1. Playwright (E2E Testing)

E2E testing validates user flows (authentication, service creation, admin approval, etc.).

```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

**Test file location:** Create tests in `/e2e` or `/tests` directory.

**Critical flows to test:**
- User signup and email verification
- Service provider registration + admin approval flow
- Consumer service search/filtering by category
- Direct WhatsApp connection button functionality
- Admin dashboard service management

### 2. PostgreSQL MCP Server

Direct database queries and schema inspection from Copilot for rapid prototyping and debugging.

**Setup:**
1. Ensure `DATABASE_URL` is configured in `.env.local`
2. The PostgreSQL MCP server connects using the same connection string as Prisma
3. Use for quick data exploration without writing code

**Common queries:**

```sql
-- View all services awaiting approval
SELECT id, name, category, created_at FROM service WHERE approved = false AND deleted_at IS NULL;

-- Count services by category
SELECT category, COUNT(*) as count FROM service WHERE deleted_at IS NULL GROUP BY category;

-- Find users with multiple service providers
SELECT user_id, COUNT(*) as services FROM service GROUP BY user_id HAVING COUNT(*) > 1;

-- View recent notifications
SELECT u.name, n.message, n.created_at FROM notification n JOIN user u ON n.user_id = u.id ORDER BY n.created_at DESC LIMIT 20;

-- Audit: Services deleted in last 30 days
SELECT id, name, deleted_at FROM service WHERE deleted_at >= NOW() - INTERVAL '30 days';
```

**Benefits:**
- Explore schema without switching tools
- Debug data issues quickly
- Generate test data fixtures
- Verify migrations worked correctly

## Summary

EcoSol is a TypeScript-first full-stack Next.js application focused on transparency and direct provider-to-consumer connections. Follow the conventions above for consistency with the existing codebase: use the Prisma singleton, leverage server components, check auth in API routes, and prefer shadcn/ui for consistent UI patterns.

**Reference the comprehensive `blueprint.md` for detailed architecture, data flow diagrams, and security considerations.**
