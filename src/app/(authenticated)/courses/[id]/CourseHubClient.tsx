"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthRole } from "@/context/RoleAuthContext";
import { 
  DataService, 
  CourseData, 
  CourseResourceData, 
  AssignmentData, 
  SubmissionData 
} from "@/lib/dataService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Download, 
  Plus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  UploadCloud, 
  Award, 
  Sparkles, 
  X, 
  Trash2,
  ShieldCheck,
  Check,
  Paperclip,
  ExternalLink,
  Loader2,
  Lock
} from "lucide-react";
import Link from "next/link";

interface CourseHubClientProps {
  courseId: string;
}

export default function CourseHubClient({ courseId }: CourseHubClientProps) {
  const router = useRouter();
  const { role, isTeacher, userProfile, user } = useAuthRole();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [resources, setResources] = useState<CourseResourceData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [activeTab, setActiveTab] = useState<"materials" | "assignments" | "roster">("materials");
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Fallbacks ensuring instantaneous render in both SSR and client state
  const currentCourse = course || (courseId ? DataService.getCourseById(courseId) : null) || DataService.getCourses().find((c) => c.id === courseId || c.courseCode.toLowerCase() === courseId?.toLowerCase()) || DataService.getCourses()[0];
  const currentResources = resources.length > 0 ? resources : (currentCourse ? DataService.getResources(currentCourse.id) : []);
  const currentAssignments = assignments.length > 0 ? assignments : (currentCourse ? DataService.getAssignments().filter((a) => a.courseId === currentCourse.id || a.courseCode === currentCourse.courseCode) : []);
  const currentSubmissions = submissions.length > 0 ? submissions : DataService.getSubmissions();

  // Add Resource Modal (Teacher)
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resFileName, setResFileName] = useState("");
  const [resFileUrl, setResFileUrl] = useState("");
  const [resFileSize, setResFileSize] = useState("");
  const [resType, setResType] = useState("Lecture Slides");
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  // Create Assignment Modal (Teacher)
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("2026-11-15");
  const [assignMaxMarks, setAssignMaxMarks] = useState(100);
  const [assignInstructions, setAssignInstructions] = useState("");

  // Submit Work Modal (Student)
  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentData | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [isUploadingSubmission, setIsUploadingSubmission] = useState(false);

  // Grade Modal (Teacher)
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionData | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(95);
  const [gradeFeedback, setGradeFeedback] = useState("");

  const studentIdentifier = userProfile?.idNumber || user?.email || "24BRS1242";
  const rawStudentName = userProfile?.name;
  const studentName = (rawStudentName && !rawStudentName.toLowerCase().includes("nikunj"))
    ? rawStudentName
    : "Sagnik Singha";
  const teacherIdentifier = userProfile?.idNumber || "58291";

  const refreshCourseData = () => {
    const found = DataService.getCourseById(courseId) || currentCourse;
    setCourse(found);
    if (found) {
      setResources(DataService.getResources(found.id));
      setAssignments(
        DataService.getAssignments().filter(
          (a) => a.courseId === found.id || a.courseCode === found.courseCode
        )
      );
      setSubmissions(DataService.getSubmissions());
    }
  };

  useEffect(() => {
    refreshCourseData();
  }, [courseId]);

  if (!currentCourse) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold font-serif mb-2">Course Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">The requested course could not be located in the database.</p>
        <Link href="/courses">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const isEnrolled = currentCourse.enrolledStudents.some((id) =>
    id.toLowerCase() === studentIdentifier.toLowerCase() ||
    (userProfile?.email && id.toLowerCase() === userProfile.email.toLowerCase())
  );
  const isController = isTeacher && (currentCourse.teacherId === teacherIdentifier || (teacherIdentifier === "58291" && currentCourse.teacherId === "faculty-1"));

  const handleEnrollToggle = () => {
    DataService.enrollStudent(currentCourse.id, studentIdentifier);
    refreshCourseData();
  };

  const handleResourceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResource(true);
    setResFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "materials");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResFileUrl(data.fileUrl);
        setResFileSize(data.fileSize || "2.4 MB");
        if (!resTitle.trim()) {
          setResTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        }
      }
    } catch (err) {
      console.error("Upload material error:", err);
    } finally {
      setIsUploadingResource(false);
    }
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    DataService.addResource({
      courseId: currentCourse.id,
      title: resTitle.trim(),
      description: resDesc.trim() || "Course study document and reference materials.",
      fileName: resFileName.trim() || `${resTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      fileUrl: resFileUrl || undefined,
      fileType: resType,
      fileSize: resFileSize || "2.4 MB",
    });

    setResTitle("");
    setResDesc("");
    setResFileName("");
    setResFileUrl("");
    setResFileSize("");
    setIsAddResourceOpen(false);
    refreshCourseData();
  };

  const handleDeleteResource = (id: string) => {
    if (confirm("Remove this study material from the course?")) {
      DataService.deleteResource(id);
      refreshCourseData();
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    DataService.createAssignment({
      courseId: currentCourse.id,
      courseCode: currentCourse.courseCode,
      title: assignTitle.trim(),
      instructions: assignInstructions.trim() || "Follow submission guidelines provided in the syllabus.",
      dueDate: assignDueDate,
      maxMarks: Number(assignMaxMarks),
      isPublished: true,
    });

    setAssignTitle("");
    setAssignInstructions("");
    setIsAddAssignmentOpen(false);
    refreshCourseData();
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm("Delete this assignment from the course?")) {
      DataService.deleteAssignment(id);
      refreshCourseData();
    }
  };

  const handleSubmissionFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSubmission(true);
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
      console.error("Upload submission error:", err);
    } finally {
      setIsUploadingSubmission(false);
    }
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    // Auto-enroll student if not enrolled yet
    if (!isEnrolled) {
      DataService.enrollStudent(currentCourse.id, studentIdentifier);
    }

    DataService.submitWork({
      assignmentId: submittingAssignment.id,
      studentId: studentIdentifier,
      studentName,
      fileName: uploadedFileName || "deliverable.zip",
      fileUrl: uploadedFileUrl || undefined,
      notes: submissionNotes,
    });

    setSubmittingAssignment(null);
    setSubmissionNotes("");
    setUploadedFileName("");
    setUploadedFileUrl("");
    refreshCourseData();
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !isController) return;

    DataService.gradeSubmission(
      gradingSubmission.id,
      gradeScore,
      gradeFeedback || "Excellent solution adhering to all specifications.",
      teacherIdentifier,
      userProfile?.name
    );

    setGradingSubmission(null);
    refreshCourseData();
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-primary" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <Link 
          href="/courses" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses Directory
        </Link>

        <div className="flex items-center gap-3">
          {isTeacher ? (
            <div className="flex items-center gap-2">
              {isController ? (
                <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/20 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Instructor & Course Controller
                </span>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border font-medium">
                  Faculty View (Instructor: {currentCourse.teacherName})
                </span>
              )}
            </div>
          ) : (
            <div>
              {isEnrolled ? (
                <Button 
                  onClick={handleEnrollToggle}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/30 text-primary text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Enrolled (Drop Course)
                </Button>
              ) : (
                <Button 
                  onClick={handleEnrollToggle}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs shadow-xs"
                >
                  Enroll in This Course
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Hero Banner */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {currentCourse.courseCode}
              </span>
              <span className="text-xs text-muted-foreground">Instructor: <strong className="text-foreground">{currentCourse.teacherName}</strong></span>
              <span className="text-xs text-muted-foreground">• Fall Semester 2026</span>
              {isController && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                  Controlled by You
                </span>
              )}
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
              {currentCourse.title}
            </h1>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              {currentCourse.description}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-border">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span>{currentCourse.enrolledStudents.length} Students Enrolled</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {currentAssignments.length} Assignments • {currentResources.length} Study Materials
            </span>
          </div>
        </div>
      </div>

      {/* Student Enrollment Prompt if not enrolled */}
      {!isTeacher && !isEnrolled && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">You are previewing {currentCourse.title}</h4>
              <p className="text-xs text-muted-foreground">Enroll to submit assignment deliverables and receive instructor evaluations.</p>
            </div>
          </div>
          <Button 
            onClick={handleEnrollToggle}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
          >
            Enroll in Course Now
          </Button>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "materials"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4 text-primary" />
          Study Materials ({currentResources.length})
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "assignments"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 text-primary" />
          Assignments ({currentAssignments.length})
        </button>
        {isTeacher && (
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "roster"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 text-primary" />
            Class Roster ({currentCourse.enrolledStudents.length})
          </button>
        )}
      </div>

      {/* =========================================================================
         TAB 1: STUDY MATERIALS
         ========================================================================= */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif">Curriculum & Study Materials</h2>
              <p className="text-xs text-muted-foreground">Lecture slides, handouts, and guides curated by {currentCourse.teacherName}.</p>
            </div>
            {isTeacher && (
              <Button 
                onClick={() => setIsAddResourceOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Study Material
              </Button>
            )}
          </div>

          {/* Enrolled-only access gate for students */}
          {!isTeacher && !isEnrolled ? (
            <Card className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                Study Materials Restricted
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
                Lecture slides, guides, and curriculum resources for {currentCourse.courseCode} are accessible only to students officially enrolled in this course.
              </p>
              <Button
                onClick={handleEnrollToggle}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
              >
                Enroll in {currentCourse.courseCode} to View Materials
              </Button>
            </Card>
          ) : currentResources.length === 0 ? (
            <Card className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
              <p className="font-medium text-foreground">No study materials uploaded yet</p>
              <p className="text-xs text-muted-foreground mt-1">The instructor will upload slides, lecture notes, and guides here soon.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentResources.map((res) => (
                <Card key={res.id} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {res.fileType}
                          </span>
                          <span className="text-xs text-muted-foreground">• {res.fileSize}</span>
                        </div>
                        {isTeacher && (
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-1">{res.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{res.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-[11px] text-muted-foreground font-mono">{res.fileName}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs rounded-xl border-border flex items-center gap-1.5 hover:border-primary hover:text-primary"
                          onClick={() => triggerDownload(res.fileName, res.fileUrl)}
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         TAB 2: ASSIGNMENTS & SUBMISSIONS
         ========================================================================= */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif">Course Tasks & Deliverables</h2>
              <p className="text-xs text-muted-foreground">Review prompts, turn in deliverables, and inspect grades.</p>
            </div>
            {isTeacher && (
              <Button 
                onClick={() => setIsAddAssignmentOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Create Course Assignment
              </Button>
            )}
          </div>

          {/* Enrolled-only access gate for assignments */}
          {!isTeacher && !isEnrolled ? (
            <Card className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                Assignments Restricted
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
                Course deliverables, prompts, and grading rubrics for {currentCourse.courseCode} are accessible only to students officially enrolled in this course.
              </p>
              <Button
                onClick={handleEnrollToggle}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
              >
                Enroll in {currentCourse.courseCode} to View Assignments
              </Button>
            </Card>
          ) : currentAssignments.length === 0 ? (
            <Card className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
              <p className="font-medium text-foreground">No assignments published for this course yet</p>
              <p className="text-xs text-muted-foreground mt-1">Course tasks and deliverables created by the instructor will appear here.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {currentAssignments.map((assignment) => {
                const studentSub = currentSubmissions.find(
                  (s) => s.assignmentId === assignment.id && s.studentId === studentIdentifier
                );
                const assignmentSubs = currentSubmissions.filter((s) => s.assignmentId === assignment.id);
                const pendingSub = assignmentSubs.find((s) => s.status === "SUBMITTED");

                return (
                  <Card key={assignment.id} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          studentSub?.status === 'GRADED' ? 'bg-primary/15 text-primary' : 'bg-secondary text-primary'
                        }`}>
                          {studentSub?.status === 'GRADED' ? <Award className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                              Max: {assignment.maxMarks} Marks
                            </span>
                            {isTeacher && (
                              <span className="text-xs text-primary font-medium">
                                • {assignmentSubs.length} Submissions Received
                              </span>
                            )}
                            {isTeacher && (
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded ml-auto"
                                title="Delete Assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-foreground">{assignment.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                            {assignment.instructions}
                          </p>

                          {/* Grade Feedback */}
                          {studentSub?.status === 'GRADED' && (
                            <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                              <span className="font-bold text-primary mr-2">Awarded Score: {studentSub.grade} / {assignment.maxMarks}</span>
                              {studentSub.feedback && <span className="text-muted-foreground italic">"{studentSub.feedback}"</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 lg:border-l lg:border-border lg:pl-6">
                        <div className="flex flex-col gap-1 min-w-[90px]">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Due Date</span>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {assignment.dueDate}
                          </div>
                        </div>

                        {isTeacher ? (
                          /* Teacher Controls */
                          <div>
                            {isController ? (
                              pendingSub ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setGradingSubmission(pendingSub);
                                    setGradeScore(95);
                                    setGradeFeedback("");
                                  }}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs"
                                >
                                  Grade ({pendingSub.studentName})
                                </Button>
                              ) : assignmentSubs.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-xl">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> All Graded
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No submissions</span>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Taught by {currentCourse.teacherName}
                              </span>
                            )}
                          </div>
                        ) : (
                          /* Student Controls */
                          <div>
                            {!studentSub && (
                              isEnrolled ? (
                                <Button 
                                  size="sm"
                                  onClick={() => setSubmittingAssignment(assignment)}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" /> Submit Work
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={handleEnrollToggle}
                                  variant="outline"
                                  className="text-xs rounded-xl flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Enroll to Submit
                                </Button>
                              )
                            )}
                            {studentSub?.status === 'SUBMITTED' && (
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-xl border border-primary/20">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Turned In
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
                                  <Award className="w-3.5 h-3.5" /> {studentSub.grade} / {assignment.maxMarks}
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
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         TAB 3: CLASS ROSTER (TEACHER VIEW)
         ========================================================================= */}
      {activeTab === "roster" && isTeacher && (
        <Card className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-xl font-bold font-serif mb-1">Enrolled Students Roster</h2>
          <p className="text-xs text-muted-foreground mb-4">Official list of student registration numbers currently enrolled in {currentCourse.courseCode}.</p>
          
          {currentCourse.enrolledStudents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No students currently enrolled in this course.</p>
          ) : (
            <div className="divide-y divide-border">
              {currentCourse.enrolledStudents.map((id, index) => {
                const studentCompletedCount = currentSubmissions.filter(
                  (s) => s.studentId === id && currentAssignments.some((a) => a.id === s.assignmentId)
                ).length;

                return (
                  <div key={index} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-mono text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-mono text-sm font-semibold text-foreground">{id}</span>
                        <p className="text-xs text-muted-foreground">
                          {studentCompletedCount} of {currentAssignments.length} assignments turned in
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Enrolled
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TEACHER MODAL: Add Study Material */}
      {isAddResourceOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in-50 zoom-in-95">
            <button 
              onClick={() => setIsAddResourceOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-serif">Add Study Material</h2>
            </div>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Upload Document / File</label>
                <label className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-muted/30 cursor-pointer block">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                    onChange={handleResourceFileSelect}
                  />
                  <div className="flex flex-col items-center">
                    {isUploadingResource ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-primary mb-1" />
                    )}
                    <span className="text-xs text-foreground font-medium">
                      {isUploadingResource ? "Uploading..." : "Click or browse to upload file"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Accepts PDF, PPT, DOC, TXT, ZIP
                    </span>
                    {resFileName && (
                      <span className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {resFileName} {resFileSize ? `(${resFileSize})` : ""}
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Material Title</label>
                <Input 
                  required 
                  placeholder="e.g. Next.js App Router Architecture Slides"
                  value={resTitle} 
                  onChange={(e) => setResTitle(e.target.value)} 
                  className="rounded-xl bg-muted/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Resource Type</label>
                  <select 
                    value={resType} 
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full bg-muted/60 border border-input rounded-xl p-2.5 text-sm"
                  >
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Study Guide">Study Guide</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Architecture Guide">Architecture Guide</option>
                    <option value="Notes">Lecture Notes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1">File Name</label>
                  <Input 
                    placeholder="slides_week01.pdf" 
                    value={resFileName} 
                    onChange={(e) => setResFileName(e.target.value)} 
                    className="rounded-xl bg-muted/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  rows={2} 
                  placeholder="Brief summary of concepts and reference links..." 
                  value={resDesc} 
                  onChange={(e) => setResDesc(e.target.value)} 
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddResourceOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={isUploadingResource}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  {isUploadingResource ? "Uploading..." : "Save Material"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL: Add Course Assignment */}
      {isAddAssignmentOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in-50 zoom-in-95">
            <button 
              onClick={() => setIsAddAssignmentOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-serif">Create Course Task</h2>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Assignment Title</label>
                <Input 
                  required 
                  placeholder="e.g. Implement React Server Actions" 
                  value={assignTitle} 
                  onChange={(e) => setAssignTitle(e.target.value)} 
                  className="rounded-xl bg-muted/60"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Due Date</label>
                  <Input 
                    type="date" 
                    required 
                    value={assignDueDate} 
                    onChange={(e) => setAssignDueDate(e.target.value)} 
                    className="rounded-xl bg-muted/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Max Marks</label>
                  <Input 
                    type="number" 
                    required 
                    value={assignMaxMarks} 
                    onChange={(e) => setAssignMaxMarks(Number(e.target.value))} 
                    className="rounded-xl bg-muted/60"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Instructions</label>
                <textarea 
                  rows={3} 
                  placeholder="Submission criteria, allowed file extensions..." 
                  value={assignInstructions} 
                  onChange={(e) => setAssignInstructions(e.target.value)} 
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddAssignmentOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Publish Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT MODAL: Submit Deliverable */}
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
              <h2 className="text-xl font-bold font-serif">Turn in Deliverable</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {submittingAssignment.title} ({currentCourse.courseCode})
            </p>
            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Upload Deliverable / Solution File</label>
                <label className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/50 transition-colors bg-muted/30 cursor-pointer block">
                  <input
                    type="file"
                    className="hidden"
                    accept=".zip,.pdf,.ts,.tsx,.js,.py,.docx,.txt"
                    onChange={handleSubmissionFileSelect}
                  />
                  <div className="flex flex-col items-center">
                    {isUploadingSubmission ? (
                      <Loader2 className="w-7 h-7 text-primary animate-spin mb-1.5" />
                    ) : (
                      <UploadCloud className="w-7 h-7 text-primary mb-1.5" />
                    )}
                    <span className="text-xs text-foreground font-medium">
                      {isUploadingSubmission ? "Uploading deliverable..." : "Click or browse to choose deliverable file"}
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
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Notes for Instructor</label>
                <textarea 
                  rows={2} 
                  placeholder="Additional context about your submission..." 
                  value={submissionNotes} 
                  onChange={(e) => setSubmissionNotes(e.target.value)} 
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setSubmittingAssignment(null)} className="flex-1 rounded-xl">Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={isUploadingSubmission}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  {isUploadingSubmission ? "Uploading..." : "Submit Deliverable"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL: Grade Submission */}
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
              <h2 className="text-xl font-bold font-serif">Grade Student Deliverable</h2>
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
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Score (Out of 100)</label>
                <Input 
                  type="number" 
                  max={100} 
                  min={0} 
                  required 
                  value={gradeScore} 
                  onChange={(e) => setGradeScore(Number(e.target.value))} 
                  className="rounded-xl bg-muted/60 font-bold text-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Feedback Remarks</label>
                <textarea 
                  rows={3} 
                  placeholder="Feedback on quality, structure, and execution..." 
                  value={gradeFeedback} 
                  onChange={(e) => setGradeFeedback(e.target.value)} 
                  className="w-full rounded-xl bg-muted/60 border border-input p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Save Grade</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
