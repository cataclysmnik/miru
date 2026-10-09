"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Book, 
  Clock, 
  CheckCircle2, 
  Users, 
  FileCheck, 
  GraduationCap, 
  Plus, 
  AlertCircle,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthRole } from "@/context/RoleAuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DataService, SubmissionData, CourseData } from "@/lib/dataService";

export default function DashboardPage() {
  const { role, isTeacher, userProfile, user } = useAuthRole();

  const rawName = userProfile?.name;
  const greetingName = (rawName && !rawName.includes("@") && !rawName.toLowerCase().includes("nikunj")) 
    ? rawName 
    : (isTeacher ? "Prof. Kenneth Mori" : "Sagnik Singha");
  const identifierText = userProfile?.idNumber || (isTeacher ? "58291" : "24BRS1242");

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary tracking-wide uppercase">
              {isTeacher ? "Instructor Portal" : "Student Portal"}
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {identifierText}
            </span>
            <span className="text-xs text-muted-foreground">• Fall Semester 2026</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Welcome back, {greetingName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isTeacher 
              ? "Monitor class engagement, assess student submissions, and manage course material." 
              : "Track your coursework, prepare for deadlines, and review teacher feedback."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTeacher ? (
            <>
              <Link href="/courses">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm text-sm">
                  <Plus className="w-4 h-4 mr-2" /> New Course
                </Button>
              </Link>
              <Link href="/assignments">
                <Button variant="outline" className="rounded-xl border-border text-sm">
                  <FileText className="w-4 h-4 mr-2 text-primary" /> Grade Submissions
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/courses">
                <Button variant="outline" className="rounded-xl border-border text-sm">
                  <Book className="w-4 h-4 mr-2 text-primary" /> Explore Courses
                </Button>
              </Link>
              <Link href="/assignments">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm text-sm">
                  <FileCheck className="w-4 h-4 mr-2" /> View Tasks
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {isTeacher ? <TeacherDashboardView teacherId={identifierText} /> : <StudentDashboardView studentId={identifierText} />}
    </div>
  );
}

/* =========================================================================
   TEACHER DASHBOARD VIEW (LIVE DATABASE METRICS)
   ========================================================================= */
function TeacherDashboardView({ teacherId }: { teacherId: string }) {
  const [metrics, setMetrics] = useState({
    totalStudentsCount: 0,
    activeCoursesCount: 0,
    toGradeCount: 0,
    pendingSubmissions: [] as SubmissionData[],
    courses: [] as CourseData[],
  });

  const loadMetrics = () => {
    setMetrics(DataService.getTeacherMetrics(teacherId));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleQuickGrade = (subId: string) => {
    DataService.gradeSubmission(subId, 95, "Well articulated solution meeting all requirements.");
    loadMetrics();
  };

  return (
    <div className="space-y-8">
      {/* Teacher Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Enrolled</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {metrics.totalStudentsCount}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <span className="text-primary font-medium">{metrics.totalStudentsCount} unique students</span> in your courses
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Courses</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {metrics.activeCoursesCount}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-secondary text-primary flex items-center justify-center">
                <Book className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <span>Managed in DynamoDB</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To Grade</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {metrics.toGradeCount}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {metrics.toGradeCount === 0 ? "All submissions graded!" : "Submissions awaiting score"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Average</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">94.8%</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <span className="text-primary font-medium">Fall 2026 Term</span> performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions Needing Grading */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" /> Pending Submissions to Grade ({metrics.toGradeCount})
            </h2>
            <Link href="/assignments" className="text-xs text-primary hover:underline font-medium">
              View all assignments →
            </Link>
          </div>

          <Card className="rounded-2xl border border-border bg-card overflow-hidden">
            {metrics.pendingSubmissions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
                No submissions currently waiting for evaluation. Great job!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {metrics.pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
                        {sub.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{sub.studentName}</h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-foreground font-mono">{sub.studentId}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Deliverable: {sub.fileName}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">Submitted: {sub.submissionDate}</p>
                      </div>
                    </div>

                    <div>
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickGrade(sub.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
                      >
                        Grade (Give 95)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Courses Managed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" /> Managed Courses
          </h2>
          <div className="space-y-3">
            {metrics.courses.map((course) => (
              <Card key={course.id} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                    {course.courseCode}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.enrolledStudents.length} {course.enrolledStudents.length === 1 ? "student" : "students"}
                  </span>
                </div>
                <h4 className="font-medium text-sm text-foreground mb-3">{course.title}</h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2.5">
                  <span>Status: <strong className="text-foreground">{course.isPublished ? "Active" : "Draft"}</strong></span>
                  <Link href={`/courses/${course.id}`} className="text-primary hover:underline font-medium">Manage Hub →</Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   STUDENT DASHBOARD VIEW (LIVE DATABASE METRICS)
   ========================================================================= */
function StudentDashboardView({ studentId }: { studentId: string }) {
  const [metrics, setMetrics] = useState({
    enrolledCount: 0,
    completedAssignments: 0,
    pendingCount: 0,
    averageGrade: 92,
    enrolledCourses: [] as CourseData[],
  });

  useEffect(() => {
    setMetrics(DataService.getStudentMetrics(studentId));
  }, [studentId]);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        {/* Student Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="rounded-2xl border border-border shadow-sm bg-card hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-card-foreground">
                    {metrics.enrolledCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Enrolled Courses</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground pt-3 border-t border-border flex justify-between items-center">
                <span>Active this semester</span>
                <Link href="/courses" className="text-primary hover:underline">View Courses →</Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-border shadow-sm bg-card hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-card-foreground">
                    {metrics.completedAssignments}
                  </div>
                  <div className="text-sm text-muted-foreground">Assignments Done</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground pt-3 border-t border-border flex justify-between items-center">
                <span>Completed Tasks</span>
                <Link href="/assignments" className="text-primary hover:underline">History →</Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-border shadow-sm bg-card hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-card-foreground">
                    {metrics.pendingCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Tasks</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground pt-3 border-t border-border flex justify-between items-center">
                <span className="text-primary font-medium">{metrics.pendingCount} to complete</span>
                <Link href="/assignments" className="text-primary hover:underline">Open Tasks →</Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Enrolled Courses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">My Enrolled Courses</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline font-medium">
              Explore catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {metrics.enrolledCourses.map((course) => (
              <div key={course.id} className="bg-card text-card-foreground p-6 rounded-2xl relative overflow-hidden group border border-border hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {course.courseCode}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.enrolledStudents.length} classmates
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-xs text-muted-foreground mb-6 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">{course.teacherName}</span>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl">
                      Course Hub →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar (Progress) */}
      <div className="w-full xl:w-80 space-y-6">
        <Card className="rounded-2xl border border-border shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Academic Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-foreground">Cumulative Average</span>
                <span className="text-primary font-bold">{metrics.averageGrade}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${metrics.averageGrade}%` }}></div>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Graded Submissions</span>
                <span className="text-foreground font-semibold">1</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Completed Tasks</span>
                <span className="text-foreground font-semibold">{metrics.completedAssignments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Japanese Mindfulness Note */}
        <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-primary font-medium text-xs mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Mindful Study Tip</span>
          </div>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            "Kaizen" (改善) — continuous, gentle improvement. Small focused steps each day yield mastery over a semester.
          </p>
        </Card>
      </div>
    </div>
  );
}
