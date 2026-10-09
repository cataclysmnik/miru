import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'lmsFiles',
  access: (allow) => ({
    'course-resources/*': [
      allow.groups(['TEACHER']).to(['read', 'write', 'delete']),
      allow.groups(['STUDENT']).to(['read']),
    ],
    'submissions/*': [
      allow.groups(['TEACHER']).to(['read']),
      allow.entity('identity').to(['read', 'write']),
    ]
  })
});
