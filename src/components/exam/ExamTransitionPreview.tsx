"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ExamEntryScreen from "./ExamEntryScreen";
import ExamResultScreen from "./ExamResultScreen";
import { transitionBreakdown, type ExamOutcome } from "@/lib/exam-transition";
import type { ReviewResponse } from "@/lib/review-model";
import styles from "./ExamTransition.module.css";
const questions = Array.from({ length: 50 }, (_, i) => ({
  id: `sample-${i + 1}`,
  question_type: i === 9 ? "SHORT" : "MCQ",
  exam_options:
    i === 9
      ? []
      : [
          { id: "a", option_text: "A", is_correct: false },
          { id: "b", option_text: "B", is_correct: true },
        ],
}));
export default function ExamTransitionPreview() {
  const router = useRouter(),
    [screen, setScreen] = useState("start"),
    [deadline] = useState(() => Date.now() + 22 * 60_000 + 18_000);
  const answers: Record<string, ReviewResponse> = {};
  if (screen !== "empty")
    questions.forEach((question, i) => {
      if (i === 9) answers[question.id] = { short_answer: "My explanation" };
      else if (i < (screen === "excellent" ? 43 : 29))
        answers[question.id] = { option_id: "b" };
      else if (i < 40) answers[question.id] = { option_id: "a" };
    });
  const breakdown = transitionBreakdown(questions, answers),
    result: ExamOutcome = {
      score: breakdown.correct,
      total: 50,
      accuracy: Math.round((breakdown.correct / 50) * 100),
      pointsEarned: breakdown.correct * 2,
      statusType: screen === "auto" ? "AUTO_SUBMITTED" : "SUBMITTED",
      correctCount: breakdown.correct,
      wrongCount: breakdown.wrong,
      skippedCount: breakdown.skipped,
    };
  return (
    <>
      <div className={styles.previewTools}>
        <span>LOCAL PREVIEW • Sample data</span>
        <label style={{ color: "#8b641f" }}>
          Preview screen{" "}
          <select
            aria-label="Preview screen"
            value={screen}
            onChange={(event) => setScreen(event.target.value)}
            style={{
              background: "#fff9e9",
              color: "#8b641f",
              border: "1px solid #ead9b8",
              borderRadius: 4,
              padding: "2px 4px",
              fontSize: 10,
            }}
          >
            <option value="start">Before start</option>
            <option value="resume">Resume practice</option>
            <option value="result">Submitted result</option>
            <option value="excellent">Strong result</option>
            <option value="empty">All skipped</option>
            <option value="auto">Auto-submitted</option>
          </select>
        </label>
      </div>
      {screen === "start" || screen === "resume" ? (
        <ExamEntryScreen
          key={screen}
          preview
          title="IT TOOLS CHAPTER 1 TEST"
          durationMinutes={50}
          questionCount={50}
          totalPoints={100}
          maxWarnings={3}
          resuming={screen === "resume"}
          resumeDeadline={screen === "resume" ? deadline : undefined}
          onStart={() => setScreen("result")}
          onBack={() => router.push("/review-preview")}
        />
      ) : (
        <ExamResultScreen
          preview
          title="IT TOOLS CHAPTER 1 TEST"
          result={result}
          breakdown={breakdown}
          totalPoints={100}
          timeUsedSeconds={screen === "auto" ? 3000 : 2244}
          onReview={(filter) => router.push("/review-preview?filter=" + filter)}
          onBack={() => setScreen("start")}
        />
      )}
    </>
  );
}
