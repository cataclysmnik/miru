import CourseHubClient from "./CourseHubClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseHubPage({ params }: PageProps) {
  const { id } = await params;
  return <CourseHubClient courseId={id} />;
}
