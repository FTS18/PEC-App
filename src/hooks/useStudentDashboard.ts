'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import type { 
  StudentProfile, 
  Course, 
} from '@/types';
import { extractData } from '@/lib/utils';

interface StudentStats {
  attendancePercentage: number;
  enrolledCourses: number;
}

export function useStudentDashboard(initialData?: any, initialUser?: any) {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  
  // Use SSR data if provided, otherwise show loading
  const [loading, setLoading] = useState(!initialData);
  const [firstName, setFirstName] = useState(initialUser?.fullName?.split(' ')[0] || 'Student');
  const [profileData, setProfileData] = useState<StudentProfile | null>(initialUser ? {
    department: initialUser.department,
    semester: initialUser.semester,
    enrollmentNumber: initialUser.enrollmentNumber,
  } as any : null);
  
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: initialData?.summary?.totalSummary?.percentage || 0,
    enrolledCourses: initialData?.summary?.courses?.length || 0,
  });
  
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState<string>('Today');
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Course[]>(initialData?.summary?.courses || []);
  const [loadError, setLoadError] = useState<string | null>(null);

  const processDashboardData = useCallback((summary: any, allCourses: Course[], timetableData: any[]) => {
      const statsObj = summary?.totalSummary ?? {};
      const summaryCourses = Array.isArray(summary?.courses) ? summary.courses : [];
      const fallbackCourses = Array.isArray(allCourses) ? allCourses : [];
      const rawEnrolled = summaryCourses.length > 0 ? summaryCourses : fallbackCourses;

      const normalizedEnrolled: Course[] = rawEnrolled.map((course: any, index: number) => {
        const matchById = fallbackCourses.find((c) => c.id === course.courseId || c.id === course.id);
        const matchByCode = fallbackCourses.find((c) => c.code === course.courseCode || c.code === course.code);
        const matched = matchById ?? matchByCode;

        const resolvedId = course.courseId ?? course.id ?? matched?.id ?? `course-${index}`;

        return {
          id: resolvedId,
          code: course.code ?? course.courseCode ?? matched?.code ?? 'COURSE',
          name: course.name ?? course.courseName ?? matched?.name ?? 'Course',
          department: course.department ?? matched?.department ?? 'General',
          semester: course.semester ?? matched?.semester ?? 0,
          credits: course.credits ?? matched?.credits ?? 0,
          facultyName: course.facultyName ?? matched?.facultyName ?? '',
          maxStudents: course.maxStudents ?? matched?.maxStudents ?? 0,
          enrolledStudents: course.enrolledStudents ?? matched?.enrolledStudents ?? 0,
          description: course.description ?? matched?.description,
          type: course.type ?? matched?.type,
          instructor: course.instructor ?? course.facultyName ?? matched?.instructor ?? matched?.facultyName,
        };
      });

      setEnrolledCoursesList(normalizedEnrolled);
      setStats({
        attendancePercentage: typeof statsObj.percentage === 'number' ? statsObj.percentage : 0,
        enrolledCourses: normalizedEnrolled.length,
      });
      
      const enrolledCourseIds = new Set(normalizedEnrolled.map((c: any) => c.courseId || c.id));
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const safeTimetable = Array.isArray(timetableData) ? timetableData : [];
      
      let scheduleItems = safeTimetable
        .filter((t: any) => enrolledCourseIds.has(t.courseId))
        .map((t: any) => {
          const courseMatch = fallbackCourses.find((c: any) => c.id === t.courseId);
          return {
            ...t,
            courseName: courseMatch?.name || t.courseName || 'Class',
            instructor: courseMatch?.instructor || courseMatch?.facultyName || t.facultyName || 'Faculty',
          };
        });

      const getScheduleForDay = (dayName: string) => {
        return scheduleItems
          .filter((item: any) => item.day === dayName)
          .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
      };

      let activeSchedule = getScheduleForDay(todayStr);
      let displayLabel = 'Today';

      if (activeSchedule.length === 0) {
        const todayIndex = daysOfWeek.indexOf(todayStr);
        for (let i = 1; i < 7; i++) {
          const nextDayIndex = (todayIndex + i) % 7;
          const nextDay = daysOfWeek[nextDayIndex];
          const nextSchedule = getScheduleForDay(nextDay);
          
          if (nextSchedule.length > 0) {
            activeSchedule = nextSchedule;
            displayLabel = i === 1 ? 'Tomorrow' : nextDay;
            break;
          }
        }
      }

      setTodayClasses(activeSchedule);
      setScheduleDay(displayLabel);
  }, []);

  const fetchStudentStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadError(null);
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };

      const [summaryRes, coursesRes, timetableRes] = await Promise.all([
        api.get<ApiResponse<any>>('/attendance/summary'),
        api.get<ApiResponse<Course[]>>('/courses'),
        api.get<ApiResponse<any>>('/timetable'),
      ]);

      processDashboardData(
        extractData<any>(summaryRes),
        extractData<Course[]>(coursesRes) || [],
        extractData<any>(timetableRes) || []
      );

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoadError('Unable to refresh dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user, processDashboardData]);

  // Handle hydration or manual refresh
  useEffect(() => {
    if (initialData) {
      processDashboardData(
        initialData.summary,
        initialData.courses || [],
        initialData.timetable || []
      );
      setLoading(false);
    }
  }, [initialData, processDashboardData]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth');
      return;
    }

    if (user.role !== 'student') {
      router.replace('/dashboard');
      return;
    }

    if (!initialData) {
      void fetchStudentStats();
    }
  }, [authLoading, user, router, fetchStudentStats, initialData]);

  const handleQRSuccess = () => {
    setStats((prev) => ({
      ...prev,
      attendancePercentage: Math.min(100, prev.attendancePercentage + 1),
    }));
    setShowQRScanner(false);
    void fetchStudentStats();
  };

  return {
    loading,
    firstName,
    profileData,
    showQRScanner,
    setShowQRScanner,
    stats,
    todayClasses,
    scheduleDay,
    enrolledCoursesList,
    loadError,
    setLoading,
    fetchStudentStats,
    handleQRSuccess,
    orgSlug,
  };
}
