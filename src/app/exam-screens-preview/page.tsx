import { notFound } from "next/navigation";
import ExamTransitionPreview from "@/components/exam/ExamTransitionPreview";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Exam start and result — local preview",
  robots: { index: false, follow: false },
};
export default function PreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ExamTransitionPreview />;
}
