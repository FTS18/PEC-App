# Quick Reference Guide

Quick reference for common tasks and patterns in the PEC Campus ERP application.

## Development Commands

### Frontend (Next.js 15)

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
```

### Backend (NestJS)

```bash
cd server
npm run start:dev    # Start with hot reload
npm run build        # Production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run seed         # Seed database
```

### Docker

```bash
npm run dev:docker:backend   # Start backend in Docker
npm run dev:docker:frontend # Start frontend in Docker
npm run prod:docker         # Production deployment
```

## Common Patterns

### Creating a New Page

1. Create the page file in `app/(protected)/`:
```typescript
// app/(protected)/example/page.tsx
import { redirect } from 'next/navigation';

export default async function ExamplePage() {
  // Server component - can fetch data here
  return (
    <div>
      <h1>Example Page</h1>
    </div>
  );
}
```

2. Add navigation link to sidebar (if needed)

### Client Component

```typescript
// components/ExampleClient.tsx
'use client';

import { useState } from 'react';

export function ExampleClient() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Data Fetching

```typescript
// Server-side
async function getData() {
  const res = await fetch('http://localhost:3001/courses');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

// Client-side with TanStack Query
import { useQuery } from '@tanstack/react-query';

function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/courses');
      return res.json();
    },
  });
}
```

### Using Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <input {...form.register('name')} />
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Protected Routes

Routes in `app/(protected)/` are automatically protected by the layout. To add protection manually:

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return redirect('/auth');
  
  return <Dashboard />;
}
```

### Using UI Components

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## File Locations

| What | Where |
|------|-------|
| Pages | `app/(protected)/[feature]/page.tsx` |
| Components | `src/components/` |
| Hooks | `src/hooks/` |
| Types | `src/types/` |
| Utils | `src/lib/` |
| API Routes | `app/api/` |
| Backend Routes | `server/src/[module]/` |
| Database Schema | `server/prisma/schema.prisma` |

## Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/auth` | Login/Register |
| `/dashboard` | Main dashboard |
| `/courses` | Course catalog |
| `/attendance` | Attendance tracking |
| `/timetable` | Schedule management |
| `/examinations` | Exam management |
| `/chat` | Messaging system |
| `/canteen` | Night canteen |
| `/hostel-issues` | Hostel issues |
| `/resume-builder` | Resume builder |
| `/profile` | User profile |
| `/settings` | User settings |
| `/admin/*` | Admin settings |

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GEMINI_API_KEY=your_key
```

### Backend (server/.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
PORT=3001
```

## Database Operations

```bash
# Generate Prisma client
cd server && npm run prisma:generate

# Create migration
npm run prisma:migrate dev --name add_new_field

# Push schema changes
npm run prisma:push

# Reset database
npm run prisma:migrate reset

# Open Prisma Studio
npm run prisma:studio
```

## Troubleshooting

### Clear Cache

```bash
# Next.js cache
npm run clean:next

# Node modules
rm -rf node_modules package-lock.json && npm install
```

### Port Issues

```bash
# Check port usage
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Database Issues

1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Run `npm run prisma:generate`
4. Try `npm run prisma:push`

## Styling with Tailwind

```tsx
// Using cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "base classes",
  isActive && "active classes",
  className
)}>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

## Using TanStack Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });
}

// Mutation
function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## API Request Example

```typescript
const response = await fetch('http://localhost:3001/courses', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |
| `@tanstack/react-query` | Data fetching |
| `framer-motion` | Animations |
| `tailwindcss` | Styling |
| `@radix-ui/*` | UI primitives |
| `lucide-react` | Icons |

## Documentation Links

- [Features](./FEATURES.md) - Complete feature documentation
- [Architecture](./ARCHITECTURE.md) - System architecture
- [Development](./DEVELOPMENT.md) - Setup guide
- [README](../../README.md) - Project overview

## Common Tasks

### Add a New UI Component

1. Create component in `src/components/ui/`
2. Use shadcn/ui patterns
3. Export from `components/ui`

### Add a New API Endpoint

1. Create controller in `server/src/[module]/[module].controller.ts`
2. Add route in module
3. Register in `app.module.ts`

### Add a New Database Model

1. Edit `server/prisma/schema.prisma`
2. Run `npm run prisma:migrate dev`
3. Generate types with `npm run prisma:generate`

---

*Last Updated: March 2026*
