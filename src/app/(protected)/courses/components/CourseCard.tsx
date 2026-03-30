'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, GraduationCap, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageWithBlur } from '@/components/ui/image-with-blur';

import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  enrolled: boolean;
  image: string;
  onView: (course: Course) => void;
  onEnroll?: (course: Course) => void;
  onDrop?: (courseId: string) => void;
}

export function CourseCard({ 
  course, 
  enrolled, 
  image,
  onView, 
  onEnroll, 
  onDrop 
}: CourseCardProps) {
  const isFull = course.enrolledStudents >= course.maxStudents;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.18 }}
      className="card-elevated group overflow-hidden hover:shadow-xl transition-all duration-150"
    >
      <div className="h-40 w-full relative overflow-hidden bg-muted">
        <ImageWithBlur 
          src={image}
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-md shadow-sm border-white/20">
             {course.code}
          </Badge>
          {enrolled ? (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enrolled
            </Badge>
          ) : isFull && (
            <Badge variant="destructive" className="shadow-lg">Full</Badge>
          )}
        </div>
      </div>
      
      <div className="ui-card-pad space-y-3">
        <div>
          <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{course.name}</h3>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary/70" />
            <span className="truncate">{course.facultyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-primary/70" />
            {course.credits} Credits • Sem {course.semester}
          </div>
        </div>
        <div className="space-y-2 pt-1 border-t border-border/40 mt-1">
           <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Seats Taken
              </span>
              <span>{course.enrolledStudents} / {course.maxStudents}</span>
           </div>
           <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min((course.enrolledStudents / course.maxStudents) * 100, 100)}%` }}
                viewport={{ once: true }}
                className={`h-full transition-colors ${course.enrolledStudents >= course.maxStudents ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]'}`}
              />
           </div>
        </div>

        <div className="flex gap-2 pt-2">
          {!enrolled && !isFull && onEnroll && (
             <Button 
              size="sm"
              onClick={() => onEnroll(course)}
              className="flex-1 shadow-sm"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" /> Enroll
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => onView(course)} className={enrolled || isFull ? "flex-1" : ""}>
             Details
          </Button>

          {enrolled && onDrop && (
            <Button 
              size="sm"
              variant="destructive"
              className="px-3"
              onClick={() => onDrop(course.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
