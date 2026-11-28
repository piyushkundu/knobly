import type { User } from "firebase/auth";
export type ReviewBookmarkScope = "account" | "browser";
const browserKey = (uid: string) => `knobly_exam_bookmarks_v1:${uid}`;
function browserBookmarks(uid: string) {
  try {
    const value = JSON.parse(localStorage.getItem(browserKey(uid)) || "{}");
    return {
      review: Array.isArray(value.review) ? value.review : [],
      bookmarks: Array.isArray(value.bookmarks)
        ? value.bookmarks.filter((id: unknown) => typeof id === "string")
        : [],
    };
  } catch {
    throw Error("Saved questions could not be read from this browser.");
  }
}
async function request(user: User, body?: Record<string, unknown>) {
  const token = await user.getIdToken();
  return fetch("/api/practice", {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: {
      Authorization: "Bearer " + token,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
export async function loadReviewBookmarks(
  user: User,
): Promise<{ bookmarks: string[]; scope: ReviewBookmarkScope }> {
  const response = await request(user);
  if (response.status === 404)
    return { ...browserBookmarks(user.uid), scope: "browser" };
  const result = await response.json();
  if (!response.ok || !Array.isArray(result.bookmarks))
    throw Error("Saved questions could not be loaded. Please try again.");
  return {
    bookmarks: result.bookmarks.filter((id: unknown) => typeof id === "string"),
    scope: "account",
  };
}
export async function saveReviewBookmark(
  user: User,
  questionId: string,
  saved: boolean,
  scope: ReviewBookmarkScope,
) {
  if (scope === "browser") {
    const value = browserBookmarks(user.uid),
      ids = new Set<string>(value.bookmarks);
    if (saved) ids.add(questionId);
    else ids.delete(questionId);
    try {
      localStorage.setItem(
        browserKey(user.uid),
        JSON.stringify({ ...value, bookmarks: [...ids] }),
      );
    } catch {
      throw Error("This question could not be saved in this browser.");
    }
    return;
  }
  const response = await request(user, {
    action: "bookmark",
    questionId,
    saved,
  });
  if (!response.ok)
    throw Error("This question could not be saved. Please try again.");
}
