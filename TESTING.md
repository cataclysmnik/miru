# Testing Methodology

## 1. Automated Testing (Vitest + React Testing Library)
We use `vitest` and `@testing-library/react` to ensure the integrity of individual UI components and their states.

Run tests using:
```bash
npm run test
```

### Components Tested
- **UI Components:** Button variants, rendering behavior, conditional states.
- **Form validation:** The underlying login and signup components are handled strictly by `@aws-amplify/ui-react` which guarantees security best practices out of the box.

## 2. Manual Testing Plan

Since certain operations involve AWS Cognito and AppSync database permissions, manual end-to-end tests are conducted using the sandbox UI.

### Test Cases

**1. Authentication:**
- [x] Register as a new student. Verify the email confirmation works.
- [x] Login with valid credentials.
- [x] Validate unauthorized routing (logging out should restrict dashboard access).

**2. Role-Based Access (Authorization):**
- [x] Ensure newly registered accounts can only view courses where they are enrolled.
- [x] Elevate a test user to `TEACHER` using the AWS Console.
- [x] Verify the teacher can view all submissions for their courses.
- [x] Verify the student receives "Access Denied" if attempting to update a grade (simulated by AppSync `.authorization` rules in `amplify/data/resource.ts`).

**3. S3 Storage Permissions:**
- [x] Student can upload to `submissions/*`.
- [x] Student can only read their own identity-prefixed objects.
- [x] Teacher can read `submissions/*` and modify `course-resources/*`.
