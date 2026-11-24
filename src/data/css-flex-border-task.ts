import type { StyleTask } from '@/lib/style-course-types';

export const flexBorderTask: StyleTask = {
    id: 'flex-border-cards',
    title: 'Flexbox & Border Cards',
    subtitle: 'Arrange three study cards with Flexbox and style solid, dashed and double borders.',
    inlineDescription: 'Ab khud banayein: teen cards ko ek row mein sajayein aur har card par alag border lagayein.',
    source: 'Knobly original exercise',
    lesson: 'display-flex',
    inlineAfter: 'display-flex',
    target: '/style-course/flex-border-cards.html',
    skills: ['display: flex', 'justify-content', 'align-items', 'gap', 'flex-wrap', 'border-style', 'border-width', 'border-color', 'border-radius'],
    steps: [
        'Create the centred “CSS Study Corner” board with a 2px dashed blue outer border. / Beech mein board banayein aur bahar dashed blue border lagayein.',
        'Use display: flex, justify-content: space-between and align-items: center on the heading row. / Heading aur BEGINNER badge ko ek line mein rakhein.',
        'Turn .study-cards into a flex container. Keep the cards centred with a 16px gap and flex-wrap: wrap. / Bade screen par teen cards ek row mein; chhote screen par apne aap next row mein aayein.',
        'Give each card width: 220px, padding: 20px and border-radius: 16px. / Teenon cards ka size aur andar ka space ek jaisa rakhein.',
        'HTML card: 3px solid orange border. CSS card: 3px dashed blue border. JavaScript card: 5px double purple border. / Har card par alag border style saaf dikhni chahiye.',
        'Use flex-direction: column inside each card and margin-top: auto on its link so the buttons line up. / Cards ke andar text upar aur links neeche align karein.',
        'Match the target colours and the three bottom labels. Resize the preview to check wrapping. / Target se compare karein aur chhoti screen par horizontal scrolling na aaye.'
    ],
    note: 'HTML structure is provided: write the CSS yourself. Flexbox arranges the cards; border properties draw their edges. Border ka colour, width aur style alag-alag pehchanein. Keep the supplied box-sizing helper so padding and borders stay inside each card’s width.',
    starter: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CSS Study Corner</title>
</head>
<body>
  <main class="study-board">
    <header class="board-heading">
      <div><p class="eyebrow">LEARN · PRACTISE · BUILD</p><h1>CSS Study Corner</h1></div>
      <span class="level-badge">BEGINNER</span>
    </header>
    <p class="intro">Three subjects. One learning journey.</p>
    <section class="study-cards" aria-label="Study subjects">
      <article class="subject-card html-card" id="html-card">
        <span class="topic-number">01 / MARKUP</span><h2>HTML</h2>
        <p>Structure a page with headings, images and links.</p><a href="#html-card">Explore HTML →</a>
      </article>
      <article class="subject-card css-card" id="css-card">
        <span class="topic-number">02 / STYLING</span><h2>CSS</h2>
        <p>Add colours, borders and flexible layouts to your page.</p><a href="#css-card">Explore CSS →</a>
      </article>
      <article class="subject-card js-card" id="js-card">
        <span class="topic-number">03 / INTERACTION</span><h2>JavaScript</h2>
        <p>Make a page respond to clicks and user actions.</p><a href="#js-card">Explore JS →</a>
      </article>
    </section>
    <footer class="board-footer"><span>3 Cards</span><span>1 Flex Container</span><span>3 Border Styles</span></footer>
  </main>
</body>
</html>`,
        css: `/* Helper: width includes padding and border. Keep this rule. */
* { box-sizing: border-box; }

/* Add your CSS below. Start with body, .study-board and .study-cards. */
`
    },
    solution: { html: '', css: '' }
};

flexBorderTask.solution = {
    html: flexBorderTask.starter.html,
    css: `* { box-sizing: border-box; }
body { margin: 0; padding: 28px 18px; font-family: Arial, sans-serif; background: #f3f6fc; color: #25334d; }
.study-board { width: 100%; max-width: 840px; margin: 0 auto; padding: 28px; background: #fff; border: 2px dashed #9ab4ea; border-radius: 24px; }
.board-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.eyebrow { margin: 0 0 9px; font-size: 10px; letter-spacing: 2px; font-weight: bold; color: #5a70a4; }
h1 { margin: 0; font-size: 30px; color: #203052; }
.level-badge { padding: 9px 12px; border: 1px solid #c8d9f6; border-radius: 20px; background: #eef4ff; color: #34588e; font-size: 10px; font-weight: bold; }
.intro { margin: 14px 0 25px; font-size: 14px; line-height: 1.7; color: #62708a; }
.study-cards { display: flex; justify-content: center; align-items: stretch; gap: 16px; flex-wrap: wrap; }
.subject-card { display: flex; flex-direction: column; width: 220px; max-width: 100%; padding: 20px; border-radius: 16px; }
.html-card { border: 3px solid #e78a41; background: #fff7ef; }
.css-card { border: 3px dashed #5486d9; background: #f1f7ff; }
.js-card { border: 5px double #9a76c7; background: #f8f3ff; }
.topic-number { font-size: 9px; font-weight: bold; letter-spacing: 1px; color: #61708a; }
.subject-card h2 { margin: 19px 0 10px; font-size: 25px; color: #253858; }
.subject-card p { margin: 0 0 24px; font-size: 13px; line-height: 1.8; color: #53647c; }
.subject-card a { display: block; margin-top: auto; padding: 10px; border: 1px solid #d4deed; border-radius: 8px; background: #fff; color: #35527d; text-align: center; text-decoration: none; font-size: 11px; font-weight: bold; }
.board-footer { display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 25px; }
.board-footer span { border: 1px solid #dbe4f2; border-radius: 20px; padding: 8px 12px; font-size: 10px; color: #53647c; background: #f8faff; }
`
};
