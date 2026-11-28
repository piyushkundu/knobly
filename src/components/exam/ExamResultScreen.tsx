"use client";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flag,
  GraduationCap,
  Minus,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import {
  examClock,
  resultMessage,
  type ExamOutcome,
  type transitionBreakdown,
} from "@/lib/exam-transition";
import { formatPoints, type ReviewFilter } from "@/lib/review-model";
import styles from "./ExamTransition.module.css";
export interface ExamResultProps {
  title: string;
  result: ExamOutcome;
  breakdown: ReturnType<typeof transitionBreakdown>;
  totalPoints: number;
  timeUsedSeconds: number;
  preview?: boolean;
  onReview: (filter: ReviewFilter) => void;
  onBack: () => void;
  reviewAvailable?: boolean;
}
export default function ExamResultScreen({
  title,
  result,
  breakdown,
  totalPoints,
  timeUsedSeconds,
  preview = false,
  onReview,
  onBack,
  reviewAvailable = true,
}: ExamResultProps) {
  const message = resultMessage(result.accuracy, breakdown.answered),
    automatic = result.statusType === "AUTO_SUBMITTED";
  const segments = [
    {
      key: "correct",
      name: "Correct",
      count: breakdown.correct,
      color: "#24ac8c",
      icon: Check,
    },
    {
      key: "wrong",
      name: "Incorrect",
      count: breakdown.wrong,
      color: "#e77b89",
      icon: X,
    },
    {
      key: "skipped",
      name: "Skipped",
      count: breakdown.skipped,
      color: "#c1c9da",
      icon: Minus,
    },
    ...(breakdown.manual
      ? [
          {
            key: "manual",
            name: "Needs review",
            count: breakdown.manual,
            color: "#e5b56b",
            icon: Flag,
          },
        ]
      : []),
  ];
  let end = 0;
  const gradient = segments
    .map((segment) => {
      const start = end;
      end += breakdown.total ? (segment.count / breakdown.total) * 100 : 0;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(",");
  return (
    <section
      className={`${styles.screen} ${styles.resultScreen} ${preview ? styles.previewScreen : ""}`}
      aria-labelledby="exam-result-title"
      onClick={(event) => event.stopPropagation()}
    >
      {preview && (
        <div className={styles.preview}>
          LOCAL PREVIEW • Sample result • No exam score is saved
        </div>
      )}
      <header className={styles.header}>
        <span className={styles.brand}>
          K<span>.</span>
        </span>
        <div>
          <strong>KNOBLY</strong>
          <span>YOUR LEARNING CONTINUES</span>
        </div>
        <span className={styles.headerBadge}>
          <Check size={15} />
          Test completed
        </span>
        <button className={styles.dashboardLink} onClick={onBack}>
          Dashboard
          <ArrowRight size={16} />
        </button>
      </header>
      <div className={styles.resultLayout}>
        <div className={styles.resultHero}>
          <span className={styles.successSeal}>
            <Check size={29} />
          </span>
          <span className={styles.eyebrow}>
            {automatic
              ? "Automatically submitted"
              : "Test submitted successfully"}
          </span>
          <h1 id="exam-result-title">{message.title}</h1>
          <p>{message.description}</p>
          <span className={styles.testPill}>
            <BookOpen size={14} />
            {title}
          </span>
        </div>
        {automatic && (
          <p className={styles.autoNotice}>
            <ShieldCheck size={17} />
            Your test ended automatically when time ran out or the warning limit
            was reached. Review your saved answers below.
          </p>
        )}
        <section className={styles.resultCard} aria-label="Your test result">
          <div className={styles.resultScore}>
            <div
              className={styles.resultRing}
              style={{
                background: `conic-gradient(${gradient || "#e7e9f2 0% 100%"})`,
              }}
              role="img"
              aria-label={`${breakdown.correct} correct, ${breakdown.wrong} incorrect, ${breakdown.skipped} skipped, ${breakdown.manual} needing review`}
            >
              <div>
                <strong>
                  {result.accuracy}
                  <small>%</small>
                </strong>
                <span>TEST SCORE</span>
              </div>
            </div>
            <p>
              {result.correctCount} correct / {result.total} questions
            </p>
            <span className={styles.small}>
              Test score = correct answers ÷ all questions
            </span>
          </div>
          <div className={styles.resultDetails}>
            <div className={styles.resultMetric}>
              <div>
                <span className={styles.metricIcon}>
                  <GraduationCap size={20} />
                </span>
                <span className={styles.small}>Points scored</span>
              </div>
              <strong>
                {formatPoints(result.pointsEarned)}
                <small> / {formatPoints(totalPoints)}</small>
              </strong>
              <p>Your points for this test, not your account total.</p>
            </div>
            <div className={styles.miniMetrics}>
              <div>
                <span>
                  <Target size={15} />
                  Answer accuracy
                </span>
                <strong>
                  {breakdown.answerAccuracy === null
                    ? "—"
                    : `${breakdown.answerAccuracy}%`}
                </strong>
                <small>
                  {breakdown.correct} correct / {breakdown.checked} checked
                  answers
                </small>
              </div>
              <div>
                <span>
                  <Clock3 size={15} />
                  Time used
                </span>
                <strong>{examClock(timeUsedSeconds)}</strong>
                <small>Minutes : seconds</small>
              </div>
              <div>
                <span>
                  <Check size={15} />
                  Answered
                </span>
                <strong>
                  {breakdown.answered}
                  <small> / {breakdown.total}</small>
                </strong>
                <small>{breakdown.skipped} left unanswered</small>
              </div>
            </div>
          </div>
          <div className={styles.resultBreakdown}>
            {segments.map(({ key, name, count, icon: Icon }) => (
              <div key={key} className={styles[key]}>
                <Icon size={16} />
                <strong>{count}</strong>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </section>
        {breakdown.manual > 0 && (
          <p className={styles.manualNotice}>
            Written answers and questions without a usable answer key need
            review. They are excluded from answer accuracy; your recorded exam
            score stays unchanged.
          </p>
        )}
        <section className={styles.resultNext}>
          <div className={styles.nextHeading}>
            <span>
              <GraduationCap size={23} />
            </span>
            <div>
              <span className={styles.eyebrow}>Make this attempt count</span>
              <h2>Turn your result into your next improvement.</h2>
              <p>
                Your full review includes correct answers, explanations and
                separate revision practice.
              </p>
            </div>
          </div>
          <div className={styles.resultActions}>
            <button
              className={styles.startButton}
              disabled={!reviewAvailable}
              onClick={() => onReview("all")}
            >
              <BarChart3 size={18} />
              Open full analysis
              <ArrowRight size={17} />
            </button>
            <button className={styles.secondaryButton} onClick={onBack}>
              Back to dashboard
            </button>
          </div>
          <div className={styles.revisionLinks}>
            {breakdown.wrong > 0 && (
              <button
                disabled={!reviewAvailable}
                onClick={() => onReview("wrong")}
              >
                <span className={styles.wrong}>
                  <X size={15} />
                </span>
                Review incorrect answers ({breakdown.wrong})
                <ChevronRight size={16} />
              </button>
            )}
            {breakdown.skipped > 0 && (
              <button
                disabled={!reviewAvailable}
                onClick={() => onReview("skipped")}
              >
                <span className={styles.skipped}>
                  <Minus size={15} />
                </span>
                Explore skipped questions ({breakdown.skipped})
                <ChevronRight size={16} />
              </button>
            )}
            {breakdown.manual > 0 && (
              <button
                disabled={!reviewAvailable}
                onClick={() => onReview("manual")}
              >
                <Flag size={15} />
                Review written answers ({breakdown.manual})
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </section>
        <p className={styles.resultFoot}>
          <ShieldCheck size={14} />
          Revising a question does not change your recorded test result.
        </p>
      </div>
    </section>
  );
}
