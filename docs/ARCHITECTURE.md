# PEC Architecture

## Overview

PEC is a full-stack college ERP platform built with modern technologies. It uses a split architecture with a Next.js 15 frontend and NestJS backend.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 15)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │ App Router  │  │ Server      │  │ Client              ││
│  │ (app/)      │  │ Components  │  │ Components          ││
│  │ - Layouts   │  │ - Data      │  │ - Interactive UI    ││
│  │ - Pages     │  │   Fetching  │  │ - Forms             ││
│  │ - API       │  │ - SEO       │  │ - State Management  ││
│  │   Routes    │  │ - Caching   │  │                     ││
│  └─────────────┘  └─────────────┘  └─────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │ Controllers│  │ Services    │  │ Database            ││
│  │ - Routes   │  │ - Business  │  │ - Prisma ORM        ││
│  │ - DTOs     │  │   Logic     │  │ - PostgreSQL        ││
│  │ - Guards   │  │ - Validation│  │ - Migrations        ││
│  └─────────────┘  └─────────────┘  └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Next.js 15)

### App Router Structure

The frontend uses Next.js 15 App Router with the following directory structure:

```
app/
├── (protected)/              # Authenticated routes
│   ├── admin/               # Admin settings
│   ├── attendance/          # Attendance tracking
│   ├── campus-map/         # 3D campus map
│   ├── canteen/            # Night canteen
│   ├── chat/               # Messaging system
│   ├── college/            # College management
│   ├── courses/           # Course management
│   ├── dashboard/         # Role-based dashboards
│   ├── departments/       # Department management
│   ├── examinations/      # Exam management
│   ├── faculty/           # Faculty management
│   ├── help/              # Help & documentation
│   ├── hostel-issues/     # Hostel issues
│   ├── notifications/     # Notifications
│   ├── profile/           # User profile
│   ├── resume-builder/    # Resume builder
│   ├── search/            # Global search
│   ├── settings/          # User settings
│   ├── timetable/         # Timetable
│   └── users/             # User management
├── api/                    # API routes
├── auth/                   # Authentication
├── demo-dashboard/         # Demo dashboard
├── layout.tsx             # Root layout
└── page.tsx              # Landing page
```

### Route Groups

The `(protected)` route group contains routes that require authentication. These routes share a common layout defined in `layout.tsx`.

### Server vs Client Components

- **Server Components**: Used for data fetching, SEO, and static content
- **Client Components**: Used for interactivity, forms, and client-side state (`'use client'`)

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/(protected)/` | Authenticated routes |
| `app/api/` | API routes for frontend |
| `src/components/` | Shared React components |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Utilities and helpers |
| `src/types/` | TypeScript type definitions |

## Backend Architecture (NestJS)

### Module Structure

```
server/src/
├── attendance/           # Attendance management
├── auth/                 # Authentication & authorization
├── chat/                # Real-time messaging
├── common/              # Shared utilities
├── config/              # Configuration
├── courses/             # Course management
├── departments/         # Department management
├── enrollments/         # Student enrollments
├── examinations/        # Exam management
├── timetable/           # Schedule management
├── users/               # User management
├── prisma/              # Database service
├── main.ts              # Entry point
└── app.module.ts        # Root module
```

### Database (PostgreSQL + Prisma)

The backend uses PostgreSQL as the database with Prisma ORM for type-safe database access.

### Authentication Flow

```
User Login Request
    │
    ▼
Auth Module (auth/)
    │
    ▼
JWT Token Generation
    │
    ▼
Token Storage (Client)
    │
    ▼
Subsequent Requests (Authorization Header)
    │
    ▼
JWT Guard Validation
    │
    ▼
Role-Based Access Control
    │
    ▼
Protected Route Handler
```

## Data Flow

### Client-Side Data Fetching

1. Component mounts
2. TanStack Query fetches data
3. Loading state displayed
4. Data received and rendered
5. Error handling if failed

### Server-Side Data Fetching

1. Request received
2. Server component fetches data
3. Data passed to client components
4. Initial HTML rendered
5. Client hydrates

## State Management

### Server State
- TanStack Query for server state
- Automatic caching and revalidation
- Optimistic updates

### Client State
- React Context for global state
- Local state (useState) for component state
- URL state for filters and pagination

## API Design

### RESTful Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /courses | List all courses |
| GET | /courses/:id | Get course by ID |
| POST | /courses | Create new course |
| PUT | /courses/:id | Update course |
| DELETE | /courses/:id | Delete course |

### Request/Response Format

```typescript
// Request
interface ApiRequest<T> {
  params?: Record<string, string>;
  query?: Record<string, string | number>;
  body?: T;
  headers?: Record<string, string>;
}

// Response
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

## Security

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Session management

### Authorization
- Role-based access control (RBAC)
- Permission-based guards
- Route protection

### Data Protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS prevention
- CSRF protection

## Performance Optimizations

### Frontend
- Route-based code splitting
- Dynamic imports for heavy components
- Image optimization with Next.js Image
- Font optimization with next/font
- React Server Components for reduced bundle size

### Backend
- Database indexing
- Connection pooling
- Query optimization
- Caching strategies

## Deployment

### Frontend
- Vercel (recommended)
- Static export possible
- Edge runtime support

### Backend
- Docker container
- Managed cloud services
- Horizontal scaling ready

## Monitoring & Logging

### Frontend
- Error boundaries
- Performance monitoring
- User analytics

### Backend
- Request logging
- Error tracking
- Performance metrics

## Future Architecture Considerations

### Planned Enhancements
- GraphQL API layer
- WebSocket real-time updates
- Service worker for offline support
- CDN integration for assets
- Microservices decomposition

## Key Design Decisions

### 1. App Router vs Pages Router
**Decision**: App Router (Next.js 15)
**Reason**: Server Components, Streaming SSR, Layouts, Better caching

### 2. NestJS vs Express
**Decision**: NestJS
**Reason**: TypeScript-first, Dependency injection, Modular structure

### 3. Prisma vs TypeORM vs Drizzle
**Decision**: Prisma
**Reason**: Type-safe queries, Migration tooling, Developer experience

### 4. TanStack Query vs SWR
**Decision**: TanStack Query
**Reason**: Better caching, DevTools, Community support

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App Router                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Server Components                       │   │
│  │  - Data fetching in RSC                                  │   │
│  │  - SEO optimization                                       │   │
│  │  - Reduced client bundle                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Client Components                       │   │
│  │  - Interactive UI elements                                │   │
│  │  - Form handling                                          │   │
│  │  - State management                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    TanStack Query                          │   │
│  │  - Data synchronization                                  │   │
│  │  - Caching & invalidation                                │   │
│  │  - Optimistic updates                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                        NestJS Backend                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Controllers                         │   │
│  │  - REST endpoints                                         │   │
│  │  - Request validation                                     │   │
│  │  - Authentication guards                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Services                               │   │
│  │  - Business logic                                        │   │
│  │  - Data transformation                                  │   │
│  │  - External integrations                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                            │   │
│  │  - Type-safe queries                                     │   │
│  │  - Database migrations                                   │   │
│  │  - Connection pooling                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                        PostgreSQL                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Tables                                │   │
│  │  - users, courses, enrollments                          │   │
│  │  - attendance, chat, notifications                      │   │
│  │  - departments, examinations                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Contributing to Architecture

When making architectural decisions:

1. **Document the decision** in this file
2. **Consider trade-offs** explicitly
3. **Get team input** for major changes
4. **Plan for migration** paths
5. **Test at scale** before committing

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
