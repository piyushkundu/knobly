import fetch from 'node-fetch';

async function run() {
  const d = {
    testTitle: "PYTHON TEST TUPLE 1",
    questions: [
      {
        id: "abc",
        question_text: "Which loop is used when number of iterations is known? / जब इटरेशन्स की संख्या पता हो तो कौन सा लूप इस्तेमाल होता है?",
        options: [
          { id: "o1", option_text: "for", is_correct: false },
          { id: "o2", option_text: "do-while", is_correct: true },
          { id: "o3", option_text: "while", is_correct: false },
          { id: "o4", option_text: "repeat", is_correct: false }
        ]
      }
    ]
  };

  const simplifiedQs = d.questions.map((q) => {
      const currentCorrect = q.options?.find((o) => o.is_correct);
      return {
          id: q.id,
          text: q.question_text,
          options: q.options?.map((o) => ({ id: o.id, text: o.option_text })),
          marked_correct_id: currentCorrect ? currentCorrect.id : null,
          marked_correct_text: currentCorrect ? currentCorrect.option_text : null,
      };
  });

  console.log("SENDING:", JSON.stringify(simplifiedQs, null, 2));

  const prompt = `You are an expert exam reviewer. Review the following test questions ("Test").
Your task is to check if the 'marked_correct_text' for each question is factually accurate.
If you are confident that the currently marked correct option is WRONG or if there's a typo/ambiguity that makes it incorrect, report a doubt. Explain which option should be correct and why in exactly 2-3 short sentences. Look out for trick questions in CS/programming.
If the marked option is correct, do NOT include it in the response.

You must return your response as a JSON object with a single key "doubts" containing an array of objects.
Format:
{
  "doubts": [
    { "questionId": "ID_HERE", "doubt": "Your specific explanation..." }
  ]
}

Questions to verify:
${JSON.stringify(simplifiedQs, null, 2)}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${process.env.GROQ_API_KEY}\`,
    },
    body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
    }),
  });

  const data = await res.json();
  console.log("GROQ RESPONSE:", data.choices?.[0]?.message?.content);
}

run();
