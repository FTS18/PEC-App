import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { FacultyDashboard } from './dashboards/FacultyDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

// Server Components in Next 15+ handle auth/redirects before any Client JS renders.
export default async function DashboardPage() {
  const session = await getServerSession();

  // 1. Mandatory server-side redirect
  if (!session) {
    redirect('/auth');
  }

  // 2. Role-based redirect if role is missing
  if (!session.role) {
    redirect('/role-selection');
  }

  // 3. Render appropriate dashboard
  // We don't need 'dynamic' imports with 'ssr: false' anymore.
  // The client components will still hydrate normally.
  
  if (session.role === 'student') {
    return <StudentDashboard />;
  }

  if (session.role === 'faculty') {
    return <FacultyDashboard />;
  }

  return <AdminDashboard />;
}
