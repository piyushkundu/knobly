"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import ExamText from "@/components/exam/ExamText";
import { correctReviewOption, type ReviewQuestion } from "@/lib/review-model";
import styles from "./ReviewWorkspace.module.css";

export default function ReviewPractice({
  questions,
  onClose,
}: {
  questions: ReviewQuestion[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0),
    [selected, setSelected] = useState(""),
    [checked, setChecked] = useState(false),
    [score, setScore] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const question = questions[index],
    key = question && correctReviewOption(question);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      onCancel={onClose}
      aria-labelledby="revision-title"
    >
      <header>
        <div>
          <span className={styles.eyebrow}>A fresh chance to learn</span>
          <h2 id="revision-title">Revision practice</h2>
        </div>
        <button aria-label="Close revision practice" onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      <p className={styles.notice}>
        Practice only. Your original test result and exam points stay unchanged.
      </p>
      {!question ? (
        <div className={styles.practiceResult}>
          <span className={styles.resultIcon}>
            <Check />
          </span>
          <h2>
            {score} / {questions.length} correct
          </h2>
          <p>
            You have finished this revision. Revisit the explanations for
            anything you are still unsure about.
          </p>
          <button
            className={styles.primary}
            onClick={() => {
              setIndex(0);
              setScore(0);
              setSelected("");
              setChecked(false);
            }}
          >
            <RotateCcw size={16} />
            Try again
          </button>
          <button onClick={onClose}>Back to review</button>
        </div>
      ) : (
        <>
          <p className={styles.muted}>
            Question {index + 1} of {questions.length}
          </p>
          <h3>
            <ExamText text={question.question_text} />
          </h3>
          <div className={styles.options}>
            {question.exam_options.map((option, i) => (
              <button
                key={option.id}
                className={`${styles.option} ${selected === option.id ? styles.chosen : ""} ${checked && key?.id === option.id ? styles.correct : ""} ${checked && selected === option.id && key?.id !== option.id ? styles.wrong : ""}`}
                disabled={checked}
                aria-pressed={selected === option.id}
                onClick={() => setSelected(option.id)}
              >
                <span className={styles.letter}>
                  {String.fromCharCode(65 + i)}
                </span>
                <ExamText text={option.option_text} />
                {checked && key?.id === option.id && (
                  <span className={styles.optionBadge}>
                    <Check size={14} />
                    Correct answer
                  </span>
                )}
              </button>
            ))}
          </div>
          {checked && (
            <div className={styles.explanation} role="status">
              <strong>
                {selected === key?.id
                  ? "That is correct."
                  : "Review the correct answer highlighted above."}
              </strong>
              {question.explanation && (
                <p className={styles.prewrap}>{question.explanation}</p>
              )}
            </div>
          )}
          <footer>
            {!checked ? (
              <button
                className={styles.primary}
                disabled={!selected}
                onClick={() => {
                  setChecked(true);
                  if (selected === key?.id) setScore((value) => value + 1);
                }}
              >
                Check answer
              </button>
            ) : (
              <button
                className={styles.primary}
                onClick={() => {
                  setIndex((value) => value + 1);
                  setSelected("");
                  setChecked(false);
                }}
              >
                {index + 1 === questions.length
                  ? "See practice result"
                  : "Next question"}
                <ArrowRight size={16} />
              </button>
            )}
          </footer>
        </>
      )}
    </dialog>
  );
}
