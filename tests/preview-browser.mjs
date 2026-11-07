// Disposable browser checks, served on a fresh loopback origin. No app, Firebase,
// credentials, or existing drafts are loaded. Run: npm run test:preview:browser
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;

function findNode(path, predicate) {
  const tree = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found;
  function visit(node) {
    if (predicate(node)) found = node;
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (!found) throw new Error(`Fixture source not found: ${path}`);
  return found.getText(tree);
}

const bundleDeclaration = findNode('src/components/web-compiler/WebLab.tsx', node => ts.isVariableDeclaration(node) && node.name.getText() === 'bundleCode');
const taskPreparation = findNode('src/app/html/tasks/[id]/compiler/page.tsx', node => ts.isFunctionDeclaration(node) && node.name?.text === 'preparePreviewHtml');
const bundlers = transpile('import {createPreviewConsoleBridge} from "/sandbox.js";\n' +
  'const useCallback = fn => fn;\nexport const ' + bundleDeclaration + ';\n' + taskPreparation + '\nexport {preparePreviewHtml};');

const page = `<!doctype html><html><head><meta charset="utf-8"><title>Preview isolation checks</title>
<style>body{font:16px system-ui;margin:24px;color:#172033;background:#f1f5f9}iframe{height:260px;width:450px;border:1px solid #94a3b8;background:white}li{margin:8px 0}button{padding:12px;margin:10px 0}#frames{display:flex;gap:12px;flex-wrap:wrap}</style></head>
<body><h1>Compiler preview isolation checks</h1><p>Disposable fixture only. No Firebase or production data.</p>
<ul id="results"></ul><button id="popup">Check isolated popup</button><div id="frames"></div>
<script type="module" src="/checks.js"></script></body></html>`;

const checks = String.raw`
import {PREVIEW_SANDBOX,createPreviewConsoleBridge,readPreviewConsoleEvent,openSandboxedPreview} from '/sandbox.js';
import {bundleCode,preparePreviewHtml} from '/bundlers.js';
const results = document.getElementById('results');
function report(name, passed, details = '') {
  const li = document.createElement('li');
  li.textContent = (passed ? 'PASS: ' : 'FAIL: ') + name + (details ? ' — ' + details : '');
  li.style.color = passed ? '#047857' : '#b91c1c';
  results.append(li);
}
const markup = '<!doctype html><html><head><title>Student fixture</title></head><body><h2>HTML / CSS / JS fixture</h2><button id="counter">Count: 0</button><form><input name="answer" value="test"><button type="submit">Submit</button></form><a id="jump" href="#target">Jump to section</a><p id="target">Target section</p></body></html>';
function studentProbe() {
  const blocked = {};
  const probes = {
    parentDocument: () => parent.document.title,
    localStorage: () => localStorage.length,
    sessionStorage: () => sessionStorage.length,
    cookie: () => document.cookie,
  };
  for (const [name, probe] of Object.entries(probes)) {
    try { probe(); blocked[name] = false; } catch { blocked[name] = true; }
  }
  window.count = 0;
  document.getElementById('counter').onclick = () => {
    window.count++;
    document.getElementById('counter').textContent = 'Count: ' + window.count;
  };
  document.addEventListener('submit', event => { window.formIntercepted = event.defaultPrevented; }, true);
  document.addEventListener('click', event => {
    if (event.target.id === 'jump') window.hashIntercepted = event.defaultPrevented;
  }, true);
  console.log('PROBE:' + JSON.stringify(blocked));
}
const studentJS = '(' + studentProbe.toString() + ')();';
const bundle = bundleCode([
  {language:'html', code:markup},
  {language:'css', code:'h2 { color: rgb(1, 2, 3); }'},
  {language:'javascript', code:studentJS},
]);
const scriptEnd = '</' + 'script>';
const taskHTML = preparePreviewHtml(markup.replace('</head>', '<script>' + createPreviewConsoleBridge(location.origin) + scriptEnd + '</head>').replace('</body>', '<script>' + studentJS + scriptEnd + '</body>'));

function waitForMessage(host, frame, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { host.removeEventListener('message', receive); reject(new Error('Message timeout')); }, 6000);
    function receive(event) {
      const entry = readPreviewConsoleEvent(event, frame.contentWindow);
      if (!entry || !predicate(entry)) return;
      clearTimeout(timer);
      host.removeEventListener('message', receive);
      resolve(entry);
    }
    host.addEventListener('message', receive);
  });
}

async function checkFrame(name, html) {
  const frame = document.createElement('iframe');
  frame.title = name;
  frame.setAttribute('sandbox', PREVIEW_SANDBOX);
  frame.referrerPolicy = 'no-referrer';
  document.getElementById('frames').append(frame);
  const probeMessage = waitForMessage(window, frame, entry => entry.message.startsWith('PROBE:'));
  frame.srcdoc = html;
  const probe = JSON.parse((await probeMessage).message.slice(6));
  report(name + ': parent DOM, storage and cookies blocked', Object.values(probe).every(Boolean), JSON.stringify(probe));
  const replMessage = waitForMessage(window, frame, entry => entry.message.startsWith('<= '));
  frame.contentWindow.postMessage({type:'KNOBLY_EVAL_CMD',code:'(() => { document.getElementById("counter").click(); document.querySelector("form").requestSubmit(); document.getElementById("jump").click(); return JSON.stringify({count:window.count,form:window.formIntercepted,hash:window.hashIntercepted,color:getComputedStyle(document.querySelector("h2")).color}); })()'}, '*');
  const output = JSON.parse((await replMessage).message.slice(3));
  report(name + ': JavaScript, REPL, simulated form and hash link', output.count === 1 && output.form === true && output.hash === true, JSON.stringify(output));
  if (name === 'Web compiler') report(name + ': CSS preserved', output.color === 'rgb(1, 2, 3)');
  try { void frame.contentDocument.body; report(name + ': parent cannot read frame DOM', false); }
  catch { report(name + ': parent cannot read frame DOM', true); }
}

try {
  await checkFrame('Web compiler', bundle);
  await checkFrame('Task compiler', taskHTML);
  report('Browser frame checks complete', true);
} catch (error) { report('Browser frame checks', false, error.message); }

document.getElementById('popup').onclick = async () => {
  const original = window.open;
  let popup;
  window.open = (...args) => { popup = original.apply(window, args); return popup; };
  try {
    openSandboxedPreview(bundle);
    if (!popup) throw new Error('Browser blocked the popup');
    const frame = popup.document.querySelector('iframe');
    report('Popup wrapper severs opener and retains sandbox', popup.opener === null && frame.getAttribute('sandbox') === PREVIEW_SANDBOX);
    const entry = await waitForMessage(popup, frame, message => message.message.startsWith('PROBE:'));
    const probe = JSON.parse(entry.message.slice(6));
    report('Popup student code cannot access parent DOM, storage or cookies', Object.values(probe).every(Boolean), JSON.stringify(probe));
    popup.close();
  } catch (error) { report('Popup check', false, error.message); }
  finally { window.open = original; }
};
`;

const routes = new Map([
  ['/', ['text/html', page]],
  ['/sandbox.js', ['text/javascript', transpile(read('src/lib/preview-sandbox.ts'))]],
  ['/bundlers.js', ['text/javascript', bundlers]],
  ['/checks.js', ['text/javascript', checks]],
]);
const server = createServer((req, res) => {
  const route = routes.get(req.url);
  if (!route) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': route[0], 'Cache-Control': 'no-store' });
  res.end(route[1]);
});
server.listen(0, '127.0.0.1', () => {
  console.log('Preview browser fixture: http://127.0.0.1:' + server.address().port + '/');
});
