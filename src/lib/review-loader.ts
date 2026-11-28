import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import {
  cleanReviewText,
  orderReviewQuestions,
  type ReviewAttempt,
  type ReviewData,
  type ReviewOption,
  type ReviewQuestion,
  type ReviewResponse,
  type ReviewTest,
} from "./review-model";
import { htmlOptionHindi } from "./html-test-option-language";

export async function loadCompletedReview(
  db: Firestore,
  uid: string,
  attemptId: string,
): Promise<ReviewData> {
  const snapshot = await getDoc(doc(db, "exam_attempts", attemptId));
  if (!snapshot.exists()) throw Error("This review could not be found.");
  const attempt = { ...snapshot.data(), id: snapshot.id } as ReviewAttempt;
  if (attempt.user_id !== uid)
    throw Error("This review is not available for your account.");
  if (
    !["SUBMITTED", "AUTO_SUBMITTED", "COMPLETED"].includes(
      String(attempt.status).toUpperCase(),
    )
  )
    throw Error("Complete this test before opening its answer review.");
  const [testSnapshot, responsesSnapshot, questionsSnapshot] =
    await Promise.all([
      getDoc(doc(db, "exam_tests", attempt.test_id)),
      getDocs(
        query(
          collection(db, "exam_responses"),
          where("attempt_id", "==", attemptId),
        ),
      ),
      getDocs(
        query(
          collection(db, "exam_questions"),
          where("test_id", "==", attempt.test_id),
        ),
      ),
    ]);
  if (!testSnapshot.exists())
    throw Error("The test details are no longer available.");
  const test = { ...testSnapshot.data(), id: testSnapshot.id } as ReviewTest;
  const responses: Record<string, ReviewResponse> = {};
  responsesSnapshot.docs.forEach((row) => {
    const value = row.data() as ReviewResponse;
    if (value.question_id) responses[value.question_id] = value;
  });
  const ids = questionsSnapshot.docs.map((row) => row.id),
    options: ReviewOption[] = [];
  const batches = [];
  for (let i = 0; i < ids.length; i += 30) batches.push(ids.slice(i, i + 30));
  const results = await Promise.all(
    batches.map((batch) =>
      getDocs(
        query(
          collection(db, "exam_options"),
          where("question_id", "in", batch),
        ),
      ),
    ),
  );
  results.forEach((result) =>
    result.docs.forEach((row) => {
      const option = { ...row.data(), id: row.id } as ReviewOption;
      const text = cleanReviewText(option.option_text),
        hindi = htmlOptionHindi(test.id, text);
      options.push({
        ...option,
        option_text: hindi ? text + " | " + hindi : text,
      });
    }),
  );
  const byQuestion = new Map<string, ReviewOption[]>();
  for (const option of options) {
    const id = option.question_id || "";
    if (!byQuestion.has(id)) byQuestion.set(id, []);
    byQuestion.get(id)!.push(option);
  }
  const questions = questionsSnapshot.docs.map(
    (row) =>
      ({
        ...row.data(),
        id: row.id,
        question_text: cleanReviewText(row.data().question_text),
        question_type: String(row.data().question_type || "MCQ"),
        exam_options: (byQuestion.get(row.id) || []).sort((a, b) =>
          a.id.localeCompare(b.id),
        ),
      }) as ReviewQuestion,
  );
  return {
    attempt,
    test,
    responses,
    ...orderReviewQuestions(questions, attempt.question_order),
  };
}
