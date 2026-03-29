# Development Guide

Complete guide for setting up and developing the PEC Campus ERP application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher (v20 recommended)
- **npm** v9+ or **bun** v1+ (package manager)
- **PostgreSQL** v14+ (database)
- **Git** (version control)

## Project Structure

```
pec-app-new/
├── app/                  # Next.js 15 App Router
│   ├── (protected)/      # Protected routes (requires auth)
│   ├── api/             # API routes
│   └── auth/            # Authentication pages
├── src/                 # Shared utilities
├── server/              # NestJS Backend
│   ├── src/             # Backend source
│   └── prisma/          # Database schema
├── public/              # Static assets
└── docs/                # Documentation
```

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd pec-app-new

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

#### Frontend (.env.local)

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# AI Services (for chatbot and resume analyzer)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Storage (if using cloud storage)
NEXT_PUBLIC_STORAGE_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_STORAGE_PRESET=your_upload_preset

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (server/.env)

Navigate to the server directory and create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Optional
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

#### Create PostgreSQL Database

```sql
CREATE DATABASE pec_db;
CREATE USER pec_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pec_db TO pec_user;
```

#### Run Migrations

```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate dev

# (Optional) Seed database with sample data
npm run seed
```

### 4. Start Development Servers

#### Option A: Run Both Servers Concurrently

```bash
# From the root directory
npm run dev:all
```

This runs:
- Frontend (Next.js) on http://localhost:3000
- Backend (NestJS) on http://localhost:3001

#### Option B: Run Servers Separately

**Frontend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Backend:**
```bash
cd server
npm run start:dev
# Runs on http://localhost:3001
```

#### Option C: Docker for Backend Only

If you want to run only the database and backend in Docker:

```bash
# Start Postgres and backend in Docker
npm run dev:docker:backend

# Run frontend locally
npm run dev
```

## Development Commands

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run dev:fresh` | Clear Next.js cache and start fresh |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run clean:next` | Clear .next cache directory |

### Backend Commands

```bash
cd server

# Development
npm run start:dev       # Start with hot reload
npm run start           # Start production server

# Build
npm run build           # Build for production

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run seed           # Seed database with sample data
npm run prisma:studio  # Open Prisma Studio (GUI)
npm run prisma:push    # Push schema changes to DB
```

### Docker Commands

```bash
# Development
npm run dev:docker           # Start all services
npm run dev:docker:backend  # Only Postgres + Backend
npm run dev:docker:frontend # Only Frontend
npm run dev:docker:down     # Stop containers
npm run dev:docker:logs     # View logs
npm run dev:docker:restart  # Restart containers

# Production
npm run prod:docker          # Build and start production
npm run prod:docker:down     # Stop production
```

## Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript support. Configuration files:
- `.eslintrc.json` - Main ESLint configuration
- `eslint.config.mjs` - Flat config (ESLint 9+)

### TypeScript

The project uses strict TypeScript. Key configuration files:
- `tsconfig.json` - Main TypeScript configuration
- Strict mode enabled
- Path aliases configured in `tsconfig.json`

### Best Practices

1. **Use Server Components by Default**
   - Use `'use client'` directive only when needed
   - Keep components as Server Components for better performance

2. **Data Fetching**
   ```typescript
   // Good: Parallel data fetching
   const [user, courses] = await Promise.all([
     getUser(),
     getCourses()
   ]);

   // Good: Start promise early, await late
   const coursesPromise = getCourses();
   const user = await getUser();
   const courses = await coursesPromise;
   ```

3. **Dynamic Imports**
   ```typescript
   // For heavy components
   const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
     loading: () => <ChartSkeleton />,
     ssr: false
   });
   ```

4. **Form Handling**
   - Use React Hook Form for all forms
   - Validate with Zod schemas
   - Handle submission states properly

## Testing

### Manual Testing

To test specific features:

1. **Authentication**
   - Navigate to `/auth`
   - Test login with different roles
   - Verify role-based redirects

2. **Dashboard**
   - Access `/dashboard` after login
   - Verify role-specific content loads
   - Check real-time data updates

3. **Courses**
   - Browse course catalog at `/courses`
   - View course details at `/courses/[id]`
   - Test enrollment functionality

4. **Attendance**
   - Access `/attendance`
   - Test QR code generation (faculty)
   - Test attendance marking

### API Testing

Test backend endpoints directly:

```bash
# Login to get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pec.edu","password":"password"}'

# Use token for authenticated requests
curl -X GET http://localhost:3001/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find and kill process on port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

#### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL in server/.env
3. Ensure database exists and user has permissions
4. Try reconnecting Prisma:
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:push
   ```

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd server
rm -rf node_modules package-lock.json
npm install
```

#### Next.js Cache Issues

```bash
# Clear .next cache
npm run clean:next

# Or manually delete
rm -rf .next
```

### Getting Help

1. Check the [FAQ](./docs/FEATURES.md) section
2. Review existing issues on GitHub
3. Contact the development team

## Deployment

### Frontend (Vercel - Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

**Required Environment Variables:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GEMINI_API_KEY`

### Backend (Docker)

1. Build the Docker image:
   ```bash
   docker build -t pec-backend ./server
   ```

2. Run with environment variables:
   ```bash
   docker run -p 3001:3001 \
     -e DATABASE_URL=your_database_url \
     -e JWT_SECRET=your_secret \
     pec-backend
   ```

### Database (Managed PostgreSQL)

For production, use managed database services:
- **Vercel Postgres** - Integrated with Vercel
- **Supabase** - Free tier available
- **Neon** - Serverless Postgres
- **AWS RDS** - Enterprise-grade

## Performance Optimization

### Frontend Optimizations

1. **Lazy Loading**
   - Use `dynamic()` for heavy components
   - Implement route-based code splitting

2. **Image Optimization**
   - Use Next.js Image component
   - Specify image sizes
   - Use appropriate formats (WebP, AVIF)

3. **Caching**
   - Leverage TanStack Query caching
   - Configure stale-while-revalidate

### Backend Optimizations

1. **Database**
   - Add indexes for frequently queried columns
   - Use Prisma's `select` to limit returned fields
   - Implement pagination for large datasets

2. **Caching**
   - Redis for session storage (production)
   - In-memory caching for development

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Notes

- Always create a new branch for feature development
- Run lint before committing
- Write meaningful commit messages
- Update documentation when adding new features
- Test thoroughly before merging

---

*Last Updated: March 2026*
