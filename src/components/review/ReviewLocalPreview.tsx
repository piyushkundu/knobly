"use client";
import { useState } from "react";
import ReviewWorkspace from "./ReviewWorkspace";
import type { ReviewData, ReviewFilter } from "@/lib/review-model";
const examples = [
  {
    text: "What is restarting an already running computer called? | पहले से चल रहे कंप्यूटर को दोबारा शुरू करना क्या कहलाता है?",
    options: [
      "Log off | लॉग ऑफ",
      "Cold booting | कोल्ड बूटिंग",
      "Warm booting | वार्म बूटिंग",
      "Shut down | बंद करना",
    ],
    chapter: "Computer fundamentals",
    explanation:
      "Warm booting means restarting a computer that is already running. A cold boot starts the computer after its power was off. Remember: Restart = warm boot; starting from power off = cold boot.",
  },
  {
    text: "Which device is used to enter text into a computer? | कंप्यूटर में टेक्स्ट डालने के लिए किस उपकरण का उपयोग होता है?",
    options: [
      "Monitor | मॉनिटर",
      "Printer | प्रिंटर",
      "Keyboard | कीबोर्ड",
      "Speaker | स्पीकर",
    ],
    chapter: "Input and output devices",
    explanation:
      "A keyboard is an input device: it sends the keys you press into the computer. A monitor, printer and speaker give output. Remember: Input goes in; output comes out.",
  },
  {
    text: "Which memory loses its contents when the power is switched off? | बिजली बंद होने पर किस मेमोरी का डेटा मिट जाता है?",
    options: [
      "ROM | रोम",
      "SSD | एसएसडी",
      "RAM | रैम",
      "Hard disk | हार्ड डिस्क",
    ],
    chapter: "Memory and storage",
    explanation:
      "RAM is volatile memory. It holds the data used by running programs and needs power to keep that data. Storage such as an SSD keeps saved files after power is off.",
  },
  {
    text: "Which HTML element creates a hyperlink? | कौन सा HTML एलिमेंट हाइपरलिंक बनाता है?",
    options: ["<p>", "<div>", "<a>", "<h1>"],
    chapter: "Web basics",
    explanation:
      'The <a> element creates a link. Its href attribute contains the destination. Example: <a href="https://example.com">Visit</a>.',
  },
];
const questions = Array.from({ length: 50 }, (_, index) => {
  const source = examples[index % examples.length];
  return {
    id: `sample-${index + 1}`,
    originalNumber: index + 1,
    question_text: source.text,
    question_type: index === 9 ? "SHORT" : "MCQ",
    chapter: source.chapter,
    explanation: source.explanation,
    exam_options:
      index === 9
        ? []
        : source.options.map((option, i) => ({
            id: `${index + 1}-${i}`,
            option_text: option,
            is_correct: i === 2,
          })),
  };
});
questions[9] = {
  ...questions[9],
  question_text:
    "Explain the difference between input and output devices. | इनपुट और आउटपुट उपकरणों में अंतर समझाएँ।",
  explanation: "",
};
const sample: ReviewData = {
  test: {
    id: "sample",
    title: "IT TOOLS CHAPTER 1 TEST",
    duration_minutes: 50,
    xp_reward: 100,
  },
  attempt: {
    id: "local-review-demo",
    test_id: "sample",
    user_id: "preview",
    status: "SUBMITTED",
    score: 28,
    points_earned: 56,
    started_at: "2026-11-28T09:00:00Z",
    submitted_at: "2026-11-28T09:37:24Z",
  },
  questions,
  responses: Object.fromEntries(
    questions.flatMap<[string, { short_answer?: string; option_id?: string }]>(
      (q, i) =>
        i === 9
          ? [
              [
                q.id,
                {
                  short_answer:
                    "Input devices send data into a computer. Output devices show the result.",
                },
              ],
            ]
          : i < 29
            ? [[q.id, { option_id: `${i + 1}-2` }]]
            : i < 40
              ? [[q.id, { option_id: `${i + 1}-0` }]]
              : [],
    ),
  ),
  missing: 0,
};
export default function ReviewLocalPreview({
  initialFilter = "all",
}: {
  initialFilter?: ReviewFilter;
}) {
  const [saved, setSaved] = useState(new Set<string>(["sample-1", "sample-3"]));
  return (
    <ReviewWorkspace
      preview
      initialFilter={initialFilter}
      data={sample}
      userId="preview"
      saved={saved}
      onBookmark={async (id, value) => {
        setSaved((current) => {
          const next = new Set(current);
          if (value) next.add(id);
          else next.delete(id);
          return next;
        });
      }}
      onExplain={async (question) =>
        `Why this is correct\n${question.explanation || "Check the correct answer against the lesson."}\n\nRemember this\nExplain the idea in your own words, then try a similar question.`
      }
    />
  );
}
