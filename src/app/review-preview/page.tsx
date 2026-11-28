import { notFound } from "next/navigation";
import ReviewLocalPreview from "@/components/review/ReviewLocalPreview";
import { reviewFilterFromSearch } from "@/lib/review-model";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Review interface — local preview",
  robots: { index: false, follow: false },
};
export default async function ReviewPreview({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { filter } = await searchParams;
  return (
    <ReviewLocalPreview
      initialFilter={reviewFilterFromSearch(
        "?filter=" + encodeURIComponent(filter || ""),
      )}
    />
  );
}
