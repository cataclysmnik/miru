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
  fileUrl?: string;
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
  fileUrl?: string;
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

const STORAGE_KEY_COURSES = "miru_data_courses_v3";
const STORAGE_KEY_ASSIGNMENTS = "miru_data_assignments_v3";
const STORAGE_KEY_SUBMISSIONS = "miru_data_submissions_v3";
const STORAGE_KEY_RESOURCES = "miru_data_resources_v3";

const INITIAL_RESOURCES: CourseResourceData[] = [
  {
    id: "res-cloud-1",
    courseId: "course-cloud-arch",
    title: "AWS Well-Architected Framework: Reliability Pillar",
    description: "In-depth guide to multi-region disaster recovery, fault isolation, and auto-scaling architectures.",
    fileName: "well_architected_reliability.pdf",
    fileType: "Architecture Guide",
    fileSize: "4.2 MB",
    uploadedAt: "2026-10-01",
  },
  {
    id: "res-swe-1",
    courseId: "course-swe",
    title: "Clean Code & Agile Engineering Handbook",
    description: "SOLID principles, test-driven development, and microservice boundary decomposition.",
    fileName: "clean_software_engineering_handbook.pdf",
    fileType: "Study Guide",
    fileSize: "3.5 MB",
    uploadedAt: "2026-10-02",
  },
  {
    id: "res-robot-1",
    courseId: "course-robot-prog",
    title: "ROS2 Galactic Robotics Systems Architecture",
    description: "Robotics middleware, URDF modeling, Gazebo physics simulation, and transform trees.",
    fileName: "ros2_robot_programming_guide.pdf",
    fileType: "Lecture Slides",
    fileSize: "5.1 MB",
    uploadedAt: "2026-10-03",
  },
  {
    id: "res-ai-1",
    courseId: "course-ai",
    title: "Modern Artificial Intelligence Foundations",
    description: "Comprehensive syllabus on state-space search, Bayesian inference, and neural networks.",
    fileName: "ai_foundations_notes.pdf",
    fileType: "Lecture Notes",
    fileSize: "6.8 MB",
    uploadedAt: "2026-10-02",
  },
  {
    id: "res-drones-1",
    courseId: "course-autonomous-drones",
    title: "Autonomous UAV Flight Dynamics & Control",
    description: "State estimation, Kalman filtering, optical flow sensors, and trajectory generation.",
    fileName: "uav_flight_dynamics_notes.pdf",
    fileType: "Lecture Notes",
    fileSize: "4.6 MB",
    uploadedAt: "2026-10-04",
  },
  {
    id: "res-daa-1",
    courseId: "course-daa",
    title: "Algorithm Design Paradigms & Complexity Cheatsheet",
    description: "Proof templates for greedy choice properties and dynamic programming state transitions.",
    fileName: "daa_paradigms_cheatsheet.pdf",
    fileType: "Study Guide",
    fileSize: "2.8 MB",
    uploadedAt: "2026-10-03",
  },
  {
    id: "res-dsa-1",
    courseId: "course-dsa",
    title: "Advanced Data Structures Reference Manual",
    description: "B-Trees, Trie indices, Disjoint Set Union, and Fibonacci Heap operations with proofs.",
    fileName: "dsa_advanced_reference.pdf",
    fileType: "Study Guide",
    fileSize: "3.9 MB",
    uploadedAt: "2026-10-01",
  },
  {
    id: "res-physics-1",
    courseId: "course-eng-physics",
    title: "Engineering Physics: Quantum & Wave Optics",
    description: "Schrödinger wave equations, laser cavity resonators, and fiber optic attenuation physics.",
    fileName: "engineering_physics_vol1.pdf",
    fileType: "Lecture Slides",
    fileSize: "5.4 MB",
    uploadedAt: "2026-10-01",
  },
  {
    id: "res-chem-1",
    courseId: "course-eng-chemistry",
    title: "Engineering Chemistry: Electrochemistry & Materials",
    description: "Battery cells, corrosion mitigation, polymer composites, and green fuel cell chemistry.",
    fileName: "engineering_chemistry_notes.pdf",
    fileType: "Lecture Notes",
    fileSize: "4.1 MB",
    uploadedAt: "2026-10-02",
  },
  {
    id: "res-cvla-1",
    courseId: "course-cvla",
    title: "Linear Algebra & Complex Analysis Comprehensive Guide",
    description: "Orthogonal projections, Cauchy-Riemann equations, residue calculus, and Fourier transforms.",
    fileName: "cvla_mathematical_foundations.pdf",
    fileType: "Study Guide",
    fileSize: "4.9 MB",
    uploadedAt: "2026-10-03",
  },
  {
    id: "res-discrete-1",
    courseId: "course-discrete-math",
    title: "Discrete Mathematical Structures & Proof Systems",
    description: "Boolean algebra, graph traversal theorems, combinatorial counting, and pigeonhole applications.",
    fileName: "discrete_math_proofs.pdf",
    fileType: "Lecture Notes",
    fileSize: "3.3 MB",
    uploadedAt: "2026-10-02",
  },
];

// Default starter dataset
const INITIAL_COURSES: CourseData[] = [
  {
    id: "course-cloud-arch",
    title: "Cloud Architecture Design",
    courseCode: "CSE4001",
    description: "Design resilient, scalable, distributed multi-cloud and serverless architectures with automated infrastructure.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1242", "sagniksinghaishere@gmail.com", "24BRS1004"],
  },
  {
    id: "course-swe",
    title: "Software Engineering",
    courseCode: "CSE3001",
    description: "Software development lifecycles, agile ceremonies, design patterns, microservices, and CI/CD pipelines.",
    teacherId: "98765",
    teacherName: "Prof. Sarah Lee",
    isPublished: true,
    enrolledStudents: ["24BRS1242", "sagniksinghaishere@gmail.com", "24BRS1120"],
  },
  {
    id: "course-robot-prog",
    title: "Robot Programming",
    courseCode: "ROB3002",
    description: "Kinematics, ROS2 frameworks, motion planning, actuator control, and real-time robotic systems programming.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1055"],
  },
  {
    id: "course-ai",
    title: "Artificial Intelligence",
    courseCode: "CSE3002",
    description: "Heuristic search, probabilistic graphical models, reinforcement learning, and deep neural network representations.",
    teacherId: "98765",
    teacherName: "Prof. Sarah Lee",
    isPublished: true,
    enrolledStudents: ["24BRS1004", "24BRS1089"],
  },
  {
    id: "course-autonomous-drones",
    title: "Autonomous Drones",
    courseCode: "AER4003",
    description: "UAV aerodynamics, computer vision for obstacle avoidance, sensor fusion (IMU/GPS/LiDAR), and autonomous navigation.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1089", "24BRS1120"],
  },
  {
    id: "course-daa",
    title: "Design and Analysis of Algorithms",
    courseCode: "CSE2002",
    description: "Divide and conquer, greedy strategies, dynamic programming, network flow, NP-completeness, and asymptotic analysis.",
    teacherId: "98765",
    teacherName: "Prof. Sarah Lee",
    isPublished: true,
    enrolledStudents: ["24BRS1120", "24BRS1055"],
  },
  {
    id: "course-dsa",
    title: "Data Structures and Algorithms",
    courseCode: "CSE2001",
    description: "Linear and hierarchical data structures: balanced search trees, heaps, hash maps, graphs, and amortized complexity.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1242", "sagniksinghaishere@gmail.com", "24BRS1004"],
  },
  {
    id: "course-eng-physics",
    title: "Engineering Physics",
    courseCode: "PHY1001",
    description: "Electromagnetic theory, quantum wave equations, optics, laser physics, and solid-state materials science.",
    teacherId: "98765",
    teacherName: "Prof. Sarah Lee",
    isPublished: true,
    enrolledStudents: ["24BRS1089"],
  },
  {
    id: "course-eng-chemistry",
    title: "Engineering Chemistry",
    courseCode: "CHY1001",
    description: "Thermodynamics, electrochemical energy storage, molecular spectroscopy, corrosion engineering, and polymers.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1120"],
  },
  {
    id: "course-cvla",
    title: "Complex Variables and Linear Algebra",
    courseCode: "MAT2001",
    description: "Vector spaces, eigenvalues and eigenvectors, singular value decomposition, conformal mapping, and contour integration.",
    teacherId: "98765",
    teacherName: "Prof. Sarah Lee",
    isPublished: true,
    enrolledStudents: ["24BRS1004"],
  },
  {
    id: "course-discrete-math",
    title: "Discrete Mathematics",
    courseCode: "MAT1002",
    description: "Propositional and predicate logic, set theory, combinatorics, recurrence relations, and graph theory proofs.",
    teacherId: "58291",
    teacherName: "Prof. Kenneth Mori",
    isPublished: true,
    enrolledStudents: ["24BRS1055"],
  },
];

const INITIAL_ASSIGNMENTS: AssignmentData[] = [
  {
    id: "assign-cloud-1",
    courseId: "course-cloud-arch",
    courseCode: "CSE4001",
    title: "High-Availability Multi-Region VPC Architecture",
    instructions: "Design a resilient AWS architecture spanning 2 regions with Route 53 latency routing and DynamoDB global tables.",
    dueDate: "2026-10-25",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-swe-1",
    courseId: "course-swe",
    courseCode: "CSE3001",
    title: "Clean Architecture & Domain-Driven Design Spec",
    instructions: "Draft the software architecture document for a modular e-commerce engine using DDD aggregate roots and event sourcing.",
    dueDate: "2026-10-28",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-robot-1",
    courseId: "course-robot-prog",
    courseCode: "ROB3002",
    title: "ROS2 Node Kinematic Inverse Solver",
    instructions: "Implement a 6-DOF robotic arm inverse kinematics solver utilizing Python and ROS2 Humble publishers.",
    dueDate: "2026-11-04",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-ai-1",
    courseId: "course-ai",
    courseCode: "CSE3002",
    title: "A* Pathfinding & Minimax Game Theory Agent",
    instructions: "Build an adversarial search agent with alpha-beta pruning and an admissible heuristic distance metric.",
    dueDate: "2026-11-02",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-drones-1",
    courseId: "course-autonomous-drones",
    courseCode: "AER4003",
    title: "Quadcopter PID Flight Controller Simulation",
    instructions: "Tune roll, pitch, and yaw PID loops for a quadrotor drone under 15 m/s turbulent wind gust vectors.",
    dueDate: "2026-11-10",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-daa-1",
    courseId: "course-daa",
    courseCode: "CSE2002",
    title: "Dynamic Programming: Knapsack & Longest Common Subsequence",
    instructions: "Analyze recurrence relations, prove optimal substructure, and construct space-optimized bottom-up tables.",
    dueDate: "2026-10-30",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-dsa-1",
    courseId: "course-dsa",
    courseCode: "CSE2001",
    title: "Self-Balancing Red-Black Tree Implementation",
    instructions: "Implement left/right tree rotations, recoloring rules, and verify logarithmic height invariants.",
    dueDate: "2026-10-22",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-physics-1",
    courseId: "course-eng-physics",
    courseCode: "PHY1001",
    title: "Maxwell's Equations & Waveguide Boundary Solutions",
    instructions: "Derive TE and TM modes for rectangular electromagnetic waveguides with conducting boundary conditions.",
    dueDate: "2026-11-08",
    maxMarks: 50,
    isPublished: true,
  },
  {
    id: "assign-chemistry-1",
    courseId: "course-eng-chemistry",
    courseCode: "CHY1001",
    title: "Lithium-Ion Battery Electrochemical Kinetics",
    instructions: "Calculate Nernst potential drifts and electrode degradation curves under cyclic thermal load stress.",
    dueDate: "2026-11-06",
    maxMarks: 50,
    isPublished: true,
  },
  {
    id: "assign-cvla-1",
    courseId: "course-cvla",
    courseCode: "MAT2001",
    title: "Singular Value Decomposition & Image Compression",
    instructions: "Compute low-rank matrix approximations using SVD and prove orthogonality of singular vector bases.",
    dueDate: "2026-10-26",
    maxMarks: 100,
    isPublished: true,
  },
  {
    id: "assign-discrete-1",
    courseId: "course-discrete-math",
    courseCode: "MAT1002",
    title: "Eulerian & Hamiltonian Graph Characterization Proofs",
    instructions: "Construct mathematical induction proofs for planar graph four-color theorem corollaries and isomorphism tests.",
    dueDate: "2026-10-24",
    maxMarks: 100,
    isPublished: true,
  },
];

const INITIAL_SUBMISSIONS: SubmissionData[] = [
  {
    id: "sub-cloud-1",
    assignmentId: "assign-cloud-1",
    studentId: "24BRS1242",
    studentName: "Sagnik Singha",
    submissionDate: "2026-10-09",
    fileName: "cloud_architecture_vpc_solution.zip",
    notes: "Includes Terraform IaC scripts and architectural diagram.",
    status: "GRADED",
    grade: 98,
    feedback: "Outstanding architectural layout with excellent multi-AZ redundancy and security groups.",
  },
  {
    id: "sub-dsa-1",
    assignmentId: "assign-dsa-1",
    studentId: "24BRS1242",
    studentName: "Sagnik Singha",
    submissionDate: "2026-10-08",
    fileName: "red_black_tree_src.zip",
    notes: "Full TypeScript test harness verifying rotation invariants.",
    status: "SUBMITTED",
  },
];

let hasInitializedSync = false;

export const DataService = {
  // ---------------- SERVER DATABASE SYNC ----------------
  async syncWithServer(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          const { courses, assignments, submissions, resources } = json.data;
          if (courses) localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
          if (assignments) localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
          if (submissions) localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
          if (resources) localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
        }
      }
    } catch (err) {
      console.warn("DataService sync notice:", err);
    }
  },

  // ---------------- COURSES ----------------
  getCourses(): CourseData[] {
    if (typeof window === "undefined") return INITIAL_COURSES;
    if (!hasInitializedSync) {
      hasInitializedSync = true;
      this.syncWithServer().catch(() => {});
    }
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

    // Persist to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_COURSE", course: newCourse }),
    }).catch((err) => console.warn("Failed to persist course to server:", err));

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
      course.enrolledStudents = course.enrolledStudents.filter((id) => id !== studentIdentifier);
    } else {
      course.enrolledStudents.push(studentIdentifier);
    }

    courses[courseIndex] = course;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    }

    // Persist enrollment to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ENROLL_STUDENT", courseId, studentIdentifier }),
    }).catch((err) => console.warn("Failed to persist enrollment to server:", err));

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

    // Persist to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_ASSIGNMENT", assignment: newAssignment }),
    }).catch((err) => console.warn("Failed to persist assignment to server:", err));

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

    // Persist delete to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_ASSIGNMENT", assignmentId }),
    }).catch((err) => console.warn("Failed to persist assignment delete to server:", err));

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

    // Persist to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SUBMIT_WORK", submission: newSubmission }),
    }).catch((err) => console.warn("Failed to persist submission to server:", err));

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

  gradeSubmission(
    submissionId: string, 
    grade: number, 
    feedback: string, 
    teacherId?: string, 
    teacherName?: string
  ): boolean {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex((s) => s.id === submissionId);
    if (index === -1) return false;

    // Verify course ownership if teacher identity provided
    const sub = submissions[index];
    const assignments = this.getAssignments();
    const assign = assignments.find((a) => a.id === sub.assignmentId);
    if (assign && teacherId) {
      const courses = this.getCourses();
      const course = courses.find((c) => c.id === assign.courseId || c.courseCode === assign.courseCode);
      if (course) {
        const isOwner = 
          course.teacherId?.toLowerCase() === teacherId.toLowerCase() ||
          (teacherId === "58291" && course.teacherId === "faculty-1") ||
          (teacherName && course.teacherName && teacherName.toLowerCase() === course.teacherName.toLowerCase());
        
        if (!isOwner) {
          console.warn("Unauthorized grade attempt by non-course teacher:", teacherId, course.teacherId);
          return false;
        }
      }
    }

    submissions[index].grade = grade;
    submissions[index].feedback = feedback;
    submissions[index].status = "GRADED";

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    }

    // Persist grade to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: "GRADE_SUBMISSION", 
        submissionId, 
        grade, 
        feedback,
        teacherId,
        teacherName
      }),
    }).catch((err) => console.warn("Failed to persist grade to server:", err));

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
  getStudentMetrics(studentId: string, studentEmail?: string) {
    const courses = this.getCourses();
    const allAssignments = this.getAssignments();
    const submissions = this.getSubmissions();

    const enrolledCourses = courses.filter((c) =>
      c.enrolledStudents.some((id) =>
        id.toLowerCase() === studentId.toLowerCase() ||
        (studentEmail && id.toLowerCase() === studentEmail.toLowerCase())
      )
    );

    const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id));
    const enrolledCourseCodes = new Set(enrolledCourses.map((c) => c.courseCode.toLowerCase()));

    const enrolledAssignments = allAssignments.filter(
      (a) => enrolledCourseIds.has(a.courseId) || enrolledCourseCodes.has(a.courseCode.toLowerCase())
    );

    const studentSubmissions = submissions.filter((s) =>
      s.studentId.toLowerCase() === studentId.toLowerCase() ||
      (studentEmail && s.studentId.toLowerCase() === studentEmail.toLowerCase())
    );
    const gradedSubmissions = studentSubmissions.filter((s) => s.status === "GRADED" && s.grade !== undefined);

    let totalScore = 0;
    let totalMax = 0;
    gradedSubmissions.forEach((s) => {
      const a = enrolledAssignments.find((assign) => assign.id === s.assignmentId);
      if (a && s.grade !== undefined) {
        totalScore += s.grade;
        totalMax += a.maxMarks;
      }
    });

    const averageGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 92;

    return {
      enrolledCount: enrolledCourses.length,
      completedAssignments: studentSubmissions.length,
      pendingCount: Math.max(0, enrolledAssignments.length - studentSubmissions.length),
      averageGrade,
      enrolledCourses,
      enrolledAssignments,
    };
  },

  getTeacherMetrics(teacherId?: string, teacherName?: string) {
    const allCourses = this.getCourses();
    const assignments = this.getAssignments();
    const submissions = this.getSubmissions();

    // If teacherId provided, strictly filter to courses they own
    const teacherOwned = teacherId 
      ? allCourses.filter((c) => 
          c.teacherId?.toLowerCase() === teacherId.toLowerCase() ||
          (teacherId === "58291" && c.teacherId === "faculty-1") ||
          (teacherName && c.teacherName && teacherName.toLowerCase() === c.teacherName.toLowerCase())
        )
      : allCourses;

    // Strict courses: DO NOT fall back to other teachers' courses
    const courses = teacherId ? teacherOwned : allCourses;

    const courseIds = new Set(courses.map((c) => c.id));
    const courseCodes = new Set(courses.map((c) => c.courseCode.toLowerCase()));

    const courseAssignments = assignments.filter(
      (a) => courseIds.has(a.courseId) || courseCodes.has(a.courseCode.toLowerCase())
    );
    const assignmentIds = new Set(courseAssignments.map((a) => a.id));

    // Only submissions for assignments belonging to the teacher's controlled courses!
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

    // Persist to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_RESOURCE", resource: newResource }),
    }).catch((err) => console.warn("Failed to persist resource to server:", err));

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

    // Persist to server JSON database
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_RESOURCE", resourceId }),
    }).catch((err) => console.warn("Failed to persist resource delete to server:", err));

    return true;
  },
};
