# AWS Configuration & Deployment Setup

If you are starting completely from scratch (no AWS account), follow these steps sequentially to set up your environment, connect your project, and deploy the application.

## 1. Create an AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com/) and click **Create an AWS Account**.
2. Follow the sign-up process (you will need a credit card, but the Free Tier covers most development usage).
3. Once created, sign in to the **AWS Management Console** as the Root user.

## 2. Generate Access Keys (IAM)
You need to generate credentials so your local computer can communicate with AWS.
1. In the AWS Console search bar at the top, search for **IAM** and select it.
2. On the left sidebar, click **Users** -> **Create user**.
3. Name the user (e.g., `miru-admin`) and click Next.
4. On the permissions page, select **Attach policies directly**.
5. Search for and check the box next to **AdministratorAccess** (this gives full permissions, which is easiest for development). Click Next, then **Create user**.
6. Click on the user you just created (`miru-admin`).
7. Go to the **Security credentials** tab.
8. Scroll down to **Access keys** and click **Create access key**.
9. Select **Command Line Interface (CLI)**, check the confirmation box, and click Next -> Create access key.
10. **IMPORTANT:** Keep the browser tab open or download the `.csv` file. You will need the **Access key ID** and **Secret access key** for the next step.

## 3. Configure Your Local Environment
Now, link your local machine to the AWS account.
1. Open a new terminal in your project directory (`D:\Repos\miru`).
2. Run the Amplify configuration command:
   ```bash
   npx ampx configure profile
   ```
3. The prompt will ask you for credentials. Provide the **Access Key ID** and **Secret Access Key** from the previous step.
4. For region, enter the one closest to you (e.g., `us-east-1` or `eu-west-1`).
5. For output format, enter `json`.
6. Name the profile `default` (or just press enter if it defaults to it).

## 4. Deploy the Local Backend (Sandbox)
Amplify Gen 2 uses a "sandbox" to provision temporary cloud resources (like Cognito for auth and DynamoDB for data) tied directly to your local development server.

1. Open a terminal in your project and run:
   ```bash
   npx ampx sandbox
   ```
2. **Wait for it to finish.** This command will talk to AWS, create the necessary backend resources in the cloud, and generate a file called `amplify_outputs.json` in your project root. **Do not close this terminal while developing.**
3. Once it says the deployment is complete, start your Next.js frontend in a *separate* terminal:
   ```bash
   npm run dev
   ```
4. Your local app is now fully connected to real AWS cloud resources!

## 5. Production Deployment (AWS Amplify Hosting)
When you are ready to publish the app to a live URL (e.g., `https://main.xxxxxx.amplifyapp.com`):
1. Commit all your code and push it to a GitHub repository.
2. Go to the **AWS Console** in your browser and search for **AWS Amplify**.
3. Click **Create new app**.
4. Choose **GitHub**, authorize it, and select your `miru` repository and the `main` branch.
5. Amplify Gen 2 will automatically detect your framework (Next.js) and backend configuration.
6. Click **Save and deploy**. AWS will build both the frontend and backend in the cloud and give you a live URL.

## 6. Resource Cleanup
If you want to stop working and delete the cloud resources to avoid any charges:
- For local development, run `npx ampx sandbox delete` in your terminal.
- For production, go to the AWS Amplify console, select your app, click **Actions**, and hit **Delete app**.
