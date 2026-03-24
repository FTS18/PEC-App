# Next.js Migration - Quick Start Guide

## 🚀 Getting Started

### First Time Setup

1. **Install dependencies**:
```bash
npm install --legacy-peer-deps
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
NEXT_PUBLIC_UPI_ID=your_upi@bank
NEXT_PUBLIC_UPI_NAME=Your Name
NEXT_PUBLIC_REMOVEBG_API_KEY=your_key
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open browser**:
Navigate to http://localhost:3000

---

## 📁 Where Things Are

### Adding a New Page

**Old way (React Router):**
```typescript
// src/pages/NewPage.tsx
export function NewPage() { ... }

// Then add to src/App.tsx
<Route path="/new-page" element={<NewPage />} />
```

**New way (Next.js):**
```typescript
// Just create: app/(protected)/new-page/page.tsx
'use client';

export default function NewPage() {
  return <div>New Page</div>;
}
```

### Navigation

**Old:**
```typescript
import { useNavigate, Link } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

<Link to="/profile">Profile</Link>
```

**New:**
```typescript
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const router = useRouter();
router.push('/dashboard');

<Link href="/profile">Profile</Link>
```

### Getting URL Parameters

**Old:**
```typescript
import { useParams } from 'react-router-dom';
const { id } = useParams();
```

**New:**
```typescript
import { useParams } from 'next/navigation';
const { id } = useParams();
// Works the same!
```

### Getting Current Path

**Old:**
```typescript
import { useLocation } from 'react-router-dom';
const location = useLocation();
const path = location.pathname;
```

**New:**
```typescript
import { usePathname } from 'next/navigation';
const pathname = usePathname();
```

---

## 🔧 Common Tasks

### Making a Component Client-Side

Add `'use client';` at the top if component uses:
- useState, useEffect, hooks
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, document)

```typescript
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Using Environment Variables

**Client-side (browser):**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Server-side (only in Server Components):**
```typescript
const secret = process.env.SECRET_KEY; // No NEXT_PUBLIC prefix
```

### Importing from src/

All imports still work the same with `@/` alias:
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/lib/api';
```

---

## 🎨 Styling

Everything works the same:
- Tailwind CSS classes
- CSS variables
- Theme switching
- Accent colors

```typescript
<div className="bg-background text-foreground p-4 rounded-lg shadow-md">
  Content
</div>
```

---

## 🔐 Authentication

The auth system works exactly the same:

```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Hello {user.fullName}</div>;
}
```

---

## 📊 Data Fetching

TanStack Query works the same:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    },
  });
  
  // Use data...
}
```

---

## 🚨 Troubleshooting

### "window is not defined"
Wrap window access in useEffect or check:
```typescript
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

### "localStorage is not defined"
Same as above - check for window:
```typescript
const [value, setValue] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('key') || 'default';
  }
  return 'default';
});
```

### Component not updating
Make sure it's marked as `'use client'` if using state/effects

### Import errors
Check the path - use `@/` for absolute imports:
```typescript
// ❌ Wrong
import { Button } from '../../../components/ui/button';

// ✅ Correct
import { Button } from '@/components/ui/button';
```

---

## 🏗️ Building for Production

```bash
# Build
npm run build

# Start production server
npm start

# Or build and start
npm run build && npm start
```

---

## 📦 Deploying to Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Or use CLI:
```bash
npm i -g vercel
vercel
```

---

## 🆘 Need Help?

- Check `MIGRATION-SUMMARY.md` for detailed changes
- Next.js Docs: https://nextjs.org/docs
- App Router Guide: https://nextjs.org/docs/app

---

## ✅ Checklist for New Features

When adding a new feature:
- [ ] Create page in `app/(protected)/feature-name/page.tsx`
- [ ] Add `'use client';` if needed
- [ ] Use `@/` imports for src files
- [ ] Use `useRouter()` instead of `useNavigate()`
- [ ] Use `Link` from `next/link`
- [ ] Test in dev mode
- [ ] Build to check for errors

---

**Happy coding with Next.js! 🎉**
