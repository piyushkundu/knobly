"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { loadCompletedReview } from "@/lib/review-loader";
import {
  correctReviewOption,
  reviewFilterFromSearch,
  type ReviewData,
  type ReviewQuestion,
} from "@/lib/review-model";
import {
  loadReviewBookmarks,
  saveReviewBookmark,
  type ReviewBookmarkScope,
} from "@/lib/review-bookmarks";
import ReviewWorkspace from "@/components/review/ReviewWorkspace";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>(),
    { user, loading } = useAuth();
  if (loading) return <ReviewMessage text="Loading your account…" busy />;
  if (!user) return <ReviewMessage text="Sign in to view your test review." />;
  return (
    <CompletedReview key={`${user.uid}:${id}`} attemptId={id} user={user} />
  );
}
function ReviewMessage({
  text,
  busy = false,
  retry,
}: {
  text: string;
  busy?: boolean;
  retry?: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
        gap: 18,
        textAlign: "center",
        padding: 30,
        background: "#f5f6fc",
        color: "#53506b",
      }}
    >
      {busy && (
        <Loader2
          aria-label="Loading"
          style={{ margin: "auto", animation: "spin 1s linear infinite" }}
        />
      )}
      <p role={busy ? "status" : "alert"}>{text}</p>
      {retry && <button onClick={retry}>Try again</button>}
      <Link href="/dashboard">Back to dashboard</Link>
    </main>
  );
}
function CompletedReview({
  attemptId,
  user,
}: {
  attemptId: string;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const [data, setData] = useState<ReviewData | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set()),
    [bookmarkScope, setBookmarkScope] =
      useState<ReviewBookmarkScope>("account"),
    [bookmarkLoading, setBookmarkLoading] = useState(true),
    [bookmarkError, setBookmarkError] = useState(""),
    [bookmarkRetry, setBookmarkRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    loadCompletedReview(db, user.uid, attemptId)
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch((error) => {
        if (!cancelled)
          setError(
            error instanceof Error
              ? error.message
              : "The review could not be loaded.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid, attemptId, retry]);
  useEffect(() => {
    let cancelled = false;
    loadReviewBookmarks(user)
      .then((value) => {
        if (!cancelled) {
          setSaved(new Set(value.bookmarks));
          setBookmarkScope(value.scope);
        }
      })
      .catch((error) => {
        if (!cancelled)
          setBookmarkError(
            error instanceof Error
              ? error.message
              : "Saved questions could not be loaded.",
          );
      })
      .finally(() => {
        if (!cancelled) setBookmarkLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, bookmarkRetry]);
  async function bookmark(questionId: string, isSaved: boolean) {
    await saveReviewBookmark(user, questionId, isSaved, bookmarkScope);
    setSaved((current) => {
      const next = new Set(current);
      if (isSaved) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
  }
  async function explain(question: ReviewQuestion) {
    const response = await fetch("/api/ai/explain-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: question.question_text,
        options: question.exam_options.map((option) => option.option_text),
        correct_option: correctReviewOption(question)?.option_text,
        user_answer:
          question.exam_options.find(
            (option) => option.id === data?.responses[question.id]?.option_id,
          )?.option_text ||
          data?.responses[question.id]?.short_answer ||
          "Skipped",
        language: "English",
      }),
      signal: AbortSignal.timeout(25000),
    });
    const result = await response.json();
    if (
      !response.ok ||
      typeof result.explanation !== "string" ||
      !result.explanation.trim()
    )
      throw Error(
        "The explanation is unavailable right now. Please try again.",
      );
    return result.explanation as string;
  }
  if (error)
    return (
      <ReviewMessage
        text={error}
        retry={() => {
          setError("");
          setData(null);
          setRetry((value) => value + 1);
        }}
      />
    );
  if (!data) return <ReviewMessage text="Preparing your answer review…" busy />;
  return (
    <ReviewWorkspace
      data={data}
      initialFilter={
        typeof window === "undefined"
          ? "all"
          : reviewFilterFromSearch(window.location.search)
      }
      userId={user.uid}
      saved={saved}
      bookmarkLoading={bookmarkLoading}
      bookmarkScope={bookmarkScope}
      bookmarkError={bookmarkError}
      onRetryBookmarks={() => {
        setBookmarkError("");
        setBookmarkLoading(true);
        setBookmarkRetry((value) => value + 1);
      }}
      onBookmark={bookmark}
      onExplain={explain}
    />
  );
}
