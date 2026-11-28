"use client";
import { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Lightbulb,
  Loader2,
  NotebookPen,
  Sparkles,
  X,
} from "lucide-react";
import ExamText from "@/components/exam/ExamText";
import type { ExamLanguage } from "@/lib/exam-presentation";
import {
  correctReviewOption,
  formatPoints,
  type ReviewQuestion,
  type ReviewResponse,
  type ReviewStatus,
} from "@/lib/review-model";
import styles from "./ReviewWorkspace.module.css";

export const statusLabels: Record<ReviewStatus, string> = {
  correct: "Correct",
  wrong: "Incorrect",
  skipped: "Skipped",
  manual: "Needs review",
};
export default function ReviewQuestionCard({
  question,
  index,
  status,
  response,
  points,
  language,
  saved,
  saving,
  onBookmark,
  note,
  onNote,
  onExplain,
}: {
  question: ReviewQuestion;
  index: number;
  status: ReviewStatus;
  response?: ReviewResponse;
  points: number;
  language: ExamLanguage;
  saved: boolean;
  saving: boolean;
  onBookmark: () => void;
  note: string;
  onNote: (value: string) => void;
  onExplain: (q: ReviewQuestion) => Promise<string>;
}) {
  const [showNote, setShowNote] = useState(false),
    [explanation, setExplanation] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = correctReviewOption(question),
    warmBoot = key && /warm\s*boot/i.test(key.option_text);
  async function explain() {
    if (busy || explanation) return;
    setBusy(true);
    setError("");
    try {
      setExplanation(await onExplain(question));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The explanation could not be loaded.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article
      id={`review-${question.id}`}
      data-review-question={question.id}
      className={styles.question}
      aria-labelledby={`heading-${question.id}`}
    >
      <header className={styles.questionHeader}>
        <div className={styles.questionNumber}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div>
          <span className={styles.small}>Question {index + 1}</span>
          <div className={styles.meta}>
            {question.chapter && <span>{question.chapter}</span>}
            {question.difficulty && <span>{question.difficulty}</span>}
            <span>{formatPoints(points)} points</span>
          </div>
        </div>
        <span className={`${styles.status} ${styles[status]}`}>
          {status === "correct" ? (
            <Check size={14} />
          ) : status === "wrong" ? (
            <X size={14} />
          ) : null}
          {statusLabels[status]}
        </span>
        <button
          className={`${styles.iconButton} ${saved ? styles.saved : ""}`}
          disabled={saving}
          aria-label={
            saved ? "Remove saved question" : "Save question for revision"
          }
          aria-pressed={saved}
          onClick={onBookmark}
        >
          {saving ? (
            <Loader2 className={styles.spin} size={18} />
          ) : (
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          )}
        </button>
      </header>
      <div className={styles.questionBody}>
        <h2 id={`heading-${question.id}`}>
          <ExamText text={question.question_text} language={language} />
        </h2>
        {question.exam_options.length > 0 ? (
          <div className={styles.options}>
            {question.exam_options.map((option, i) => {
              const selected = response?.option_id === option.id,
                correct = key?.id === option.id;
              return (
                <div
                  key={option.id}
                  className={`${styles.option} ${correct ? styles.correct : selected ? (status === "manual" ? styles.manual : styles.wrong) : ""}`}
                >
                  <span className={styles.letter}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <ExamText text={option.option_text} language={language} />
                  <div className={styles.optionBadges}>
                    {selected && (
                      <span className={styles.optionBadge}>
                        {correct ? (
                          <Check size={14} />
                        ) : status === "wrong" ? (
                          <X size={14} />
                        ) : null}
                        Your answer
                      </span>
                    )}
                    {correct && (
                      <span className={styles.optionBadge}>
                        <Check size={14} />
                        Correct answer
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.written}>
            <span className={styles.small}>Your written answer</span>
            <p className={styles.prewrap}>
              {response?.short_answer?.trim() || "No answer was submitted."}
            </p>
            {status === "manual" && (
              <p className={styles.muted}>
                This answer needs a teacher’s review. It is not counted as an
                incorrect objective answer here.
              </p>
            )}
          </div>
        )}
        {status === "skipped" && (
          <p className={styles.muted}>
            You did not answer this question in the test.
          </p>
        )}
        {status === "manual" && question.exam_options.length > 0 && (
          <p className={styles.notice}>
            This question cannot be checked automatically with the available
            answer key.
          </p>
        )}
        <details
          className={styles.details}
          open={status === "wrong" || undefined}
        >
          <summary>
            <Lightbulb size={18} />
            <strong>Understand the answer</strong>
            <ChevronDown size={16} />
          </summary>
          <div className={styles.explanation}>
            {question.explanation ? (
              <>
                <span className={styles.small}>Lesson explanation</span>
                <p className={styles.prewrap}>{question.explanation}</p>
              </>
            ) : (
              <p className={styles.muted}>
                A lesson explanation has not been added for this question yet.
              </p>
            )}
            {warmBoot && (
              <div
                className={styles.diagram}
                aria-label="Warm boot: a running computer is restarted without switching off its power"
              >
                <span>Computer is running</span>
                <b>→</b>
                <span>Restart</span>
                <b>→</b>
                <span>Starts again</span>
                <small>
                  Warm boot • the computer restarts without a power-off cycle.
                </small>
              </div>
            )}
            {explanation && (
              <div className={styles.aiText}>
                <span className={styles.small}>
                  AI study explanation • check against your lesson
                </span>
                <p className={styles.prewrap}>{explanation}</p>
              </div>
            )}
            {key && !explanation && (
              <button
                className={styles.secondary}
                onClick={explain}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className={styles.spin} size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                {busy
                  ? "Preparing explanation…"
                  : error
                    ? "Retry explanation"
                    : "Explain with AI"}
              </button>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </div>
        </details>
        <div className={styles.cardTools}>
          <button
            className={styles.textButton}
            onClick={() => setShowNote((value) => !value)}
            aria-expanded={showNote}
          >
            <NotebookPen size={16} />
            {note ? "My note" : "Add a personal note"}
            {note && <span className={styles.noteDot} />}
          </button>
          <span className={styles.small}>
            Learn it. Remember it. Try again.
          </span>
        </div>
        {showNote && (
          <div className={styles.note}>
            <label htmlFor={`note-${question.id}`}>My revision note</label>
            <textarea
              id={`note-${question.id}`}
              maxLength={1200}
              value={note}
              onChange={(event) => onNote(event.target.value)}
              placeholder="Write a reminder in your own words…"
            />
            <div className={styles.meta}>
              <span>Private • saved only in this browser</span>
              <span>{note.length}/1200</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
