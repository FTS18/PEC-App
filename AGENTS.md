# Vercel React Best Practices (Project Policy)

This repository follows the Vercel React/Next.js performance guide for all new and refactored code.

## Scope
Apply these rules when:
- Writing new React components or pages
- Implementing data fetching (client or server-side)
- Reviewing or refactoring for performance
- Optimizing bundle size, rendering, and load times

## Priority Order (Enforcement)
1. **Eliminating Waterfalls** (`async-*`) — CRITICAL
2. **Bundle Size Optimization** (`bundle-*`) — CRITICAL
3. **Server-Side Performance** (`server-*`) — HIGH
4. **Client-Side Data Fetching** (`client-*`) — MEDIUM-HIGH
5. **Re-render Optimization** (`rerender-*`) — MEDIUM
6. **Rendering Performance** (`rendering-*`) — MEDIUM
7. **JavaScript Performance** (`js-*`) — LOW-MEDIUM
8. **Advanced Patterns** (`advanced-*`) — LOW

## Critical Rules (Always Check First)
### 1) Eliminating Waterfalls (`async-*`)
- `async-defer-await`: move `await` as late as possible; await only when needed
- `async-parallel`: use `Promise.all()` for independent operations
- `async-dependencies`: use staged parallelism for partially dependent operations
- `async-api-routes`: start promises early, await late
- `async-suspense-boundaries`: stream with Suspense where applicable

### 2) Bundle Size Optimization (`bundle-*`)
- `bundle-barrel-imports`: prefer direct imports over broad barrel imports
- `bundle-dynamic-imports`: dynamically import heavy components/modules
- `bundle-defer-third-party`: defer analytics/logging/heavy SDKs until needed
- `bundle-conditional`: load modules only when feature is activated
- `bundle-preload`: preload on hover/focus when it improves perceived speed

## Implementation Workflow
1. Scan for waterfall fetches and sequential independent awaits.
2. Scan for heavy top-level imports and non-critical third-party SDK initialization.
3. Apply smallest safe refactor with behavior preserved.
4. Validate with build/tests.
5. Note rule IDs addressed in PR notes or commit summary.

## Review Checklist
- [ ] Independent async work is parallelized.
- [ ] No avoidable top-level heavy imports on initial route load.
- [ ] Expensive computation/rendering is memoized only when useful.
- [ ] Effects use stable primitive dependencies.
- [ ] Client-side storage/event listeners are deduplicated and minimized.

## Rule Reference
Read detailed per-rule explanations/examples in:
- `rules/async-parallel.md`
- `rules/bundle-barrel-imports.md`
- and other `rules/*.md` entries from the source guide.

If rule files are not present in this repo, use this document as the operating baseline and follow the Vercel guide semantics during implementation.

## Available Agent Skills

This project includes specialized skills for Next.js development. Agents should load these skills when working on relevant tasks.

### Skill Categories

#### Next.js 15 Performance (`nextjs15-performance`)
Use when:
- Writing React components or pages
- Implementing data fetching (client or server-side)
- Optimizing bundle size, rendering, and load times

Location: `.agents/skills/nextjs15-performance/SKILL.md`

#### Next.js App Router Patterns (`nextjs-app-router-patterns`)
Use when:
- Building Next.js applications
- Implementing SSR/SSG
- Optimizing React Server Components

Location: `.agents/skills/nextjs-app-router-patterns/SKILL.md`

#### Next.js Best Practices (`nextbest-practices`)
Use when:
- Working with file conventions
- Implementing RSC boundaries
- Working with data patterns and async APIs
- Working with metadata, error handling, route handlers

Location: `.agents/skills/next-best-practices/SKILL.md`

#### Next.js Cache Components (`next-cache-components`)
Use when:
- Working with PPR (Partial Prerendering)
- Using cache directive, cacheLife, cacheTag
- Implementing updateTag for cache invalidation

Location: `.agents/skills/next-cache-components/SKILL.md`

#### Find Skills (`find-skills`)
Use when:
- User asks about available capabilities
- Looking for functionality that might exist as an installable skill
- Questions like "how do I do X", "is there a skill that can..."

Location: `.agents/skills/find-skills/SKILL.md`

#### Eraser Diagrams (`eraser-diagrams`)
Use when:
- User asks to visualize, diagram, or document system architecture
- Generating architecture diagrams from code or descriptions

Location: `.agents/skills/eraser-diagrams/SKILL.md`

## Next.js 15 Specific Guidelines

### App Router Best Practices

When working with the Next.js 15 App Router:

1. **Server Components by Default**: Use server components for data fetching and static content
2. **Client Components Only When Needed**: Add `'use client'` only when using browser APIs, hooks, or interactivity
3. **Streaming with Suspense**: Use Suspense boundaries for loading states with streaming
4. **Route Groups**: Use `(route-group)` for layout sharing without affecting URL
5. **Parallel Routes**: Use `@parallel` for concurrent route rendering
6. **Intercepting Routes**: Use ` InterceptingRoute` patterns for modals and overlays

### Data Fetching Patterns

```typescript
// Good: Parallel data fetching
async function Page() {
  const [user, courses] = await Promise.all([
    getUser(),
    getCourses()
  ]);
  return <Dashboard user={user} courses={courses} />;
}

// Good: Start promise early, await late
async function Page() {
  const coursesPromise = getCourses();
  const user = await getUser();
  const courses = await coursesPromise;
  return <Dashboard user={user} courses={courses} />;
}
```

### Bundle Optimization

```typescript
// Good: Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Good: Defer non-critical imports
useEffect(() => {
  import('heavy-library').then((module) => {
    // Use module
  });
}, []);
```

## Code Style Guidelines

### Component Structure
```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 2. Types
interface ComponentProps {
  className?: string;
}

// 3. Component
export function Component({ className }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState();
  
  // Then logic
  const handleClick = () => {};
  
  // Finally render
  return (
    <div className={cn('class', className)}>
      Content
    </div>
  );
}
```

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `kebab-case.ts` or in `types/index.ts`

### CSS/Tailwind Guidelines
- Use Tailwind utility classes for styling
- Use `cn()` utility for conditional classes
- Extract repeated patterns into components
- Follow mobile-first responsive design

## Testing Guidelines

### Component Testing
- Test render output
- Test user interactions
- Test edge cases and error states
- Mock external dependencies

### Integration Testing
- Test API integrations
- Test database operations
- Test authentication flows

## Documentation Requirements

When adding new features:
1. Update README.md with feature overview
2. Add JSDoc comments to new functions/components
3. Update docs/FEATURES.md if adding significant features
4. Add comments for complex logic

## Performance Budget

Keep bundle sizes under these limits:
- Initial JavaScript: < 300KB gzipped
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1

## Security Guidelines

- Never expose sensitive data in client components
- Use environment variables for secrets
- Validate all user inputs with Zod schemas
- Follow least privilege principle for permissions
- Sanitize user-generated content to prevent XSS
