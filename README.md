# miru LMS (AWS Amplify Gen 2)

## Overview
miru is a mindful, modern Learning Management System (LMS) built with Next.js, React, Tailwind CSS, and AWS Amplify Gen 2. It provides a peaceful platform for students and teachers to manage courses, assignments, submissions, and grades.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Backend**: AWS Amplify Gen 2 (Code-first approach)
- **Database**: Amazon DynamoDB (via AppSync)
- **Storage**: Amazon S3
- **Authentication**: Amazon Cognito

## Project Structure
- `/src/app`: Next.js application routes (Landing, Auth, Dashboard)
- `/src/components`: Reusable UI components (Sidebar, Cards, Inputs, Buttons)
- `/amplify`: Backend infrastructure as code (Data schema, Auth, Storage)

## Getting Started
See [AWS_SETUP.md](./AWS_SETUP.md) for detailed instructions on configuring your AWS profile, deploying the backend, and running the application locally.

## Features implemented:
- Fully responsive modern Dashboard UI
- Role-based data schema for Student and Teacher access
- Authentication UI flows
- Serverless backend configured in TypeScript
