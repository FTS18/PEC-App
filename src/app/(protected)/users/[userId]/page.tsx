import { getServerSession } from '@/lib/server-auth';
import { redirect, notFound } from 'next/navigation';
import { UserDetailView } from './UserDetailView';

interface PageProps {
  params: Promise<{ userId: string }>;
}

async function getUserData(userId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
     const userRes = await fetch(`${API_URL}/users/${userId}`, { next: { revalidate: 60 } });
     if (!userRes.ok) return null;
     const data = await userRes.json();
     return data.data || data;
  } catch (error) {
     console.error('Error fetching user server-side:', error);
     return null;
  }
}

async function getStudentStats(userId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
     const [enrollmentsRes, gradesRes, attendanceRes] = await Promise.all([
        fetch(`${API_URL}/enrollments?studentId=${userId}`, { next: { revalidate: 60 } }),
        fetch(`${API_URL}/examinations/grades?studentId=${userId}`, { next: { revalidate: 60 } }),
        fetch(`${API_URL}/attendance?studentId=${userId}`, { next: { revalidate: 60 } }),
     ]);

     const enrollmentsData = enrollmentsRes.ok ? (await enrollmentsRes.json()).data : [];
     const gradesRaw = gradesRes.ok ? (await gradesRes.json()).data : [];
     const attendanceData = attendanceRes.ok ? (await attendanceRes.json()).data : [];

     return {
        enrollments: enrollmentsData || [],
        grades: gradesRaw || [],
        attendance: attendanceData || [],
     };
  } catch (e) {
     console.error(e);
     return { enrollments: [], grades: [], attendance: [] };
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const session = await getServerSession();
  if (!session) redirect('/auth');

  // RBAC: Only admin, faculty, or the user themselves can view full detail
  if (session.role !== 'college_admin' && session.role !== 'faculty' && session.uid !== userId) {
    redirect('/dashboard');
  }

  const user = await getUserData(userId);
  if (!user) notFound();

  let studentData = { enrollments: [], grades: [], attendance: [] };
  if (user.role === 'student') {
     studentData = await getStudentStats(userId);
  }

  return (
    <UserDetailView 
      user={user}
      enrollments={studentData.enrollments}
      grades={studentData.grades}
      attendance={studentData.attendance}
      payments={[]}
      hostelIssues={[]}
    />
  );
}
