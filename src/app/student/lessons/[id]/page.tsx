import { requireUser } from "@/lib/auth";
import LessonRoom from "@/components/LessonRoom";

export default async function StudentLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  return <LessonRoom lessonId={id} user={user} />;
}
