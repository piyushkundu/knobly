import {
  reviewStatus,
  type ReviewQuestion,
  type ReviewResponse,
} from "./review-model";
export interface ExamOutcome {
  score: number;
  total: number;
  accuracy: number;
  pointsEarned: number;
  statusType: string;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
}
export type TransitionQuestion = Pick<
  ReviewQuestion,
  "id" | "question_type"
> & { question_text?: string; exam_options?: ReviewQuestion["exam_options"] };
export function transitionBreakdown(
  questions: TransitionQuestion[],
  answers: Record<string, ReviewResponse>,
) {
  const counts = { correct: 0, wrong: 0, skipped: 0, manual: 0 };
  for (const question of questions)
    counts[
      reviewStatus(
        {
          ...question,
          question_text: question.question_text || "",
          exam_options: question.exam_options || [],
        },
        answers[question.id],
      )
    ]++;
  const checked = counts.correct + counts.wrong;
  return {
    ...counts,
    answered: counts.correct + counts.wrong + counts.manual,
    total: questions.length,
    checked,
    answerAccuracy: checked
      ? Math.round((counts.correct / checked) * 100)
      : null,
  };
}
export function examClock(seconds: number) {
  const safe = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
// Secure local exam APIs return their own authoritative counts without answer keys.
export function transitionFromOutcome(result: ExamOutcome) {
  const checked = result.correctCount + result.wrongCount;
  return {
    correct: result.correctCount,
    wrong: result.wrongCount,
    skipped: result.skippedCount,
    manual: 0,
    answered: checked,
    total: result.total,
    checked,
    answerAccuracy: checked
      ? Math.round((result.correctCount / checked) * 100)
      : null,
  };
}
export function resultMessage(percent: number, answered: number) {
  if (!answered)
    return {
      title: "Your next step starts with one question.",
      description:
        "Open the answer review, understand one concept, then build from there.",
    };
  if (percent >= 70)
    return {
      title: "A strong step forward.",
      description:
        "Keep the concepts fresh. Review any questions you missed before your next test.",
    };
  if (percent >= 40)
    return {
      title: "Build on what you know.",
      description:
        "You have a starting point. Reviewing your mistakes will help you improve.",
    };
  return {
    title: "Keep going. You can build from here.",
    description:
      "Take one concept at a time. Your answer review will help you find where to begin.",
  };
}
