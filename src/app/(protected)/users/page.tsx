import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { UserManagementView } from './UserManagementView';

async function getUsers() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
     const res = await fetch(`${API_URL}/users`, { next: { revalidate: 60 } });
     if (!res.ok) return [];
     const data = await res.json();
     return (data.data || []).map((u: any) => ({
        ...u,
        fullName: u.fullName || u.name || '',
        status: u.status || 'active',
     }));
  } catch (error) {
     console.error('Error fetching users server-side:', error);
     return [];
  }
}

export default async function UsersPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth');

  // RBAC Check on Server
  if (session.role !== 'college_admin' && session.role !== 'faculty') {
    redirect('/dashboard');
  }

  const users = await getUsers();

  return (
    <UserManagementView 
      initialUsers={users} 
      isAdmin={session.role === 'college_admin'} 
      isFaculty={session.role === 'faculty'} 
    />
  );
}
