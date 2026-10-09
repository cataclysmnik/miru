# Screenshot Checklist for Project Demonstration

Please use this checklist to capture the required screenshots for the academic project report.

- [ ] **1. Local project setup:** Screenshot of the terminal showing `npm run dev` and `npx ampx sandbox` running successfully.
  > *Caption: Initializing the local Next.js development server and Amplify Gen 2 sandbox.*
- [ ] **2. AWS configuration:** Screenshot of the AWS Console showing the deployed Amplify App or Cognito User Pool.
  > *Caption: Amazon Cognito User Pool provisioned via Amplify Gen 2.*
- [ ] **3. Authentication:** Screenshot of the `/login` or `/register` page with the BrightPath UI.
  > *Caption: Secure user authentication interface using Amplify UI components.*
- [ ] **4. Course creation:** Screenshot of the teacher dashboard showing the course list and "Create Course" modal.
  > *Caption: Role-based access allowing teachers to manage their courses.*
- [ ] **5. S3 resource upload:** Screenshot of the AWS S3 console or the UI showing a course file being uploaded.
  > *Caption: Secure, authenticated file uploads to Amazon S3.*
- [ ] **6. Assignment creation:** Screenshot of an assignment form being filled out by a teacher.
  > *Caption: Creating a new assignment mapped to a specific course in DynamoDB.*
- [ ] **7. Student submission:** Screenshot of a student account uploading an assignment submission.
  > *Caption: Student securely submitting a file for grading.*
- [ ] **8. Backend database records:** Screenshot of the DynamoDB console showing `Course` or `Submission` tables with data.
  > *Caption: Verifying data persistence in Amazon DynamoDB.*
- [ ] **9. Grading:** Screenshot of a teacher viewing a student's submission and entering a grade.
  > *Caption: Grading interface demonstrating cross-entity relationships.*
- [ ] **10. Analytics:** Screenshot of the main student/teacher dashboard showing homework progress and charts.
  > *Caption: Visualizing assignment completion and course data.*
- [ ] **11. Final deployed interface:** Screenshot of the deployed web application accessed via an `amplifyapp.com` URL.
  > *Caption: The fully deployed production application hosted on AWS Amplify.*
- [ ] **12. Unauthorized-access test results:** Screenshot showing an error or "Access Denied" message when a student tries to access teacher controls.
  > *Caption: Validating secure backend authorization rules preventing unauthorized access.*
