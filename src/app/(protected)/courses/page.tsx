import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { CourseDirectory } from './components/CourseDirectory';
import { CourseManagement } from './components/CourseManagement';

export const metadata: Metadata = {
  title: 'Courses | OmniFlow',
  description: 'Academic course directory and enrollment management.',
};

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
  maxStudents: number;
  enrolledStudents: number;
  description: string;
}

async function getProfile(token: string) {
   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
   try {
      const res = await fetch(`${API_URL}/auth/profile`, { 
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 30 } 
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data || data;
   } catch (e) {
      return null;
   }
}

async function getCourses(token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  try {
     const res = await fetch(`${API_URL}/courses?limit=1000&offset=0`, { 
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 } 
     });
     if (!res.ok) return [];
     const data = await res.json();
     return (data.data || []).map((c: any) => ({
        ...c,
        facultyName: c.instructor || c.facultyName || 'TBA',
        maxStudents: Number(c.maxStudents || 60),
        enrolledStudents: Number(c._count?.enrollments ?? c.enrolledStudents ?? 0),
        description: c.description || '',
     })) as Course[];
  } catch (error) {
     console.error('Error fetching courses server-side:', error);
     return [];
  }
}

async function getEnrollments(studentId: string, token: string) {
   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
   try {
      const res = await fetch(`${API_URL}/enrollments?studentId=${studentId}&status=active&limit=1000&offset=0`, { 
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 30 } 
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((e: any) => e.courseId) as string[];
   } catch (e) {
      return [];
   }
}

export default async function CoursesPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth');

  const courses = await getCourses(session.token);

  if (session.role === 'student') {
    const enrolledIds = await getEnrollments(session.uid, session.token);
    const profile = await getProfile(session.token);
    return (
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Course Directory</h1>
          <p className="text-muted-foreground mt-1">Browse and enroll in available courses</p>
        </div>
        <CourseDirectory 
          initialCourses={courses} 
          initialEnrolledIds={enrolledIds} 
          user={session}
          studentProfile={profile}
        />
      </div>
    );
  }

  // Admin/Faculty view
  return (
    <div className="space-y-6 md:space-y-8">
       <div>
         <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
         <p className="text-muted-foreground mt-1">Manage and update courses in the system</p>
       </div>
       <CourseManagement 
         initialCourses={courses} 
         user={session}
       />
    </div>
  );
}
