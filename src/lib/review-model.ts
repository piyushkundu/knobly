export type ReviewStatus = "correct" | "wrong" | "skipped" | "manual";
export type ReviewFilter = "all" | ReviewStatus | "saved";
export function reviewFilterFromSearch(search: string): ReviewFilter {
  const value = new URLSearchParams(search).get("filter");
  return value &&
    ["all", "correct", "wrong", "skipped", "manual", "saved"].includes(value)
    ? (value as ReviewFilter)
    : "all";
}
export interface ReviewOption {
  id: string;
  option_text: string;
  is_correct: unknown;
  question_id?: string;
}
export interface ReviewQuestion {
  id: string;
  question_text: string;
  question_type: string;
  marks?: number;
  chapter?: string;
  difficulty?: string;
  explanation?: string;
  exam_options: ReviewOption[];
  created_at?: { seconds?: number };
  originalNumber?: number;
}
export interface ReviewResponse {
  question_id?: string;
  option_id?: string | null;
  short_answer?: string | null;
}
export interface ReviewAttempt {
  id: string;
  test_id: string;
  user_id: string;
  status: string;
  score?: unknown;
  points_earned?: unknown;
  xp_earned?: unknown;
  accuracy?: unknown;
  question_order?: string[];
  started_at?: string;
  submitted_at?: string;
}
export interface ReviewTest {
  id: string;
  title: string;
  category?: string;
  duration_minutes: number;
  xp_reward?: unknown;
  total_points?: unknown;
  total_marks?: unknown;
}
export interface ReviewData {
  attempt: ReviewAttempt;
  test: ReviewTest;
  questions: ReviewQuestion[];
  responses: Record<string, ReviewResponse>;
  missing: number;
}

export const numeric = (value: unknown): number | undefined => {
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};
export const isCorrectOption = (value: unknown) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  (typeof value === "string" && value.toLowerCase() === "true");
export function cleanReviewText(value: unknown): string {
  if (typeof value !== "string") return value == null ? "" : String(value);
  try {
    if (value.trim().startsWith("{")) {
      const parsed = JSON.parse(value);
      if (typeof parsed.text === "string") return parsed.text;
    }
  } catch {}
  return value;
}
// Legacy imported tests resolve multiple answer flags by the last option ID.
export const correctReviewOption = (q: ReviewQuestion) =>
  [...q.exam_options]
    .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
    .filter((option) => isCorrectOption(option.is_correct))
    .at(-1);
export function reviewStatus(
  q: ReviewQuestion,
  response?: ReviewResponse,
): ReviewStatus {
  if (
    q.question_type.toUpperCase() === "SHORT" ||
    (!q.exam_options.length &&
      q.question_type.toUpperCase() !== "MCQ" &&
      q.question_type.toUpperCase() !== "TF")
  )
    return response?.short_answer?.trim() ? "manual" : "skipped";
  if (!response?.option_id) return "skipped";
  const key = correctReviewOption(q);
  if (
    !key ||
    !q.exam_options.some((option) => option.id === response.option_id)
  )
    return "manual";
  return key.id === response.option_id ? "correct" : "wrong";
}
export function reviewSummary(data: ReviewData) {
  const counts = { correct: 0, wrong: 0, skipped: 0, manual: 0 };
  for (const q of data.questions)
    counts[reviewStatus(q, data.responses[q.id])]++;
  const total = data.questions.length + data.missing;
  const totalPoints =
    numeric(data.test.xp_reward) ||
    numeric(data.test.total_points) ||
    numeric(data.test.total_marks) ||
    total;
  const perQuestion = total ? totalPoints / total : 0;
  const recorded =
    numeric(data.attempt.points_earned) ?? numeric(data.attempt.xp_earned);
  const earned =
    recorded ??
    Math.round((numeric(data.attempt.score) ?? counts.correct) * perQuestion);
  const graded = counts.correct + counts.wrong;
  return {
    ...counts,
    total,
    available: data.questions.length,
    missing: data.missing,
    totalPoints,
    perQuestion,
    earned,
    recorded: recorded !== undefined,
    accuracy: graded ? Math.round((counts.correct / graded) * 100) : null,
    analysisChanged:
      data.missing > 0 ||
      (numeric(data.attempt.score) !== undefined &&
        numeric(data.attempt.score) !== counts.correct) ||
      (recorded !== undefined &&
        Math.abs(recorded - Math.round(counts.correct * perQuestion)) > 0.01),
  };
}
export function selectReviewQuestions(
  data: ReviewData,
  filter: ReviewFilter,
  saved: ReadonlySet<string>,
) {
  return data.questions
    .map((question, index) => ({
      question,
      index: (question.originalNumber ?? index + 1) - 1,
      status: reviewStatus(question, data.responses[question.id]),
    }))
    .filter(
      (row) =>
        filter === "all" ||
        (filter === "saved" && saved.has(row.question.id)) ||
        row.status === filter,
    );
}
export function orderReviewQuestions(
  questions: ReviewQuestion[],
  order: unknown,
) {
  if (Array.isArray(order) && order.length) {
    const ids = [
        ...new Set(order.filter((id): id is string => typeof id === "string")),
      ],
      byId = new Map(questions.map((q) => [q.id, q]));
    return {
      questions: ids.flatMap((id, index) =>
        byId.has(id) ? [{ ...byId.get(id)!, originalNumber: index + 1 }] : [],
      ),
      missing: ids.filter((id) => !byId.has(id)).length,
    };
  }
  return {
    questions: [...questions].sort(
      (a, b) =>
        (a.created_at?.seconds || 0) - (b.created_at?.seconds || 0) ||
        a.id.localeCompare(b.id),
    ),
    missing: 0,
  };
}
export const formatPoints = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
export function reviewTime(attempt: ReviewAttempt) {
  const start = Date.parse(attempt.started_at || ""),
    end = Date.parse(attempt.submitted_at || "");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start)
    return "Time unavailable";
  const seconds = Math.round((end - start) / 1000),
    minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
export function reviewLesson(test: ReviewTest, topic: string) {
  const text = (
    test.title +
    " " +
    (test.category || "") +
    " " +
    topic
  ).toLowerCase();
  if (/python/.test(text))
    return /dictionary/.test(text)
      ? "/python/dictionary"
      : /function/.test(text)
        ? "/python/functions"
        : /list/.test(text)
          ? "/python/lists"
          : "/python";
  if (/w3\.?css/.test(text)) return "/web-design/w3css";
  if (/css/.test(text)) return "/web-design/css";
  if (/html/.test(text)) return "/html/elements";
  if (/javascript/.test(text)) return "/web-design/javascript";
  if (/it tools|computer|ccc/.test(text)) return "/it-tools";
  return "/dashboard";
}
export function reviewTopics(data: ReviewData) {
  const groups = new Map<
    string,
    {
      topic: string;
      correct: number;
      wrong: number;
      skipped: number;
      manual: number;
      ids: string[];
      href: string;
    }
  >();
  for (const q of data.questions) {
    const topic = q.chapter?.trim() || "Other questions";
    if (!groups.has(topic))
      groups.set(topic, {
        topic,
        correct: 0,
        wrong: 0,
        skipped: 0,
        manual: 0,
        ids: [],
        href: reviewLesson(data.test, topic),
      });
    const group = groups.get(topic)!;
    group[reviewStatus(q, data.responses[q.id])]++;
    group.ids.push(q.id);
  }
  return [...groups.values()].sort(
    (a, b) =>
      b.wrong - a.wrong ||
      b.skipped - a.skipped ||
      a.topic.localeCompare(b.topic),
  );
}
export interface ReviewNotes {
  [questionId: string]: string;
}
export function readReviewNotes(
  storage: Pick<Storage, "getItem">,
  key: string,
): ReviewNotes {
  try {
    const value = JSON.parse(storage.getItem(key) || "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, note]) => typeof note === "string")
        .map(([id, note]) => [id, (note as string).slice(0, 1200)]),
    );
  } catch {
    return {};
  }
}
