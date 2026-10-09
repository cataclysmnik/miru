"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  UploadCloud, 
  Sparkles, 
  X,
  Lock,
  Award,
  ArrowRight,
  BookOpen,
  Paperclip,
  Download,
  Loader2,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthRole } from "@/context/RoleAuthContext";
import { useState, useEffect } from "react";
import { DataService, AssignmentData, SubmissionData, CourseData } from "@/lib/dataService";
import Link from "next/link";

export default function AssignmentsPage() {
  const { role, isTeacher, userProfile, user } = useAuthRole();

  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const studentIdentifier = userProfile?.idNumber || user?.email || "24BRS1242";
  const rawStudentName = userProfile?.name;
  const studentName = (rawStudentName && !rawStudentName.toLowerCase().includes("nikunj"))
    ? rawStudentName
    : "Sagnik Singha";

  // Create Assignment Modal (Teacher)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("CS101");
  const [newDueDate, setNewDueDate] = useState("2026-11-15");
  const [newMarks, setNewMarks] = useState(100);
  const [newInstructions, setNewInstructions] = useState("");

  // Submit Assignment Modal (Student)
  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentData | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Grading Modal (Teacher)
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionData | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(95);
  const [feedbackInput, setFeedbackInput] = useState("");

  const loadData = () => {
    setAssignments(DataService.getAssignments());
    setSubmissions(DataService.getSubmissions());
    const loadedCourses = DataService.getCourses();
    setCourses(loadedCourses);
    if (loadedCourses.length > 0 && !newCourse) {
      setNewCourse(loadedCourses[0].courseCode);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "submissions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadedFileUrl(data.fileUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerDownload = (fileName: string, fileUrl?: string) => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloadToast(`Opening file: ${fileName}`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3500);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetCourse = courses.find((c) => c.courseCode === newCourse || c.id === newCourse);

    DataService.createAssignment({
      courseId: targetCourse ? targetCourse.id : newCourse.toLowerCase(),
      courseCode: targetCourse ? targetCourse.courseCode : newCourse,
      title: newTitle.trim(),
      instructions: newInstructions.trim() || "Follow prompt details provided during lecture.",
      dueDate: newDueDate,
      maxMarks: Number(newMarks),
      isPublished: true,
    });

    loadData();
    setNewTitle("");
    setNewInstructions("");
    setIsCreateOpen(false);
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    DataService.submitWork({
      assignmentId: submittingAssignment.id,
      studentId: studentIdentifier,
      studentName,
      fileName: uploadedFileName || "deliverable_solution.zip",
      fileUrl: uploadedFileUrl || undefined,
      notes: submissionNotes,
    });

    loadData();
    setSubmittingAssignment(null);
    setSubmissionNotes("");
    setUploadedFileName("");
    setUploadedFileUrl("");
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    // Verify course ownership
    const assign = assignments.find((a) => a.id === gradingSubmission.assignmentId);
    const crs = courses.find((c) => c.id === assign?.courseId || c.courseCode === assign?.courseCode);
    const isOwner = isTeacher && crs && (
      crs.teacherId?.toLowerCase() === teacherIdentifier.toLowerCase() ||
      (teacherIdentifier === "58291" && crs.teacherId === "faculty-1") ||
      (userProfile?.name && crs.teacherName && userProfile.name.toLowerCase() === crs.teacherName.toLowerCase())
    );

    if (!isOwner) {
      alert("Unauthorized: You can only grade submissions for courses you teach.");
      return;
    }

    DataService.gradeSubmission(
      gradingSubmission.id,
      gradeInput,
      feedbackInput || "Well organized submission meeting all specifications.",
      teacherIdentifier,
      userProfile?.name
    );

    loadData();
    setGradingSubmission(null);
  };

  const teacherIdentifier = userProfile?.idNumber || "58291";

  // Enrolled courses for current student
  const enrolledCourses = courses.filter((c) =>
    c.enrolledStudents.some((id) =>
      id.toLowerCase() === studentIdentifier.toLowerCase() ||
      (userProfile?.email && id.toLowerCase() === userProfile.email.toLowerCase())
    )
  );

  const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id));
  const enrolledCourseCodes = new Set(enrolledCourses.map((c) => c.courseCode.toLowerCase()));

  const [teacherFilter, setTeacherFilter] = useState<"ALL" | "CONTROLLED">("ALL");

  // Students see ONLY assignments for courses they are enrolled in!
  // Teachers can view all assignments or filter by their controlled courses
  const visibleAssignments = isTeacher
    ? (teacherFilter === "ALL"
        ? assignments
        : assignments.filter((a) => {
            const c = courses.find((crs) => crs.id === a.courseId || crs.courseCode === a.courseCode);
            return c?.teacherId === teacherIdentifier || (teacherIdentifier === "58291" && c?.teacherId === "faculty-1");
          }))
    : assignments.filter((a) =>
        enrolledCourseIds.has(a.courseId) || enrolledCourseCodes.has(a.courseCode.toLowerCase())
      );

  const filteredAssignments = visibleAssignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-foreground relative">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-primary" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary tracking-wide uppercase">
              {isTeacher ? "Teacher Assessment Portal" : "Student Assignment Portal"}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Fall Semester 2026
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isTeacher 
              ? "Draft prompts for your courses, establish rubrics, and grade student submissions." 
              : "Review upcoming assignment guidelines, submit deliverables, and read instructor evaluations."}
          </p>
        </div>

        {/* Action Button: Teacher only gets Create Assignment */}
        {isTeacher ? (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Assignment
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-primary/20 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Assignment creation restricted to teachers</span>
          </div>
        )}
      </div>

      {/* Student Enrolled Courses Banner */}
      {!isTeacher && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Enrolled Curriculum • {enrolledCourses.length} {enrolledCourses.length === 1 ? "Course" : "Courses"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enrolledCourses.length > 0
                  ? `Showing assignments for: ${enrolledCourses.map((c) => `${c.courseCode} (${c.title})`).join(", ")}`
                  : "You are not enrolled in any courses for Fall 2026."}
              </p>
            </div>
          </div>
          <Link href="/courses">
            <Button variant="outline" size="sm" className="rounded-xl text-xs flex items-center gap-1.5 h-8">
              Manage Enrolled Courses →
            </Button>
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/60 border border-border/40 rounded-xl placeholder:text-muted-foreground focus-visible:ring-primary text-sm" 
            placeholder={isTeacher ? "Search all assignments by title or course..." : "Search assignments in your enrolled courses..."} 
          />
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2">
            <Button
              variant={teacherFilter === "ALL" ? "default" : "outline"}
              size="sm"
              className="rounded-xl text-xs h-10 px-3.5 font-medium"
              onClick={() => setTeacherFilter("ALL")}
            >
              All Assignments ({assignments.length})
            </Button>
            <Button
              variant={teacherFilter === "CONTROLLED" ? "default" : "outline"}
              size="sm"
              className="rounded-xl text-xs h-10 px-3.5 font-medium"
              onClick={() => setTeacherFilter("CONTROLLED")}
            >
              Your Courses
            </Button>
          </div>
        )}
      </div>

      {/* Assignments List */}
      <div className="flex flex-col gap-4">
        {filteredAssignments.map((assignment) => {
          // Find student submission for this assignment
          const studentSub = submissions.find(
            (s) => s.assignmentId === assignment.id && s.studentId === studentIdentifier
          );

          // All submissions for this assignment (for teacher view)
          const assignmentSubs = submissions.filter((s) => s.assignmentId === assignment.id);
          const pendingGradingSub = assignmentSubs.find((s) => s.status === "SUBMITTED");
          const targetCourse = courses.find((c) => c.courseCode === assignment.courseCode || c.id === assignment.courseId);
          const isMyCourse = isTeacher && targetCourse && (
            targetCourse.teacherId?.toLowerCase() === teacherIdentifier.toLowerCase() ||
            (teacherIdentifier === "58291" && targetCourse.teacherId === "faculty-1") ||
            (Boolean(userProfile?.name) && Boolean(targetCourse.teacherName) && userProfile!.name.toLowerCase() === targetCourse.teacherName.toLowerCase())
          );

          return (
            <Card key={assignment.id} className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden">
              <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    studentSub?.status === 'GRADED'
                      ? 'bg-primary/15 text-primary' 
                      : 'bg-secondary text-primary'
                  }`}>
                    {studentSub?.status === 'GRADED' ? <Award className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                        {assignment.courseCode}
                      </span>
                      <span className="text-xs text-muted-foreground">Max Marks: {assignment.maxMarks}</span>
                      {targetCourse && (
                        <Link 
                          href={`/courses/${targetCourse.id}`} 
                          className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 ml-1"
                        >
                          Course Hub <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {isTeacher && (
                        <span className="text-xs text-primary font-medium">
                          • {assignmentSubs.length} Submissions
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-card-foreground">{assignment.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                      {assignment.instructions}
                    </p>

                    {/* Student Grade Feedback Pill */}
                    {studentSub?.status === 'GRADED' && (
                      <div className="mt-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                        <span className="font-bold text-primary mr-2">Grade: {studentSub.grade} / {assignment.maxMarks}</span>
                        {studentSub.feedback && <span className="text-muted-foreground italic">"{studentSub.feedback}"</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Due Date & Role Specific Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 lg:border-l lg:border-border lg:pl-6">
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Due Date</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {assignment.dueDate}
                    </div>
                  </div>
                  
                  {isTeacher ? (
                    /* Teacher Controls */
                    <div className="flex items-center gap-3">
                      {isMyCourse ? (
                        pendingGradingSub ? (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setGradingSubmission(pendingGradingSub);
                              setGradeInput(90);
                              setFeedbackInput("");
                            }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
                          >
                            Grade ({pendingGradingSub.studentName})
                          </Button>
                        ) : assignmentSubs.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            All Graded
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No submissions yet</span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-xs text-muted-foreground border border-border/40">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Taught by {targetCourse?.teacherName || "Other Faculty"}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Student Controls */
                    <div className="flex items-center gap-3">
                      {!studentSub && (
                        <Button 
                          size="sm"
                          onClick={() => setSubmittingAssignment(assignment)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          Submit Work
                        </Button>
                      )}

                      {studentSub?.status === 'SUBMITTED' && (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-xl border border-primary/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            Submitted (Awaiting Grade)
                          </span>
                          {studentSub.fileName && (
                            <button
                              onClick={() => triggerDownload(studentSub.fileName, studentSub.fileUrl)}
                              className="text-[11px] text-primary hover:underline flex items-center gap-1 max-w-[150px] truncate"
                              title={studentSub.fileName}
                            >
                              <Paperclip className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{studentSub.fileName}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {studentSub?.status === 'GRADED' && (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/15 text-primary px-3 py-1.5 rounded-xl border border-primary/30">
                            <Award className="w-3.5 h-3.5" />
                            {studentSub.grade} / {assignment.maxMarks}
                          </span>
                          {studentSub.fileName && (
                            <button
                              onClick={() => triggerDownload(studentSub.fileName, studentSub.fileUrl)}
                              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 max-w-[150px] truncate"
                              title={studentSub.fileName}
                            >
                              <Paperclip className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{studentSub.fileName}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredAssignments.length === 0 && (
          <Card className="rounded-2xl border border-dashed border-border/80 p-10 text-center bg-card/40">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="font-serif font-bold text-lg text-foreground mb-1">
              {!isTeacher && enrolledCourses.length === 0 
                ? "No Enrolled Courses Found" 
                : "No Assignments Found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
              {!isTeacher && enrolledCourses.length === 0
                ? "You are not enrolled in any courses yet for Fall Semester 2026. Browse the Course Directory to enroll and view assignment prompts."
                : searchTerm
                ? `No assignments match "${searchTerm}" in your active courses.`
                : "There are currently no assignments posted for your enrolled courses."}
            </p>
            {!isTeacher && (
              <Link href="/courses">
                <Button className="rounded-xl text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                  Browse Course Directory →
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>

      {/* TEACHER MODAL: Create Assignment */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in-50 zoom-in-95">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold font-serif">Create Assignment</h2>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Assignment Title
                </label>
                <Input 
                  required
                  placeholder="e.g. Next.js Routing and SSR Middleware"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl bg-muted/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                    Course
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full rounded-xl bg-muted/60 border border-input p-2.5 text-sm"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.courseCode}>
                        {c.courseCode} ({c.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                    Max Marks
                  </label>
                  <Input 
                    type="number"
                    required
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    className="rounded-xl bg-muted/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Due Date
                </label>
                <Input 
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="rounded-xl bg-muted/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Instructions
                </label>
                <textarea 
                  rows={3}
                  placeholder="Guidelines for submissions, deliverables..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  Publish Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT MODAL: Submit Assignment */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in-50 zoom-in-95">
            <button 
              onClick={() => setSubmittingAssignment(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-serif">Submit Deliverable</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {submittingAssignment.title} ({submittingAssignment.courseCode})
            </p>

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Upload Deliverable File
                </label>
                <label className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/50 transition-colors bg-muted/30 cursor-pointer block">
                  <input
                    type="file"
                    className="hidden"
                    accept=".zip,.pdf,.ts,.tsx,.js,.py,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-col items-center">
                    {isUploading ? (
                      <Loader2 className="w-7 h-7 text-primary animate-spin mb-1.5" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-primary mb-1.5" />
                    )}
                    <span className="text-xs text-foreground font-medium">
                      {isUploading ? "Uploading deliverable..." : "Click or browse to choose deliverable file"}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Accepts .zip, .pdf, .ts, .py, .docx
                    </span>
                    {uploadedFileName && (
                      <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {uploadedFileName}
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Submission Notes
                </label>
                <textarea 
                  rows={2}
                  placeholder="Notes for your instructor..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setSubmittingAssignment(null)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  {isUploading ? "Uploading..." : "Turn In Deliverable"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL: Grade Assignment */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in-50 zoom-in-95">
            <button 
              onClick={() => setGradingSubmission(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-serif">Grade Student Submission</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Student: <strong className="text-foreground">{gradingSubmission.studentName}</strong> ({gradingSubmission.studentId})
            </p>

            {/* Deliverable File Inspection */}
            <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {gradingSubmission.fileName || "Submitted deliverable"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Turned in on {gradingSubmission.submissionDate}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => triggerDownload(gradingSubmission.fileName, gradingSubmission.fileUrl)}
                className="text-xs rounded-xl flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>

            {gradingSubmission.notes && (
              <div className="mb-4 p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs">
                <span className="font-semibold text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Student Notes</span>
                <p className="text-foreground italic">"{gradingSubmission.notes}"</p>
              </div>
            )}

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Awarded Score (Max 100)
                </label>
                <Input 
                  type="number"
                  max={100}
                  min={0}
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(Number(e.target.value))}
                  className="rounded-xl bg-muted/60 text-lg font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Feedback & Evaluation Remarks
                </label>
                <textarea 
                  rows={3}
                  placeholder="Feedback for the student..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  Save Grade to Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
