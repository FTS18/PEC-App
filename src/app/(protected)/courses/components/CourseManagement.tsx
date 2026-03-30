'use client';

import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  BookOpen, 
  Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/course';

interface CourseManagementProps {
  initialCourses: Course[];
  user: any;
}

export function CourseManagement({ initialCourses, user }: CourseManagementProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = courses.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
         <Input 
           placeholder="Search courses..." 
           className="max-w-md w-full" 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
         <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Course</Button>
         </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Code</th>
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Department</th>
                <th className="text-center p-4 text-sm font-medium">Semester</th>
                <th className="text-center p-4 text-sm font-medium">Enrolled</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-muted/20">
                  <td className="p-4 font-medium">{course.code}</td>
                  <td className="p-4">{course.name}</td>
                  <td className="p-4 text-muted-foreground">{course.department}</td>
                  <td className="p-4 text-center text-muted-foreground">{course.semester}</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline">{course.enrolledStudents}/{course.maxStudents}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
