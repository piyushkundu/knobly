"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Grid2X2,
  GraduationCap,
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import type { ExamLanguage } from "@/lib/exam-presentation";
import {
  correctReviewOption,
  formatPoints,
  readReviewNotes,
  reviewStatus,
  reviewSummary,
  reviewTime,
  reviewTopics,
  selectReviewQuestions,
  type ReviewData,
  type ReviewFilter,
  type ReviewNotes,
  type ReviewQuestion,
} from "@/lib/review-model";
import ReviewQuestionCard, { statusLabels } from "./ReviewQuestionCard";
import ReviewPractice from "./ReviewPractice";
import styles from "./ReviewWorkspace.module.css";

export interface ReviewWorkspaceProps {
  data: ReviewData;
  userId: string;
  saved: Set<string>;
  bookmarkLoading?: boolean;
  bookmarkScope?: "account" | "browser";
  bookmarkError?: string;
  onRetryBookmarks?: () => void;
  onBookmark: (id: string, saved: boolean) => Promise<void>;
  onExplain: (q: ReviewQuestion) => Promise<string>;
  preview?: boolean;
}
export default function ReviewWorkspace({
  data,
  userId,
  saved,
  bookmarkLoading = false,
  bookmarkScope = "account",
  bookmarkError = "",
  onRetryBookmarks,
  onBookmark,
  onExplain,
  preview = false,
}: ReviewWorkspaceProps) {
  const [filter, setFilter] = useState<ReviewFilter>("all"),
    [language, setLanguage] = useState<ExamLanguage>("both"),
    [saving, setSaving] = useState<Set<string>>(new Set()),
    [saveError, setSaveError] = useState("");
  const [notes, setNotes] = useState<ReviewNotes>({}),
    [notesError, setNotesError] = useState(""),
    [active, setActive] = useState(""),
    [practice, setPractice] = useState<ReviewQuestion[] | null>(null);
  const explanationCache = useRef(new Map<string, Promise<string>>());
  const filterBar = useRef<HTMLDivElement>(null);
  const navDialog = useRef<HTMLDialogElement>(null),
    lastPracticeTrigger = useRef<HTMLElement | null>(null);
  const stats = reviewSummary(data),
    rows = selectReviewQuestions(data, filter, saved),
    topics = reviewTopics(data),
    storageKey = `knobly:review-notes:v1:${userId}:${data.attempt.id}`;
  const counts: Record<ReviewFilter, number> = {
    all: data.questions.length,
    correct: stats.correct,
    wrong: stats.wrong,
    skipped: stats.skipped,
    manual: stats.manual,
    saved: data.questions.filter((q) => saved.has(q.id)).length,
  };
  const filters: ReviewFilter[] = [
    "all",
    "wrong",
    "skipped",
    "correct",
    "saved",
    ...(stats.manual ? ["manual" as const] : []),
  ];
  useEffect(() => {
    try {
      setNotes(readReviewNotes(localStorage, storageKey));
    } catch {
      setNotesError(
        "Private notes are unavailable because browser storage is disabled.",
      );
    }
  }, [storageKey]);
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const edge =
        (filterBar.current?.getBoundingClientRect().bottom || 150) + 20;
      const visible = Array.from(
        document.querySelectorAll("[data-review-question]"),
      ).find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.bottom > edge && rect.top < innerHeight;
      });
      if (visible)
        setActive(visible.getAttribute("data-review-question") || "");
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [filter, data]);
  function updateNote(id: string, value: string) {
    const next = { ...notes };
    if (value) next[id] = value;
    else delete next[id];
    setNotes(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setNotesError("");
    } catch {
      setNotesError(
        "Your note could not be saved in this browser. Keep a copy before leaving.",
      );
    }
  }
  async function bookmark(id: string) {
    if (saving.has(id) || bookmarkLoading) return;
    setSaving((current) => new Set(current).add(id));
    setSaveError("");
    try {
      await onBookmark(id, !saved.has(id));
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "This question could not be saved. Please try again.",
      );
    } finally {
      setSaving((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }
  function explain(question: ReviewQuestion) {
    let pending = explanationCache.current.get(question.id);
    if (!pending) {
      pending = onExplain(question).catch((error) => {
        explanationCache.current.delete(question.id);
        throw error;
      });
      explanationCache.current.set(question.id, pending);
    }
    return pending;
  }
  function jump(id: string) {
    setFilter("all");
    navDialog.current?.close();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = document.getElementById(`review-${id}`);
        target?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "start",
        });
        target?.querySelector("h2")?.setAttribute("tabindex", "-1");
        target?.querySelector("h2")?.focus({ preventScroll: true });
        setActive(id);
      }),
    );
  }
  function startPractice(kind: "wrong" | "skipped", trigger: HTMLElement) {
    const questions = data.questions.filter(
      (q) =>
        reviewStatus(q, data.responses[q.id]) === kind &&
        q.question_type.toUpperCase() !== "SHORT" &&
        correctReviewOption(q),
    );
    lastPracticeTrigger.current = trigger;
    setPractice(questions);
  }
  function closePractice() {
    setPractice(null);
    lastPracticeTrigger.current?.focus();
  }
  const navigator = (
    <>
      <div className={styles.sectionHeading}>
        <div className={styles.titleIcon}>
          <Grid2X2 size={20} />
        </div>
        <div>
          <h2>Question navigator</h2>
          <p>Jump to any question</p>
        </div>
      </div>
      <div className={styles.navigator}>
        {data.questions.map((q, i) => {
          const status = reviewStatus(q, data.responses[q.id]),
            number = q.originalNumber ?? i + 1;
          return (
            <button
              key={q.id}
              className={`${styles.navNumber} ${styles[status]} ${active === q.id ? styles.activeNumber : ""}`}
              aria-label={`Question ${number}, ${statusLabels[status]}${saved.has(q.id) ? ", saved" : ""}`}
              aria-current={active === q.id ? "location" : undefined}
              onClick={() => jump(q.id)}
            >
              {number}
              {saved.has(q.id) && <Bookmark size={9} />}
            </button>
          );
        })}
      </div>
      <div className={styles.legend}>
        {(["correct", "wrong", "skipped", "manual"] as const)
          .filter((key) => stats[key] > 0)
          .map((key) => (
            <span key={key}>
              <i className={styles[key]} />
              {statusLabels[key]}
            </span>
          ))}
      </div>
      {data.missing > 0 && (
        <p className={styles.small}>
          {data.missing} original question(s) are no longer available.
        </p>
      )}
    </>
  );
  const segments = [
    ["correct", stats.correct],
    ["wrong", stats.wrong],
    ["skipped", stats.skipped],
    ["manual", stats.manual],
    ["missing", stats.missing],
  ] as const;
  let cumulative = 0;
  const colors = {
    correct: "#19a98a",
    wrong: "#eb7781",
    skipped: "#c7cede",
    manual: "#efb75e",
    missing: "#596078",
  };
  const gradient = segments
    .map(([name, value]) => {
      const start = cumulative;
      cumulative += stats.total ? (value / stats.total) * 100 : 0;
      return `${colors[name]} ${start}% ${cumulative}%`;
    })
    .join(",");
  const practiceEligible = (kind: "wrong" | "skipped") =>
    data.questions.some(
      (q) =>
        reviewStatus(q, data.responses[q.id]) === kind &&
        q.question_type.toUpperCase() !== "SHORT" &&
        correctReviewOption(q),
    );
  return (
    <main className={styles.page}>
      {preview && (
        <div className={styles.preview}>
          LOCAL PREVIEW • Sample result • No exam score is saved
        </div>
      )}
      <header className={styles.topbar}>
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className={styles.back}
        >
          <ArrowLeft size={20} />
        </Link>
        <span className={styles.brand}>
          K<span>.</span>
        </span>
        <div className={styles.topTitle}>
          <span className={styles.eyebrow}>
            Knobly • your learning continues
          </span>
          <h1>Test review</h1>
          <p>{data.test.title}</p>
        </div>
        <span className={styles.completed}>
          <Check size={14} />
          Completed
        </span>
        <Link href="/dashboard" className={styles.headerLink}>
          Dashboard
          <ArrowRight size={16} />
        </Link>
      </header>
      <div className={styles.container}>
        <section className={styles.summary} aria-label="Test result summary">
          <div className={styles.summaryLead}>
            <span className={styles.eyebrow}>
              Reflect. Understand. Improve.
            </span>
            <h2>
              Every answer is a<br />
              step forward.
            </h2>
            <p>
              Your test is complete. Let’s turn this result into your next
              improvement.
            </p>
            <div className={styles.time}>
              <Clock3 size={15} />
              {reviewTime(data.attempt)}
              <span>•</span>
              {data.test.duration_minutes} min paper
            </div>
          </div>
          <div className={styles.score}>
            <span className={styles.small}>
              {stats.recorded
                ? "Recorded exam points"
                : "Calculated test points"}
            </span>
            <strong>
              {formatPoints(stats.earned)}
              <small> / {formatPoints(stats.totalPoints)}</small>
            </strong>
            <p>
              {stats.recorded
                ? "Your original result"
                : "Based on available test details"}
            </p>
            <div className={styles.accuracy}>
              <Target size={17} />
              <b>{stats.accuracy === null ? "—" : `${stats.accuracy}%`}</b>
              Answer accuracy
            </div>
            <span className={styles.small}>
              {stats.correct} correct / {stats.correct + stats.wrong} checked
              answers
            </span>
          </div>
          <div className={styles.distribution}>
            <div
              className={styles.donut}
              style={{ background: `conic-gradient(${gradient})` }}
              role="img"
              aria-label={`${stats.correct} correct, ${stats.wrong} incorrect, ${stats.skipped} skipped, ${stats.manual} needing review, ${stats.missing} unavailable`}
            >
              <div>
                <b>{stats.total}</b>
                <span>QUESTIONS</span>
              </div>
            </div>
            <div className={styles.summaryLegend}>
              {segments
                .filter(([, count]) => count > 0)
                .map(([key, count]) => (
                  <span key={key}>
                    <i style={{ background: colors[key] }} />
                    {key === "missing" ? "Unavailable" : statusLabels[key]}
                    <b>{count}</b>
                  </span>
                ))}
            </div>
          </div>
        </section>
        {stats.analysisChanged && (
          <p className={styles.notice}>
            Your recorded points are preserved. The breakdown uses the question
            details available today, which may differ from the original test.
          </p>
        )}
        {!stats.recorded && (
          <p className={styles.notice}>
            This older attempt has no recorded points field. The points shown
            are calculated from the available test details.
          </p>
        )}
        <section className={styles.nextSteps}>
          <div className={styles.titleIcon}>
            <GraduationCap size={23} />
          </div>
          <div>
            <h2>Your next step starts here</h2>
            <p>
              Understand your mistakes, then give those questions another try.
            </p>
          </div>
          <div className={styles.actionGroup}>
            <button
              className={styles.primary}
              disabled={!practiceEligible("wrong")}
              onClick={(event) => startPractice("wrong", event.currentTarget)}
            >
              <RotateCcw size={16} />
              Practise incorrect ({stats.wrong})
            </button>
            <button
              className={styles.secondary}
              disabled={!practiceEligible("skipped")}
              onClick={(event) => startPractice("skipped", event.currentTarget)}
            >
              Try skipped ({stats.skipped})<ArrowRight size={16} />
            </button>
          </div>
        </section>
        <div className={styles.layout}>
          <section
            className={styles.reviewList}
            aria-label="Detailed answer review"
          >
            <div ref={filterBar} className={styles.filterBar}>
              <div className={styles.filterHeading}>
                <h2>Detailed answer review</h2>
                <div className={styles.reviewControls}>
                  <label>
                    Question language
                    <select
                      value={language}
                      onChange={(event) =>
                        setLanguage(event.target.value as ExamLanguage)
                      }
                    >
                      <option value="both">Hindi + English</option>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </label>
                  <button
                    className={styles.mobileNav}
                    onClick={() => navDialog.current?.showModal()}
                  >
                    <Grid2X2 size={17} />
                    Questions
                  </button>
                </div>
              </div>
              <div
                className={styles.filters}
                role="group"
                aria-label="Filter questions"
              >
                {filters.map((key) => (
                  <button
                    key={key}
                    className={filter === key ? styles.selectedFilter : ""}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {key === "all"
                      ? "All"
                      : key === "saved"
                        ? "Saved"
                        : statusLabels[key]}
                    <span>{counts[key]}</span>
                  </button>
                ))}
              </div>
              <p className={styles.small}>
                {rows.length} question{rows.length === 1 ? "" : "s"} shown •
                Original test numbering
              </p>
            </div>
            {bookmarkScope === "browser" && (
              <p className={styles.notice}>
                Saved questions are stored only in this browser, alongside your
                local exam bookmarks.
              </p>
            )}
            {(bookmarkError || saveError) && (
              <p className={styles.notice} role="alert">
                {saveError || bookmarkError}
                {bookmarkError && onRetryBookmarks && (
                  <button onClick={onRetryBookmarks}>
                    Retry saved questions
                  </button>
                )}
              </p>
            )}
            {notesError && (
              <p className={styles.error} role="alert">
                {notesError}
              </p>
            )}
            {rows.length ? (
              rows.map(({ question, index, status }) => (
                <ReviewQuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  status={status}
                  response={data.responses[question.id]}
                  points={stats.perQuestion}
                  language={language}
                  saved={saved.has(question.id)}
                  saving={bookmarkLoading || saving.has(question.id)}
                  onBookmark={() => bookmark(question.id)}
                  note={notes[question.id] || ""}
                  onNote={(value) => updateNote(question.id, value)}
                  onExplain={explain}
                />
              ))
            ) : (
              <div className={styles.empty}>
                <Bookmark size={28} />
                <h3>
                  {filter === "saved"
                    ? "Your revision collection starts here"
                    : "No questions in this filter"}
                </h3>
                <p>
                  {filter === "saved"
                    ? "Save a question using its bookmark button to find it here."
                    : "Choose another filter to continue your review."}
                </p>
                <button
                  className={styles.secondary}
                  onClick={() => setFilter("all")}
                >
                  Show all questions
                </button>
              </div>
            )}
          </section>
          <aside className={styles.sidebar}>
            <section className={styles.navCard}>{navigator}</section>
            <section className={styles.topicCard}>
              <div className={styles.sectionHeading}>
                <div className={styles.titleIcon}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2>Where to focus</h2>
                  <p>Based on this test</p>
                </div>
              </div>
              {topics.map((topic) => (
                <div className={styles.topic} key={topic.topic}>
                  <strong>{topic.topic}</strong>
                  <p>
                    {topic.wrong} incorrect · {topic.skipped} skipped ·{" "}
                    {topic.correct} correct
                    {topic.manual > 0 ? ` · ${topic.manual} to review` : ""}
                  </p>
                  <div className={styles.topicTrack}>
                    <span
                      style={{
                        width: `${(topic.correct / topic.ids.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className={styles.topicActions}>
                    <button
                      onClick={() =>
                        jump(
                          topic.ids.find(
                            (id) =>
                              reviewStatus(
                                data.questions.find((q) => q.id === id)!,
                                data.responses[id],
                              ) === "wrong",
                          ) || topic.ids[0],
                        )
                      }
                    >
                      Review questions
                      <ChevronRight size={14} />
                    </button>
                    <Link href={topic.href}>
                      {topic.href === "/dashboard"
                        ? "Find a course"
                        : "Revise lesson"}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
              {topics.some((topic) => topic.topic === "Other questions") && (
                <p className={styles.small}>
                  Questions without a chapter label are grouped together.
                </p>
              )}
            </section>
            <div className={styles.studyTip}>
              <Check size={18} />
              <p>
                Revision practice is separate from your exam. Your recorded
                result stays unchanged.
              </p>
            </div>
          </aside>
        </div>
        <footer className={styles.pageFooter}>
          <span>Knobly • Keep learning. Keep improving.</span>
          <Link href="/dashboard">
            Back to dashboard
            <ArrowRight size={16} />
          </Link>
        </footer>
      </div>
      <dialog
        ref={navDialog}
        className={`${styles.dialog} ${styles.navDrawer}`}
        aria-label="Question navigator"
      >
        <header>
          <h2>Jump to a question</h2>
          <button
            aria-label="Close question navigator"
            onClick={() => navDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        {navigator}
      </dialog>
      {practice && (
        <ReviewPractice questions={practice} onClose={closePractice} />
      )}
    </main>
  );
}
