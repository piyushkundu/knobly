import { notFound } from "next/navigation";
import ReviewLocalPreview from "@/components/review/ReviewLocalPreview";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Review interface — local preview",
  robots: { index: false, follow: false },
};
export default function ReviewPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ReviewLocalPreview />;
}
