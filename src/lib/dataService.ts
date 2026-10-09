import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

export interface CourseData {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  teacherId: string;
  teacherName: string;
  isPublished: boolean;
  enrolledStudents: string[]; // List of student registration IDs / emails
}

export interface AssignmentData {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxMarks: number;
  isPublished: boolean;
}

export interface SubmissionData {
  id: string;
  assignmentId: string;
  studentId: string; // Registration ID or email
  studentName: string;
  submissionDate: string;
  fileName: string;
  notes?: string;
  status: "SUBMITTED" | "GRADED";
  grade?: number;
  feedback?: string;
}

export interface CourseResourceData {
  id: string;
  courseId: string;
  title: string;
  description: string;
  fileName: string;
  fileType: string; // PDF, Slides, Document, Notes
  fileSize: string;
  uploadedAt: string;
}

let amplifyClient: any = null;
function getClient() {
  if (!amplifyClient && typeof window !== "undefined") {
    try {
      amplifyClient = generateClient<Schema>();
    } catch {
      // Amplify not initialized or SSR
    }
  }
  return amplifyClient;
}

const STORAGE_KEY_COURSES = "miru_data_courses";
const STORAGE_KEY_ASSIGNMENTS = "miru_data_assignments";
const STORAGE_KEY_SUBMISSIONS = "miru_data_submissions";
const STORAGE_KEY_RESOURCES = "miru_data_resources";

const INITIAL_RESOURCES: CourseResourceData[] = [
  {
    id: "res-1",
    courseId: "course-1",
    title: "React 19 & Next.js Core Architecture",
    description: "Lecture slides covering Server Components, streaming SSR, and client islands.",
    fileName: "lecture_01_react_nextjs.pdf",
    fileType: "Lecture Slides",
    fileSize: "3.8 MB",
    uploadedAt: "2026-10-02",
  },
  {
    id: "res-2",
    courseId: "course-1",
    title: "Server Actions & State Management Handbook",
    description: "Comprehensive guide to mutation patterns without client overhead.",
    fileName: "server_actions_handbook.pdf",
    fileType: "Study Guide",
    fileSize: "2.1 MB",
    uploadedAt: "2026-10-04",
  },
  {
    id: "res-3",
    courseId: "course-2",
    title: "AWS DynamoDB Single Table Modeling Architecture",
    description: "Deep dive into composite partition keys, secondary indexes, and query patterns.",
    fileName: "dynamodb_single_table_patterns.pdf",
    fileType: "Architecture Guide",
    fileSize: "4.5 MB",
    uploadedAt: "2026-10-03",
  },
  {
    id: "res-4",
    courseId: "course-2",
    title: "AWS AppSync & GraphQL Resolvers Blueprint",
    description: "Official guide to pipeline resolvers, subscriptions, and Cognito auth modes.",
    fileName: "appsync_resolvers_blueprint.pdf",
    fileType: "Lecture Slides",
    fileSize: "2.7 MB",
    uploadedAt: "2026-10-05",
  },
  {
    id: "res-5",
    courseId: "course-3",
    title: "Wabi-Sabi Aesthetics in Modern Digital Interfaces",
    description: "Japanese design philosophy: honoring asymmetry, earthy matcha palettes, and calm typography.",
    fileName: "wabi_sabi_ui_philosophy.pdf",
    fileType: "Design Document",
    fileSize: "5.2 MB",
    uploadedAt: "2026-10-01",
  },
];

// Default starter dataset
const INITIAL_COURSES: CourseData[] = [
  {
    id: "course-1",
    title: "Introduction to React & Next.js",
    courseCode: "CS101",
    description: "Component architecture, state management, and modern React 19 paradigms.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1242", "24BRS1004", "24BRS1089"],
  },
  {
    id: "course-2",
    title: "Advanced AWS Cloud Architecture",
    courseCode: "CS405",
    description: "Serverless systems, DynamoDB multi-table modeling, and AppSync GraphQL.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1242", "24BRS1120"],
  },
  {
    id: "course-3",
    title: "UX/UI Design Principles & Wabi-Sabi",
    courseCode: "DS200",
    description: "Japanese aesthetic philosophy applied to human-centered digital experiences.",
    teacherId: "98765",
    teacherName: "Prof. Sarah Lee",
    isPublished: true,
    enrolledStudents: ["24BRS1055"],
  },
];

const INITIAL_ASSIGNMENTS: AssignmentData[] = [
  {
    id: "assign-1",
    courseId: "course-1",
    courseCode: "CS101",
    title: "React Component Library Architecture",
    instructions: "Implement 5 reusable UI components using Tailwind CSS and accessible patterns.",
    dueDate: "2026-10-25",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-2",
    courseId: "course-2",
    courseCode: "CS405",
    title: "AWS DynamoDB Schema Design",
    instructions: "Produce an entity-relationship diagram and single-table partition key strategy.",
    dueDate: "2026-11-02",
    maxMarks: 50,
    isPublished: true,
  },
  {
    id: "assign-3",
    courseId: "course-3",
    courseCode: "DS200",
    title: "Wabi-Sabi UI Prototype",
    instructions: "Design an e-learning user journey utilizing natural earthy tones and serene typography.",
    dueDate: "2026-10-18",
    maxMarks: 100,
    isPublished: true,
  },
];

const INITIAL_SUBMISSIONS: SubmissionData[] = [
  {
    id: "sub-1",
    assignmentId: "assign-3",
    studentId: "24BRS1242",
    studentName: "Sagnik Singha",
    submissionDate: "2026-10-06",
    fileName: "miru_design_system.fig",
    notes: "Focused on matcha green accents and serene negative space.",
    status: "GRADED",
    grade: 96,
    feedback: "Exceptional mastery of wabi-sabi whitespace and typography.",
  },
  {
    id: "sub-2",
    assignmentId: "assign-1",
    studentId: "24BRS1004",
    studentName: "Elena Rostova",
    submissionDate: "2026-10-08",
    fileName: "components_v1.zip",
    notes: "Includes full unit test coverage.",
    status: "SUBMITTED",
  },
];

export const DataService = {
  // ---------------- COURSES ----------------
  getCourses(): CourseData[] {
    if (typeof window === "undefined") return INITIAL_COURSES;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COURSES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_COURSES;
    }
  },

  async syncWithAmplifyCourses(): Promise<CourseData[]> {
    const client = getClient();
    if (client?.models?.Course) {
      try {
        const { data: cloudCourses } = await client.models.Course.list();
        if (cloudCourses && cloudCourses.length > 0) {
          const mapped: CourseData[] = cloudCourses.map((c: any) => ({
            id: c.id,
            title: c.title,
            courseCode: c.courseCode,
            description: c.description || "",
            teacherId: c.teacherId,
            teacherName: "Faculty",
            isPublished: Boolean(c.isPublished),
            enrolledStudents: [],
          }));
          return mapped;
        }
      } catch (err) {
        console.warn("Could not query DynamoDB directly (falling back to synced store):", err);
      }
    }
    return this.getCourses();
  },

  createCourse(course: Omit<CourseData, "id" | "enrolledStudents">): CourseData {
    const courses = this.getCourses();
    const newCourse: CourseData = {
      ...course,
      id: `course-${Date.now()}`,
      enrolledStudents: [],
    };

    const updated = [newCourse, ...courses];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(updated));
    }

    // Attempt writing to DynamoDB in background
    const client = getClient();
    if (client?.models?.Course) {
      client.models.Course.create({
        id: newCourse.id,
        title: newCourse.title,
        courseCode: newCourse.courseCode,
        description: newCourse.description,
        teacherId: newCourse.teacherId,
        isPublished: newCourse.isPublished,
      }).catch((err: any) => console.warn("DynamoDB course write notice:", err));
    }

    return newCourse;
  },

  enrollStudent(courseId: string, studentIdentifier: string): boolean {
    const courses = this.getCourses();
    const courseIndex = courses.findIndex((c) => c.id === courseId);
    if (courseIndex === -1) return false;

    const course = courses[courseIndex];
    const isAlreadyEnrolled = course.enrolledStudents.includes(studentIdentifier);

    if (isAlreadyEnrolled) {
      // Drop course
      course.enrolledStudents = course.enrolledStudents.filter((id) => id !== studentIdentifier);
    } else {
      // Enroll
      course.enrolledStudents.push(studentIdentifier);
    }

    courses[courseIndex] = course;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    }

    // Attempt writing Enrollment to DynamoDB
    const client = getClient();
    if (client?.models?.Enrollment) {
      client.models.Enrollment.create({
        courseId,
        studentId: studentIdentifier,
        status: isAlreadyEnrolled ? "DROPPED" : "ACTIVE",
        enrolledAt: new Date().toISOString(),
      }).catch((err: any) => console.warn("DynamoDB enrollment notice:", err));
    }

    return !isAlreadyEnrolled;
  },

  // ---------------- ASSIGNMENTS ----------------
  getAssignments(): AssignmentData[] {
    if (typeof window === "undefined") return INITIAL_ASSIGNMENTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
        return INITIAL_ASSIGNMENTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  },

  createAssignment(assignment: Omit<AssignmentData, "id">): AssignmentData {
    const assignments = this.getAssignments();
    const newAssignment: AssignmentData = {
      ...assignment,
      id: `assign-${Date.now()}`,
    };

    const updated = [newAssignment, ...assignments];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(updated));
    }

    const client = getClient();
    if (client?.models?.Assignment) {
      client.models.Assignment.create({
        id: newAssignment.id,
        courseId: newAssignment.courseId,
        title: newAssignment.title,
        instructions: newAssignment.instructions,
        dueDate: newAssignment.dueDate,
        maxMarks: newAssignment.maxMarks,
        isPublished: newAssignment.isPublished,
      }).catch((err: any) => console.warn("DynamoDB assignment write notice:", err));
    }

    return newAssignment;
  },

  deleteAssignment(assignmentId: string): boolean {
    const assignments = this.getAssignments();
    const updated = assignments.filter((a) => a.id !== assignmentId);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(updated));
    }
    return true;
  },

  // ---------------- SUBMISSIONS ----------------
  getSubmissions(): SubmissionData[] {
    if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  },

  submitWork(submission: Omit<SubmissionData, "id" | "status" | "submissionDate">): SubmissionData {
    const submissions = this.getSubmissions();
    const newSubmission: SubmissionData = {
      ...submission,
      id: `sub-${Date.now()}`,
      status: "SUBMITTED",
      submissionDate: new Date().toISOString().split("T")[0],
    };

    const updated = [newSubmission, ...submissions];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));
    }

    const client = getClient();
    if (client?.models?.Submission) {
      client.models.Submission.create({
        id: newSubmission.id,
        assignmentId: newSubmission.assignmentId,
        studentId: newSubmission.studentId,
        submissionDate: new Date().toISOString(),
        status: "SUBMITTED",
      }).catch((err: any) => console.warn("DynamoDB submission write notice:", err));
    }

    return newSubmission;
  },

  gradeSubmission(submissionId: string, grade: number, feedback: string): boolean {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex((s) => s.id === submissionId);
    if (index === -1) return false;

    submissions[index].grade = grade;
    submissions[index].feedback = feedback;
    submissions[index].status = "GRADED";

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    }

    const client = getClient();
    if (client?.models?.Submission) {
      client.models.Submission.update({
        id: submissionId,
        marks: grade,
        feedback,
        status: "GRADED",
        gradedAt: new Date().toISOString(),
      }).catch((err: any) => console.warn("DynamoDB grade update notice:", err));
    }

    return true;
  },

  // ---------------- METRICS COMPUTATION ----------------
  getStudentMetrics(studentId: string) {
    const courses = this.getCourses();
    const assignments = this.getAssignments();
    const submissions = this.getSubmissions();

    const enrolledCourses = courses.filter((c) => c.enrolledStudents.includes(studentId));
    const studentSubmissions = submissions.filter((s) => s.studentId === studentId);
    const gradedSubmissions = studentSubmissions.filter((s) => s.status === "GRADED" && s.grade !== undefined);

    let totalScore = 0;
    let totalMax = 0;
    gradedSubmissions.forEach((s) => {
      const a = assignments.find((assign) => assign.id === s.assignmentId);
      if (a && s.grade !== undefined) {
        totalScore += s.grade;
        totalMax += a.maxMarks;
      }
    });

    const averageGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 92;

    return {
      enrolledCount: enrolledCourses.length,
      completedAssignments: studentSubmissions.length,
      pendingCount: Math.max(0, assignments.length - studentSubmissions.length),
      averageGrade,
      enrolledCourses,
    };
  },

  getTeacherMetrics(teacherId?: string) {
    const allCourses = this.getCourses();
    const assignments = this.getAssignments();
    const submissions = this.getSubmissions();

    // If teacherId provided, see if they teach specific courses
    const teacherOwned = teacherId 
      ? allCourses.filter((c) => c.teacherId === teacherId)
      : allCourses;

    // Use teacher owned courses if available; otherwise show all courses
    const courses = (teacherOwned && teacherOwned.length > 0) ? teacherOwned : allCourses;

    const courseIds = new Set(courses.map((c) => c.id));
    const courseCodes = new Set(courses.map((c) => c.courseCode));

    const courseAssignments = assignments.filter(
      (a) => courseIds.has(a.courseId) || courseCodes.has(a.courseCode)
    );
    const assignmentIds = new Set(courseAssignments.map((a) => a.id));

    const pendingReviewSubmissions = submissions.filter(
      (s) => s.status === "SUBMITTED" && assignmentIds.has(s.assignmentId)
    );

    // Total unique students across controlled courses
    const allStudents = new Set<string>();
    courses.forEach((c) => c.enrolledStudents.forEach((s) => allStudents.add(s)));

    return {
      totalStudentsCount: allStudents.size,
      activeCoursesCount: courses.filter((c) => c.isPublished).length,
      toGradeCount: pendingReviewSubmissions.length,
      pendingSubmissions: pendingReviewSubmissions,
      courses,
    };
  },

  // ---------------- COURSE DETAIL & STUDY MATERIALS ----------------
  getCourseById(courseId: string): CourseData | null {
    const courses = this.getCourses();
    return courses.find((c) => c.id === courseId || c.courseCode.toLowerCase() === courseId.toLowerCase()) || null;
  },

  getResources(courseId?: string): CourseResourceData[] {
    let resources = INITIAL_RESOURCES;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RESOURCES);
        resources = raw ? JSON.parse(raw) : INITIAL_RESOURCES;
      } catch {
        resources = INITIAL_RESOURCES;
      }
    }
    if (courseId) {
      const targetCourse = this.getCourseById(courseId);
      return resources.filter(
        (r) => r.courseId === courseId || (targetCourse && r.courseId === targetCourse.id)
      );
    }
    return resources;
  },

  addResource(resource: Omit<CourseResourceData, "id" | "uploadedAt">): CourseResourceData {
    const all = this.getResources();
    const newResource: CourseResourceData = {
      ...resource,
      id: `res-${Date.now()}`,
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newResource, ...all];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(updated));
    }

    const client = getClient();
    if (client?.models?.CourseResource) {
      client.models.CourseResource.create({
        id: newResource.id,
        courseId: newResource.courseId,
        title: newResource.title,
        description: newResource.description,
        s3Key: `course-resources/${newResource.fileName}`,
        originalFilename: newResource.fileName,
        contentType: "application/pdf",
        fileSize: 2048,
        uploaderId: "faculty",
      }).catch((err: any) => console.warn("DynamoDB resource write notice:", err));
    }

    return newResource;
  },

  deleteResource(resourceId: string): boolean {
    const all = this.getResources();
    const updated = all.filter((r) => r.id !== resourceId);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(updated));
    }
    return true;
  },
};
