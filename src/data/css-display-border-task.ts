import type { StyleTask } from '@/lib/style-course-types';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Display &amp; Border Lab</title>
</head>
<body>
  <main class="display-lab">
    <p class="eyebrow">CSS PRACTICE / DISPLAY + BORDERS</p>
    <h1>Display &amp; Border Lab</h1>
    <p class="intro">Same span elements. Three different display behaviours.</p>

    <section class="demo-panel block-panel">
      <h2>01 / Block</h2>
      <p>Every box starts on a new line. Width and height apply.</p>
      <div class="sample-row"><span class="sample">Box A</span><span class="sample">Box B</span><span class="sample">Box C</span></div>
      <p class="rule-label">display: block; border: 2px solid;</p>
    </section>

    <section class="demo-panel inline-panel">
      <h2>02 / Inline</h2>
      <p>Boxes follow the text. Width and height do not size these spans.</p>
      <div class="sample-row">Read <span class="sample">HTML</span> <span class="sample">CSS</span> <span class="sample">JS</span> together.</div>
      <p class="rule-label">display: inline; border: 2px dashed;</p>
    </section>

    <section class="demo-panel inline-block-panel">
      <h2>03 / Inline-block</h2>
      <p>Boxes sit beside each other, accept width and height, and wrap when needed.</p>
      <div class="sample-row"><span class="sample">HTML</span> <span class="sample">CSS</span> <span class="sample">JavaScript</span></div>
      <p class="rule-label">display: inline-block; border: 4px double;</p>
    </section>

    <footer>Build this layout using block, inline and inline-block. No Flexbox or Grid needed.</footer>
  </main>
</body>
</html>`;

export const displayBorderTask: StyleTask = {
    id: 'display-border-lab',
    title: 'Block, Inline & Inline-block Lab',
    subtitle: 'Use the same span elements to compare three display behaviours and practise solid, dashed and double borders.',
    inlineDescription: 'Ab khud banayein: block ko nayi line par, inline ko text ke saath aur inline-block ko fixed size ke saath dikhayein. Har group par alag border lagayein.',
    source: 'Knobly original exercise',
    lesson: 'display-property',
    inlineAfter: 'display-property',
    target: '/style-course/display-border-lab.html',
    skills: ['display: block', 'display: inline', 'display: inline-block', 'border-style', 'border-width', 'border-color', 'border-radius', 'width', 'height'],
    steps: [
        'Create a centred white lab board, max-width: 860px, padding: 24px, with a 2px solid blue-grey border and 20px rounded corners. / Board ko page ke beech mein rakhein aur bahar border lagayein.',
        'Keep the three demonstration panels one below another. Give each panel padding: 18px and a 1px solid border. / Teen sections ek ke neeche ek aayein; Flexbox ya Grid ka use na karein.',
        'Block group: apply display: block to its spans, width: 180px, height: 46px and margin: 8px 0. Use a 2px solid blue border. / Har span apni nayi line se shuru ho aur size saaf dikhna chahiye.',
        'Inline group: apply display: inline, width: 180px and height: 46px to its spans, with a 2px dashed orange border. / Width aur height likhne ke baad bhi inline spans text ke size mein hi rahenge. Read aur together. ke beech ek hi text flow banayein.',
        'Inline-block group: apply display: inline-block, width: 160px, height: 54px, margin: 4px and vertical-align: top. Use a 4px double green border. / Boxes ek doosre ke paas aayein aur width-height bhi kaam kare.',
        'Give all sample spans padding: 8px and border-radius: 8px. Keep the supplied box-sizing helper. / Padding aur border ko box ke total size ke andar rakhein.',
        'Match the blue, orange and green groups to the target. Keep the display and border rule labels visible beneath each example. / Har section ka heading, output aur neeche uski CSS pehchaan saaf dikhe.',
        'Narrow the preview: inline-block boxes should wrap naturally, while block boxes stay on separate lines. / Chhoti screen par boxes bahar na niklein. Compare karein ki inline spans par fixed width-height kyun nahi lagti.'
    ],
    note: 'The HTML uses span elements in all three groups: change their display with CSS instead of replacing them with different tags. Inline width and height are intentionally ignored for these non-replaced spans; padding and borders still appear. This exercise comes before Flexbox, so solve it without display: flex or display: grid.',
    starter: {
        html,
        css: `/* Helper: include padding and borders inside a sized box. Keep this rule. */
* { box-sizing: border-box; }

/* Write your CSS below. Use the three group classes to style their .sample spans. */
`
    },
    solution: {
        html,
        css: `* { box-sizing: border-box; }
body { margin: 0; padding: 24px 14px; background: #f3f6fc; color: #25334d; font-family: Arial, sans-serif; }
.display-lab { width: 100%; max-width: 860px; margin: 0 auto; padding: 24px; border: 2px solid #b6c7e3; border-radius: 20px; background: #fff; }
.eyebrow { margin: 0 0 12px; font-size: 10px; letter-spacing: 1.5px; font-weight: bold; color: #536b9c; }
h1 { margin: 0 0 12px; font-size: 28px; color: #203052; }
.intro { margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: #62708a; }
.demo-panel { margin: 16px 0; padding: 18px; border: 1px solid #d9e3f2; border-radius: 14px; }
.demo-panel h2 { margin: 0 0 9px; font-size: 19px; }
.demo-panel p { margin: 0 0 14px; font-size: 13px; line-height: 1.8; }
.sample-row { padding: 6px 0; font-size: 13px; line-height: 2.4; }
.sample { padding: 8px; border-radius: 8px; font-size: 12px; font-weight: bold; line-height: 24px; }
.block-panel { background: #f4f8ff; color: #315c9e; }
.block-panel .sample { display: block; width: 180px; max-width: 100%; height: 46px; margin: 8px 0; border: 2px solid #5486d9; background: #fff; }
.inline-panel { background: #fff8ef; color: #945414; }
.inline-panel .sample { display: inline; width: 180px; height: 46px; border: 2px dashed #d98a3d; background: #fff; }
.inline-panel .sample-row { line-height: 3.6; }
.inline-block-panel { background: #f0faf5; color: #276c51; }
.inline-block-panel .sample { display: inline-block; width: 160px; max-width: calc(100% - 8px); height: 54px; margin: 4px; vertical-align: top; border: 4px double #419777; background: #fff; }
.inline-block-panel .sample-row { padding: 6px 4px; }
.demo-panel .rule-label { margin: 14px 0 0; font-family: Consolas, monospace; font-size: 11px; overflow-wrap: anywhere; }
footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #d9e3f2; font-size: 12px; line-height: 1.8; color: #62708a; }
`
    }
};
