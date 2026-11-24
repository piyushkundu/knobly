import type { StyleTask } from '@/lib/style-course-types';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Learning Hub</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="learning-hub">
    <header class="site-heading" id="home">
      <p class="eyebrow">LEARN TOGETHER. BUILD SOMETHING NEW.</p>
      <h1>Learning Hub</h1>
      <p>Your first step into web design starts here.</p>
    </header>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#courses">Courses</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <section class="courses" id="courses">
      <p class="section-label">PICK YOUR STARTING POINT</p>
      <h2>Small lessons. Big possibilities.</h2>
      <p class="section-intro">Explore the three building blocks of the web.</p>
      <div class="course-list">
        <article class="course-card html-card">
          <span class="course-number">01 / STRUCTURE</span>
          <h3>HTML</h3>
          <p>Build a strong foundation with headings, images and links.</p>
          <a href="#html">Explore HTML →</a>
        </article>
        <article class="course-card css-card">
          <span class="course-number">02 / DESIGN</span>
          <h3>CSS</h3>
          <p>Bring your pages to life with colours, borders and layouts.</p>
          <a href="#css">Explore CSS →</a>
        </article>
        <article class="course-card js-card">
          <span class="course-number">03 / INTERACTION</span>
          <h3>JavaScript</h3>
          <p>Add useful interactions that respond to your visitors.</p>
          <a href="#javascript">Explore JS →</a>
        </article>
      </div>
    </section>
    <section class="about-strip" id="about"><h2>Made for curious learners.</h2><p>One topic at a time. Learn, practise, and keep creating.</p></section>
    <footer id="contact"><strong>Learning Hub</strong><span>Keep learning. Keep building.</span></footer>
  </main>
</body>
</html>`;

export const displayBorderTask: StyleTask = {
    id: 'display-border-lab',
    title: 'Learning Hub — Display & Borders',
    subtitle: 'Recreate the learning website: a full-width heading, inline navigation and inline-block course cards with three border styles.',
    inlineDescription: 'Design dekhkar website banayein: heading poori line mein, menu links saath-saath aur teen fixed-size course cards alag borders ke saath.',
    source: 'Knobly original exercise',
    lesson: 'display-property',
    inlineAfter: 'display-property',
    target: '/style-course/display-border-lab.html',
    skills: ['display: block', 'display: inline', 'display: inline-block', 'border-style', 'border-width', 'border-color', 'border-radius', 'width', 'height'],
    steps: [
        'Make index.html and style.css. Link style.css in the HTML head. / Dono files khud likhein aur HTML mein CSS file ka link lagayein.',
        'Recreate the centred Learning Hub website, maximum width 940px, with a white background, 2px outer border and 20px rounded corners. / Target ki tarah website beech mein banayein.',
        'Use a block header with a dark-blue background, white Learning Hub heading and a 4px solid blue bottom border. / Header poori available width le aur uske baad menu nayi line par aaye.',
        'Put Home, Courses, About and Contact links in the navigation. Use display: inline for these links. / Links text ki tarah ek hi line mein aayein; inline links par width aur height lagane ki zaroorat nahi hai.',
        'Make three course cards with display: inline-block, width: 220px, height: 260px, padding: 20px, margin: 8px and vertical-align: top. / Cards saath-saath aur same height mein dikhne chahiye. Flexbox ya Grid ka use na karein.',
        'HTML: 3px solid blue border. CSS: 3px dashed green border. JavaScript: 5px double orange border. Give all three cards 14px rounded corners. / Target dekhkar har card ka colour aur border match karein.',
        'Style each Explore link as an inline-block button. Put the about section and footer on separate full-width lines. / Button ko padding dein aur neeche ke sections ko target ki tarah banayein.',
        'Check the page in a narrow preview: inline-block cards should naturally move onto the next line. / Cards screen se bahar na niklein. HTML aur CSS dono file tabs mein apna code save rahega.'
    ],
    note: 'Build the website shown in the target. Use block for full-width sections, inline for text navigation, and inline-block for sized cards and buttons. Complete this task without Flexbox or Grid.',
    starter: { html: '', css: '' },
    solution: {
        html,
        css: `* { box-sizing: border-box; }
body { margin: 0; padding: 26px 16px; background: #f1f5fb; color: #25334d; font-family: Arial, sans-serif; }
.learning-hub { width: 100%; max-width: 940px; margin: 0 auto; overflow: hidden; border: 2px solid #c5d2e7; border-radius: 20px; background: #fff; }
.site-heading { display: block; padding: 30px 24px; background: #17365d; color: #fff; text-align: center; border-bottom: 4px solid #5084d7; }
.eyebrow { margin: 0 0 12px; color: #b7d1f7; font-size: 9px; font-weight: bold; letter-spacing: 2px; }
h1 { margin: 0 0 11px; color: #fff; font-size: 34px; }
.site-heading > p:last-child { margin: 0; color: #d7e4f8; font-size: 13px; line-height: 1.7; }
.site-nav { display: block; padding: 17px 12px; border-bottom: 1px solid #dae5f4; background: #eff5ff; text-align: center; line-height: 2; }
.site-nav a { display: inline; margin: 0 13px; color: #305a92; text-decoration: none; font-size: 12px; font-weight: bold; }
.courses { display: block; padding: 30px 16px 22px; text-align: center; }
.section-label { margin: 0 0 10px; color: #6681aa; font-size: 9px; font-weight: bold; letter-spacing: 1.7px; }
.courses h2 { margin: 0 0 11px; color: #203858; font-size: 25px; }
.section-intro { margin: 0 0 18px; color: #708099; font-size: 12px; line-height: 1.8; }
.course-list { text-align: center; }
.course-card { display: inline-block; width: 220px; max-width: calc(100% - 16px); height: 260px; margin: 8px; padding: 20px; vertical-align: top; border-radius: 14px; text-align: left; }
.html-card { border: 3px solid #5486d9; background: #f2f7ff; }
.css-card { border: 3px dashed #419777; background: #f1faf5; }
.js-card { border: 5px double #d98a3d; background: #fff8ef; }
.course-number { color: #6b7d96; font-size: 9px; letter-spacing: .7px; font-weight: bold; }
.course-card h3 { margin: 20px 0 13px; color: #233b5d; font-size: 25px; }
.course-card p { height: 65px; margin: 0 0 18px; color: #5b6e87; font-size: 12px; line-height: 1.8; }
.course-card a { display: inline-block; padding: 9px 12px; border: 1px solid #ccd9ec; border-radius: 7px; background: #fff; color: #355883; text-decoration: none; font-size: 11px; font-weight: bold; }
.about-strip { display: block; margin: 0 24px 24px; padding: 20px; border: 1px dashed #b7cae7; border-radius: 12px; text-align: center; background: #f9fbff; }
.about-strip h2 { margin: 0 0 8px; color: #35567f; font-size: 17px; }
.about-strip p { margin: 0; color: #708099; font-size: 12px; line-height: 1.8; }
footer { display: block; padding: 17px 24px; border-top: 1px solid #dce5f2; background: #f8faff; text-align: center; }
footer strong { color: #426187; font-size: 12px; }
footer span { display: inline-block; margin: 0 12px; color: #7b8da6; font-size: 11px; }
`
    }
};
