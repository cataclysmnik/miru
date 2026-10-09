"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Users, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  X, 
  FileText, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthRole } from "@/context/RoleAuthContext";
import { useState, useEffect } from "react";
import { DataService, CourseData } from "@/lib/dataService";
import Link from "next/link";

export default function CoursesPage() {
  const { role, isTeacher, userProfile, user } = useAuthRole();

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Create Course Modal State (Teacher Only)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const studentIdentifier = userProfile?.idNumber || user?.email || "24BRS1242";
  const teacherIdentifier = userProfile?.idNumber || "58291";

  const loadCourses = () => {
    setCourses(DataService.getCourses());
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnrollToggle = (courseId: string) => {
    DataService.enrollStudent(courseId, studentIdentifier);
    loadCourses();
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const teacherName = userProfile?.name || "Prof. Kenneth Mori";
    const teacherId = teacherIdentifier;

    DataService.createCourse({
      title: newTitle.trim(),
      courseCode: newCode.trim().toUpperCase(),
      description: newDesc.trim() || "Course syllabus, assignments, and study materials managed on miru.",
      teacherId,
      teacherName,
      isPublished: true,
    });

    loadCourses();
    setNewTitle("");
    setNewCode("");
    setNewDesc("");
    setIsCreateOpen(false);
  };

  const teacherControlledCourses = courses.filter(
    (c) => c.teacherId === teacherIdentifier || (teacherIdentifier === "58291" && c.teacherId === "faculty-1")
  );

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "All") return true;
    if (statusFilter === "MyControlled") {
      return c.teacherId === teacherIdentifier || (teacherIdentifier === "58291" && c.teacherId === "faculty-1");
    }
    if (statusFilter === "MyEnrolled") {
      return c.enrolledStudents.includes(studentIdentifier);
    }
    if (statusFilter === "Active") return c.isPublished;
    if (statusFilter === "Draft") return !c.isPublished;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-foreground">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary tracking-wide uppercase">
              {isTeacher ? "Instructor Course Management" : "Student Course Directory"}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Fall Semester 2026
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isTeacher 
              ? `You control ${teacherControlledCourses.length} course(s). Publish study materials, assignments, and inspect student enrollments.` 
              : "Explore available courses, access study materials, and submit your assignment deliverables."}
          </p>
        </div>

        {/* Action Button: Teacher only gets Create Course */}
        {isTeacher ? (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create New Course
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-primary/20 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Course creation restricted to teachers</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/60 border border-border/40 rounded-xl placeholder:text-muted-foreground focus-visible:ring-primary w-full text-sm" 
            placeholder="Search courses by title or code..." 
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-muted/80 text-foreground border border-border/50 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-auto font-medium"
        >
          <option value="All">All Courses</option>
          {isTeacher ? (
            <option value="MyControlled">Courses You Control ({teacherControlledCourses.length})</option>
          ) : (
            <option value="MyEnrolled">My Enrolled Courses</option>
          )}
          <option value="Active">Active Courses</option>
          <option value="Draft">Drafts</option>
        </select>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = course.enrolledStudents.includes(studentIdentifier);
          const studentCount = course.enrolledStudents.length;
          const isController = isTeacher && (course.teacherId === teacherIdentifier || (teacherIdentifier === "58291" && course.teacherId === "faculty-1"));
          
          const resourceCount = DataService.getResources(course.id).length;
          const assignmentCount = DataService.getAssignments().filter(
            (a) => a.courseId === course.id || a.courseCode === course.courseCode
          ).length;

          return (
            <Card key={course.id} className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden flex flex-col group">
              {/* Header Banner - Clickable */}
              <Link href={`/courses/${course.id}`} className="block">
                <div className="h-32 bg-primary/10 relative flex items-center justify-center border-b border-border/40 group-hover:bg-primary/15 transition-colors">
                  <BookOpen className="text-primary w-12 h-12 opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-md px-3 py-1 rounded-full text-primary font-mono text-xs font-bold border border-primary/20 shadow-xs">
                    {course.courseCode}
                  </div>
                  {isController && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" /> Controlled by You
                    </div>
                  )}
                  {!course.isPublished && (
                    <div className="absolute top-3 left-3 bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-border">
                      Draft
                    </div>
                  )}
                </div>
              </Link>

              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/courses/${course.id}`}>
                    <h3 className="font-bold text-lg mb-1.5 text-card-foreground group-hover:text-primary transition-colors cursor-pointer">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mb-2">
                    Instructor: <strong className="text-foreground">{course.teacherName}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>
                </div>
                
                <div className="border-t border-border pt-4 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {studentCount} {studentCount === 1 ? "Student" : "Students"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span>{resourceCount} Materials</span>
                      <span>•</span>
                      <span>{assignmentCount} Tasks</span>
                    </div>
                  </div>

                  {/* Course Actions */}
                  {isTeacher ? (
                    <div className="flex flex-col gap-2">
                      <Link href={`/courses/${course.id}`} className="w-full">
                        <Button 
                          size="sm" 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                        >
                          {isController ? "Manage Course Hub" : "Enter Course Hub"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href={`/courses/${course.id}`} className="w-full">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="w-full text-xs rounded-xl border border-primary/20 hover:border-primary flex items-center justify-center gap-1.5"
                        >
                          View Study Materials & Tasks
                          <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        </Button>
                      </Link>
                      
                      {isEnrolled ? (
                        <Button 
                          onClick={() => handleEnrollToggle(course.id)}
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs rounded-xl border-primary/30 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          Enrolled (Click to Drop)
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleEnrollToggle(course.id)}
                          size="sm" 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
                        >
                          Enroll in Course
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Teacher Modal: Create Course */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in-50 zoom-in-95">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif">Create New Course</h2>
                <p className="text-xs text-muted-foreground">You will be designated as the course controller.</p>
              </div>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Course Title
                </label>
                <Input 
                  required
                  placeholder="e.g. Distributed Cloud Computing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl bg-muted/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Course Code
                </label>
                <Input 
                  required
                  placeholder="e.g. CS501"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="rounded-xl bg-muted/60 uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Description & Syllabus Overview
                </label>
                <textarea 
                  rows={3}
                  placeholder="Brief summary of learning objectives, study materials, and prerequisites..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  Publish Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
