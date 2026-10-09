import { Suspense } from "react";
import CourseHubClient from "./CourseHubClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CourseHubContent({ params }: PageProps) {
  const { id } = await params;
  return <CourseHubClient courseId={id} />;
}

export default function CourseHubPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading course hub...</p>
      </div>
    }>
      <CourseHubContent params={params} />
    </Suspense>
  );
}
