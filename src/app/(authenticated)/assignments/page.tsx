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
  ArrowRight
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
      notes: submissionNotes,
    });

    loadData();
    setSubmittingAssignment(null);
    setSubmissionNotes("");
    setUploadedFileName("");
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    DataService.gradeSubmission(
      gradingSubmission.id,
      gradeInput,
      feedbackInput || "Well organized submission meeting all specifications."
    );

    loadData();
    setGradingSubmission(null);
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-foreground">
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

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/60 border border-border/40 rounded-xl placeholder:text-muted-foreground focus-visible:ring-primary text-sm" 
            placeholder="Search assignments by title or course code..." 
          />
        </div>
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
                      {pendingGradingSub ? (
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
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-xl border border-primary/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          Submitted (Awaiting Grade)
                        </span>
                      )}

                      {studentSub?.status === 'GRADED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/15 text-primary px-3 py-1.5 rounded-xl border border-primary/30">
                          <Award className="w-3.5 h-3.5" />
                          {studentSub.grade} / {assignment.maxMarks}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                  Attach Deliverable File
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/30">
                  <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-xs text-foreground font-medium">Click to select file</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Accepts .zip, .pdf, .ts files</p>
                  {uploadedFileName ? (
                    <p className="text-xs text-primary font-bold mt-2">Selected: {uploadedFileName}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("project_solution_final.zip")}
                      className="mt-2 text-xs text-primary underline"
                    >
                      Attach project_solution_final.zip
                    </button>
                  )}
                </div>
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
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  Turn In to Database
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
            <p className="text-xs text-muted-foreground mb-4">
              Student: <strong className="text-foreground">{gradingSubmission.studentName}</strong> ({gradingSubmission.studentId})
            </p>

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
