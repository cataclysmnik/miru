import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "miru_courses_db.json");

interface LmsData {
  courses: any[];
  assignments: any[];
  submissions: any[];
  resources: any[];
}

function readData(): LmsData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading miru_courses_db.json:", err);
  }
  return { courses: [], assignments: [], submissions: [], resources: [] };
}

function writeData(data: LmsData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing miru_courses_db.json:", err);
  }
}

export async function GET() {
  const data = readData();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const data = readData();

    switch (action) {
      case "CREATE_COURSE": {
        const { course } = body;
        if (!course || !course.title || !course.courseCode) {
          return NextResponse.json({ success: false, error: "Course title and code required." }, { status: 400 });
        }
        // Check if ID already exists, otherwise add to front
        const existingIdx = data.courses.findIndex((c) => c.id === course.id);
        if (existingIdx !== -1) {
          data.courses[existingIdx] = course;
        } else {
          data.courses.unshift(course);
        }
        writeData(data);
        return NextResponse.json({ success: true, course });
      }

      case "CREATE_ASSIGNMENT": {
        const { assignment } = body;
        if (!assignment || !assignment.title || !assignment.courseId) {
          return NextResponse.json({ success: false, error: "Assignment title and course required." }, { status: 400 });
        }
        const existingIdx = data.assignments.findIndex((a) => a.id === assignment.id);
        if (existingIdx !== -1) {
          data.assignments[existingIdx] = assignment;
        } else {
          data.assignments.unshift(assignment);
        }
        writeData(data);
        return NextResponse.json({ success: true, assignment });
      }

      case "DELETE_ASSIGNMENT": {
        const { assignmentId } = body;
        data.assignments = data.assignments.filter((a) => a.id !== assignmentId);
        writeData(data);
        return NextResponse.json({ success: true });
      }

      case "ENROLL_STUDENT": {
        const { courseId, studentIdentifier } = body;
        const course = data.courses.find((c) => c.id === courseId);
        if (course) {
          if (!course.enrolledStudents) course.enrolledStudents = [];
          const idx = course.enrolledStudents.indexOf(studentIdentifier);
          if (idx === -1) {
            course.enrolledStudents.push(studentIdentifier);
          } else {
            course.enrolledStudents.splice(idx, 1);
          }
          writeData(data);
          return NextResponse.json({ success: true, enrolled: idx === -1 });
        }
        return NextResponse.json({ success: false, error: "Course not found." }, { status: 404 });
      }

      case "SUBMIT_WORK": {
        const { submission } = body;
        if (!submission || !submission.assignmentId) {
          return NextResponse.json({ success: false, error: "Invalid submission data." }, { status: 400 });
        }
        const existingIdx = data.submissions.findIndex((s) => s.id === submission.id);
        if (existingIdx !== -1) {
          data.submissions[existingIdx] = submission;
        } else {
          data.submissions.unshift(submission);
        }
        writeData(data);
        return NextResponse.json({ success: true, submission });
      }

      case "GRADE_SUBMISSION": {
        const { submissionId, grade, feedback, teacherId, teacherName } = body;
        const sub = data.submissions.find((s) => s.id === submissionId);
        if (!sub) {
          return NextResponse.json({ success: false, error: "Submission not found." }, { status: 404 });
        }

        // Verify teacher ownership of the course
        const assign = data.assignments.find((a) => a.id === sub.assignmentId);
        if (assign) {
          const course = data.courses.find((c) => c.id === assign.courseId || c.courseCode === assign.courseCode);
          if (course && teacherId) {
            const isOwner = 
              course.teacherId?.toLowerCase() === teacherId.toLowerCase() ||
              (teacherId === "58291" && course.teacherId === "faculty-1") ||
              (teacherName && course.teacherName && teacherName.toLowerCase() === course.teacherName.toLowerCase());
            
            if (!isOwner) {
              return NextResponse.json({ 
                success: false, 
                error: `Unauthorized: Only the assigned instructor (${course.teacherName}) can grade this course's assignments.` 
              }, { status: 403 });
            }
          }
        }

        sub.status = "GRADED";
        sub.grade = grade;
        sub.feedback = feedback;
        writeData(data);
        return NextResponse.json({ success: true, submission: sub });
      }

      case "ADD_RESOURCE": {
        const { resource } = body;
        if (!resource || !resource.title || !resource.courseId) {
          return NextResponse.json({ success: false, error: "Resource title and course required." }, { status: 400 });
        }
        data.resources.unshift(resource);
        writeData(data);
        return NextResponse.json({ success: true, resource });
      }

      case "DELETE_RESOURCE": {
        const { resourceId } = body;
        data.resources = data.resources.filter((r) => r.id !== resourceId);
        writeData(data);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
