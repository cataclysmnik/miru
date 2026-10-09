import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a.model({
    id: a.id().required(),
    cognitoId: a.string().required(),
    displayName: a.string().required(),
    email: a.string().required(),
    role: a.enum(['STUDENT', 'TEACHER']),
  }).authorization(allow => [
    allow.owner(),
    allow.groups(['TEACHER']).to(['read']),
  ]),

  Course: a.model({
    id: a.id().required(),
    title: a.string().required(),
    description: a.string(),
    courseCode: a.string().required(),
    teacherId: a.string().required(),
    isPublished: a.boolean().default(false),
    enrollments: a.hasMany('Enrollment', 'courseId'),
    assignments: a.hasMany('Assignment', 'courseId'),
    resources: a.hasMany('CourseResource', 'courseId'),
  }).authorization(allow => [
    allow.groups(['TEACHER']),
    allow.groups(['STUDENT']).to(['read']),
  ]),

  Enrollment: a.model({
    id: a.id().required(),
    courseId: a.id().required(),
    studentId: a.string().required(),
    status: a.enum(['ACTIVE', 'DROPPED']),
    enrolledAt: a.datetime().required(),
    course: a.belongsTo('Course', 'courseId'),
  }).authorization(allow => [
    allow.groups(['TEACHER']),
    allow.groups(['STUDENT']).to(['read']),
  ]),

  CourseResource: a.model({
    id: a.id().required(),
    courseId: a.id().required(),
    title: a.string().required(),
    description: a.string(),
    s3Key: a.string().required(),
    originalFilename: a.string().required(),
    contentType: a.string().required(),
    fileSize: a.integer().required(),
    uploaderId: a.string().required(),
    course: a.belongsTo('Course', 'courseId'),
  }).authorization(allow => [
    allow.groups(['TEACHER']),
    allow.groups(['STUDENT']).to(['read']),
  ]),

  Assignment: a.model({
    id: a.id().required(),
    courseId: a.id().required(),
    title: a.string().required(),
    instructions: a.string().required(),
    dueDate: a.datetime().required(),
    maxMarks: a.integer().required(),
    isPublished: a.boolean().default(false),
    allowedFileTypes: a.string().array(),
    maxUploadSize: a.integer(),
    course: a.belongsTo('Course', 'courseId'),
    submissions: a.hasMany('Submission', 'assignmentId'),
  }).authorization(allow => [
    allow.groups(['TEACHER']),
    allow.groups(['STUDENT']).to(['read']),
  ]),

  Submission: a.model({
    id: a.id().required(),
    assignmentId: a.id().required(),
    studentId: a.string().required(),
    s3Key: a.string(),
    originalFilename: a.string(),
    submissionDate: a.datetime(),
    status: a.enum(['NOT_SUBMITTED', 'SUBMITTED', 'LATE', 'GRADED']),
    marks: a.integer(),
    feedback: a.string(),
    graderId: a.string(),
    gradedAt: a.datetime(),
    assignment: a.belongsTo('Assignment', 'assignmentId'),
  }).authorization(allow => [
    allow.owner().to(['create', 'read', 'update']),
    allow.groups(['TEACHER']),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
