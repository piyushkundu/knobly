import type { StyleDraft, StyleLesson, StyleCourseId } from './style-course-types';

const sample = '<h1 id="title">Learn CSS</h1>\n<p class="highlight">Style this paragraph.</p>\n<div class="demo card">A content box</div>\n<ul><li>One</li><li>Two</li><li>Three</li></ul>';
const cssDemos: Record<string, StyleDraft> = {
    'what-is-css': { html: sample, css: 'body { font-family:Arial,sans-serif; padding:24px; }\nh1 { color:#1d4ed8; }\np { font-size:18px; }\n.card { background:#dbeafe; padding:20px; border-radius:12px; }' },
    'evolution-of-css': { html: '<h1>CSS timeline</h1><ol><li>CSS1: basic styling</li><li>CSS2: positioning and more</li><li>Modern CSS: independent modules</li></ol>', css: 'body { font-family:Arial; padding:24px; }\nli { margin:12px 0; border-left:4px solid #2563eb; padding:12px; }' },
    'characteristics-of-css': { html: '<h1>Reusable styles</h1><p class="note">First note</p><p class="note">Second note</p>', css: '.note { color:#1e40af; background:#eff6ff; padding:16px; border-left:4px solid #2563eb; }' },
    'three-ways-to-insert-css': { html: '<h1 style="color:purple">Inline colour</h1>\n<style>p { font-weight:bold; }</style>\n<p>Internal weight + external background</p>', css: '/* This editor acts as the external style.css file. */\np { background:#dbeafe; padding:20px; }' },
    'priorities-of-css': { html: '<p id="message" class="note">Which colour wins?</p>', css: 'p { color:green; }\n.note { color:blue; }\n#message { color:purple; }\n/* In this same origin/layer, !important beats normal declarations. */\n/* p { color:red !important; } */' },
    'css-syntax': { html: '<p>Selector → property → value</p>', css: 'p {\n  color: #1d4ed8;\n  font-size: 24px;\n  padding: 20px;\n}' },
    'css-selectors': { html: '<div class="card"><p id="intro">Direct child</p><section><p>Descendant</p></section></div><ul><li>One</li><li>Two</li><li>Three</li><li>Four</li></ul><input type="text" placeholder="An attribute selector">', css: '.card { padding:16px; border:2px solid #2563eb; }\n.card > p { color:purple; }\n.card p { font-weight:bold; }\nli:nth-child(even) { background:#dbeafe; }\ninput[type="text"] { border:2px solid green; padding:8px; }' },
    'border-properties': { html: '<div class="box solid">Solid</div><div class="box dashed">Dashed</div><div class="box dotted">Dotted</div>', css: '.box { margin:16px; padding:24px; border-width:3px; border-color:#2563eb; }\n.solid { border-style:solid; border-radius:16px; }\n.dashed { border-style:dashed; }\n.dotted { border-style:dotted; border-radius:40px; }' },
    'display-property': { html: '<h2>Try block / inline / inline-block</h2><a href="#">Home</a> <a href="#">About</a> <a href="#">Contact</a>', css: 'a { display:inline-block; width:100px; padding:16px; margin:4px; color:white; background:#1d4ed8; text-align:center; }' },
    'display-flex': { html: '<div class="row"><div>One</div><div>Two</div><div>Three</div></div>', css: '.row { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:16px; min-height:200px; border:2px dashed #94a3b8; }\n.row > div { padding:24px; background:#dbeafe; }' },
    'css-box-model-comprehensive-guide': { html: '<div class="box">Content</div><p>Inspect content + padding + border + margin.</p>', css: '.box { width:200px; padding:20px; border:5px solid #2563eb; margin:30px; background:#dbeafe; }' },
    'box-shadow': { html: '<div class="card">Hover over this card</div>', css: '.card { margin:40px; padding:40px; border-radius:16px; background:white; box-shadow:0 4px 16px #0002; transition:box-shadow .2s; }\n.card:hover { box-shadow:0 12px 30px #0004; }' },
    'box-sizing': { html: '<div class="box content">content-box</div><div class="box border">border-box</div>', css: '.box { width:200px; padding:20px; border:4px solid #2563eb; margin:16px; background:#dbeafe; }\n.content { box-sizing:content-box; }\n.border { box-sizing:border-box; }' },
    'box-decoration-break': { html: '<div style="width:230px;font-size:28px;line-height:1.8"><span class="mark">A highlighted sentence wrapping across multiple lines.</span></div>', css: '.mark { background:#fef08a; border:2px solid #a16207; padding:4px; -webkit-box-decoration-break:clone; box-decoration-break:clone; }' },
    'list-styles': { html: '<ul><li>HTML</li><li>CSS</li></ul><ol><li>Read</li><li>Practise</li></ol>', css: 'ul { list-style-type:square; list-style-position:inside; }\nol { list-style-type:upper-roman; }\nli { padding:8px; }' },
    'text-properties': { html: '<h1>Readable typography</h1><p>Line height controls the distance between text lines. Try changing alignment and spacing to see how the paragraph feels.</p>', css: 'body { max-width:500px; padding:24px; }\nh1 { text-align:center; text-transform:uppercase; letter-spacing:2px; }\np { line-height:1.8; text-align:left; word-spacing:2px; }' },
    'font-properties': { html: '<h1>Heading</h1><p class="intro">A short introduction.</p><p>Regular body text.</p>', css: 'body { font-family:Arial,sans-serif; font-size:16px; }\nh1 { font-size:32px; font-weight:700; }\n.intro { font-style:italic; font-weight:600; }' },
    'background-properties': { html: '<div class="hero"><h1>A mountain journey</h1></div>', css: '.hero { min-height:260px; padding:32px; color:#0f172a; background:#dbeafe url("/practice-media/landscape.svg") center/cover no-repeat; }' },
    'css-position-properties': { html: '<div class="card"><span class="badge">Featured</span><h2>Positioning</h2><p>The card is relative; the badge is absolute.</p></div>', css: '.card { position:relative; margin:30px; padding:50px 24px 24px; border:2px solid #2563eb; }\n.badge { position:absolute; top:10px; right:10px; background:#166534; color:white; padding:8px; border-radius:6px; }' },
    'css-table-properties': { html: '<table><thead><tr><th>Topic</th><th>Status</th></tr></thead><tbody><tr><td>Selectors</td><td>Ready</td></tr><tr><td>Layout</td><td>Practising</td></tr><tr><td>Project</td><td>Next</td></tr></tbody></table>', css: 'table { width:100%; border-collapse:collapse; }\nth,td { border:1px solid #94a3b8; padding:16px; text-align:left; }\nth { background:#1e40af; color:white; }\ntbody tr:nth-child(even) { background:#eff6ff; }\ntbody tr:hover { background:#dbeafe; }' },
};
const w3Demos: Record<string, string> = {
    'what-is-a-web-framework':'<div class="w3-container w3-blue w3-padding"><h1>Build with classes</h1><p>A ready-made toolkit for your design.</p></div>',
    'discover-w3-css-your-design-superpower':'<div class="w3-row-padding"><div class="w3-third"><div class="w3-panel w3-pale-blue">Mobile-first</div></div><div class="w3-third"><div class="w3-panel w3-pale-green">Lightweight</div></div><div class="w3-third"><div class="w3-panel w3-pale-yellow">Easy to learn</div></div></div>',
    'how-to-use-w3-css':'<!-- The compiler includes W3.CSS for this course. In your own HTML head use:\n<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\n-->\n<div class="w3-panel w3-blue"><h1>W3.CSS is ready</h1></div>',
    'w3-css-classes-colors-and-hover-effects':'<div class="w3-panel w3-blue">Blue background</div><p class="w3-text-red">Red text</p><button class="w3-button w3-light-grey w3-hover-green">Hover me</button>',
    'w3-css-border-classes':'<div class="w3-panel w3-border w3-border-blue w3-round">Blue border</div><div class="w3-panel w3-leftbar w3-border-green w3-pale-green">Left border</div><div class="w3-panel w3-border w3-hover-border-red">Hover border</div>',
    'w3-css-font-size-classes':'<p class="w3-small">Small</p><p class="w3-large">Large</p><p class="w3-xxlarge">XX Large</p><p class="w3-jumbo">Jumbo</p>',
    'w3-css-text-classes':'<p class="w3-left-align">Left</p><p class="w3-center w3-wide">Centred and spaced</p><p class="w3-right-align w3-text-blue">Right</p>',
    'w3-css-table-classes':'<div class="w3-responsive"><table class="w3-table-all w3-hoverable"><tr class="w3-blue"><th>Topic</th><th>Progress</th></tr><tr><td>Colours</td><td>Ready</td></tr><tr><td>Tables</td><td>Practising</td></tr></table></div>',
    'w3-css-container':'<div class="w3-container w3-blue"><h1>Container</h1><p>Consistent horizontal padding.</p></div>',
    'w3-css-panel':'<div class="w3-panel w3-pale-blue"><p>Panel with padding and vertical margins.</p></div><div class="w3-panel w3-border w3-border-blue"><p>Add a border explicitly.</p></div>',
    'w3-css-rounded-panel':'<div class="w3-panel w3-blue w3-round-large"><h2>Rounded panel</h2><p>Try w3-round, w3-round-large and w3-round-xlarge.</p></div>',
    'w3-css-button':'<button class="w3-button w3-blue">Button</button> <button class="w3-button w3-green w3-round">Rounded</button> <button class="w3-button w3-red w3-hover-black">Hover</button>',
    'w3-css-display-container':'<div class="w3-display-container w3-pale-blue" style="height:240px"><span class="w3-display-topleft w3-padding">Top left</span><span class="w3-display-middle">Middle</span><span class="w3-display-bottomright w3-padding">Bottom right</span></div>',
    'w3-css-display-positions':'<div class="w3-display-container w3-pale-green" style="height:240px"><span class="w3-display-topright w3-padding">Top right</span><span class="w3-display-left w3-padding">Left</span><span class="w3-display-bottommiddle w3-padding">Bottom middle</span></div>',
    'collapsible-panel':'<button class="w3-button w3-blue" onclick="document.getElementById(\'panel\').classList.toggle(\'w3-hide\')">Toggle panel</button>\n<div id="panel" class="w3-panel w3-pale-blue w3-hide"><p>W3.CSS styles the panel; JavaScript toggles its visibility.</p></div>',
    'w3-css-lists':'<ul class="w3-ul w3-card"><li class="w3-hover-blue">HTML</li><li class="w3-hover-green">CSS</li><li>W3.CSS <button class="w3-button w3-right" onclick="this.parentElement.remove()" aria-label="Remove W3.CSS item">×</button></li></ul>',
    'w3-css-image-classes':'<img src="/practice-media/study.svg" class="w3-image w3-round-large" alt="Study workspace" style="width:200px"><img src="/practice-media/landscape.svg" class="w3-image w3-circle w3-border w3-grayscale" alt="Mountain landscape" style="width:200px;height:200px;object-fit:cover">',
};
export function lessonDraft(course: StyleCourseId, lesson: StyleLesson): StyleDraft {
    if (lesson.demo) return lesson.demo;
    if (course === 'w3css') return { html: w3Demos[lesson.id] || w3Demos['what-is-a-web-framework'], css: '' };
    return cssDemos[lesson.id] || cssDemos['what-is-css'];
}

export function previewDocument(draft: StyleDraft, course: StyleCourseId) {
    // Styles are user code inside an opaque-origin sandbox, never injected into the app DOM.
    const css = draft.css.replace(/<\/style/gi, '<\\/style');
    const head = '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        (course === 'w3css' ? '<link rel="stylesheet" href="/style-course/w3.css">' : '') + '<style>' + css + '</style>';
    const html = draft.html.replace(/<link\b[^>]*href\s*=\s*["'](?:\.\/)?style(?:s)?\.css["'][^>]*>/gi, '');
    return /<\/head\s*>/i.test(html) ? html.replace(/<\/head\s*>/i, head + '</head>') : '<!doctype html><html><head><meta charset="utf-8">' + head + '</head><body>' + html + '</body></html>';
}
