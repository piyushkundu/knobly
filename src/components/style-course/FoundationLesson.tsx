'use client';
import { Fragment, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check, CheckCircle2, Code2, Copy, FileCode2, Globe2, Layers, Lightbulb, MousePointer2, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { CSS_MILESTONES, SELECTOR_LESSONS, SELECTOR_ROWS, winningTeachingRule, type TeachingRule } from '@/lib/css-foundation-examples';

function ChapterBlock({ title, eyebrow='BUILD YOUR UNDERSTANDING', children }: {title:string;eyebrow?:string;children:ReactNode}) {
    return <section className="sc-card fy-block"><div className="fy-block-title"><span><Lightbulb size={20}/></span><div><small>{eyebrow}</small><h2>{title}</h2></div></div>{children}</section>;
}
function Snippet({ code, label='CSS example' }: {code:string;label?:string}) {
    const [copied,setCopied]=useState(false);
    return <div className="fy-code"><div><span><Code2 size={12}/>{label}</span><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);}catch{setCopied(false);}}}>{copied?<Check size={12}/>:<Copy size={12}/>} {copied?'Copied':'Copy'}</button></div><pre><code>{code}</code></pre></div>;
}
function Takeaway({ children }: {children:ReactNode}) { return <div className="fy-takeaway"><CheckCircle2 size={18}/><div>{children}</div></div>; }

function WhatCss() {
    const [styled,setStyled]=useState(false);
    return <ChapterBlock title="HTML gives content. CSS gives it a design.">
        <p className="fy-lead"><strong>CSS = Cascading Style Sheets.</strong> CSS browser ko batati hai ki HTML ka content kaisa dikhna chahiye—colour, font, spacing, border, background aur layout.</p>
        <div className="fy-role-grid"><div><Code2/><h3>HTML</h3><b>Structure & meaning</b><p>Heading, paragraph, image aur button banata hai.</p><code>&lt;h2&gt;Study Club&lt;/h2&gt;</code></div><div><Palette/><h3>CSS</h3><b>Appearance & layout</b><p>Un elements ka colour, size aur position set karta hai.</p><code>h2 {'{ color: blue; }'}</code></div><div><MousePointer2/><h3>JavaScript</h3><b>Behaviour</b><p>Click par menu kholna ya content update karna.</p><code>button.addEventListener(...)</code></div></div>
        <div className="fy-demo-heading"><div><h3>Same HTML. Try adding the CSS.</h3><p>Button dabayein: content same rahega, design badlega.</p></div><button type="button" className={styled?'fy-toggle is-on':'fy-toggle'} aria-pressed={styled} onClick={()=>setStyled(value=>!value)}><Sparkles size={14}/>CSS {styled?'ON':'OFF'}</button></div>
        <div className="fy-before-after"><div className="fy-mini-browser"><div><i/><i/><i/><span>index.html</span></div><section className={styled?'fy-study-card is-styled':'fy-study-card'}><span>YOUR FIRST WEB PAGE</span><h3>Study Club</h3><p>Learn one new idea every day.</p><button type="button">Explore courses</button></section></div><div><Snippet label="HTML: the content" code={'<section class="study-card">\n  <h2>Study Club</h2>\n  <p>Learn one new idea every day.</p>\n  <button>Explore courses</button>\n</section>'}/><Snippet label={styled?'CSS: currently applied':'CSS: switch it on to see the result'} code={'.study-card {\n  padding: 28px;\n  border-radius: 18px;\n  background: #eff6ff;\n}\n.study-card h2 { color: #2563eb; }'}/></div></div>
        <div className="fy-browser-flow"><span><FileCode2/>HTML content</span><ArrowRight/><span><Palette/>CSS rules</span><ArrowRight/><span><Globe2/>Browser output</span></div><Takeaway><strong>Pehle element banta hai, phir CSS usse style karti hai.</strong> CSS se text ki meaning change nahi hoti; presentation change hoti hai.</Takeaway>
    </ChapterBlock>;
}

function History() {
    const [selected,setSelected]=useState(0);
    const milestone=CSS_MILESTONES[selected];
    return <ChapterBlock title="Why CSS was created—and how it grew" eyebrow="THE STORY OF CSS">
        <p className="fy-lead">Web pages badhne par har heading aur paragraph ka design HTML ke andar baar-baar likhna mushkil tha. CSS ne content aur presentation ko alag rakhne ka standard tareeka diya.</p>
        <div className="fy-history-problem"><div><span>THE PROBLEM</span><h3>Many pages, repeated styling</h3><p>20 pages ki headings ka colour badalna ho to har jagah individual style edit karni pad sakti thi.</p><div className="fy-paper-stack"><FileCode2/><FileCode2/><FileCode2/><b>20 pages</b></div></div><ArrowRight/><div><span>THE IDEA</span><h3>One stylesheet, reusable rules</h3><p>Pages ko ek common CSS file se link karein. Ek rule update karne par usse linked pages ka design update ho sakta hai.</p><div className="fy-css-file"><Palette size={20}/><code>styles.css</code><ArrowRight/><span>Page 1 · Page 2 · Page 3</span></div></div></div>
        <h3 className="fy-section-label">Explore the timeline</h3><p className="fy-helper">Kisi milestone ko select karke uska meaning padhein.</p><div className="fy-history-timeline">{CSS_MILESTONES.map((item,index)=><button type="button" key={item.year} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{item.year}</span><i/><strong>{item.title}</strong></button>)}</div>
        <div className="fy-history-detail" key={milestone.year} aria-live="polite"><span>{milestone.year}</span><div><h3>{milestone.title}</h3><p>{milestone.detail}</p><b>{milestone.takeaway}</b></div></div>
        <div className="fy-module-map"><div><Layers size={22}/><h3>Modern CSS develops in modules</h3><p>Ek team layout par aur doosri colour ya selectors par kaam kar sakti hai. Har module apne pace par aage badhta hai.</p></div><div>{['Selectors','Colours','Flexbox','Grid','Media queries','Custom properties','Transforms','Animations'].map(item=><span key={item}>{item}</span>)}</div></div>
        <Takeaway><strong>History ko aise yaad rakhein:</strong> 1994 idea → 1996 CSS1 → 1998 CSS2 → modules. CSS 2.1 ka Recommendation 2011 mein aaya. Saari CSS3 features ek saath 2011 mein release nahi hui thi.</Takeaway>
        <p className="fy-sources">History references: <a href="https://www.w3.org/Style/CSS20/" target="_blank" rel="noopener noreferrer">W3C CSS timeline</a> · <a href="https://www.w3.org/standards/history/CSS2/" target="_blank" rel="noopener noreferrer">CSS 2.1 publication history</a> · <a href="https://www.w3.org/Style/CSS/specs.en.html" target="_blank" rel="noopener noreferrer">CSS modules</a></p>
    </ChapterBlock>;
}

function Characteristics() {
    const [colour,setColour]=useState('#2563eb');
    const [narrow,setNarrow]=useState(false);
    return <ChapterBlock title="One rule can improve many elements">
        <p className="fy-lead">CSS ki strength sirf decoration nahi hai. Reusable rules se consistency milti hai aur ek change ko multiple places par apply kar sakte hain.</p>
        <div className="fy-colour-controls"><strong>Change one shared rule</strong>{['#2563eb','#7c3aed','#059669','#e11d48'].map(value=><button key={value} type="button" aria-label={`Use ${value} theme`} aria-pressed={colour===value} style={{background:value}} onClick={()=>setColour(value)}>{colour===value&&<Check size={13}/>}</button>)}</div>
        <div className="fy-reuse-grid">{['Course overview','Lesson page','Practice project'].map((title,index)=><div key={title} style={{'--fy-demo-colour':colour} as CSSProperties}><span>PAGE 0{index+1}</span><h3>{title}</h3><p>All three headings use the same class.</p><code>{'class="page-title"'}</code></div>)}</div><Snippet code={`.page-title {\n  color: ${colour};\n}`}/>
        <div className="fy-explanation-grid"><div><h3>Reusable</h3><p>Ek class ko multiple elements par laga sakte hain.</p></div><div><h3>Consistent</h3><p>Buttons, headings aur cards ka design common rehta hai.</p></div><div><h3>Maintainable</h3><p>Shared stylesheet mein edit karke linked pages ko update kar sakte hain.</p></div><div><h3>Responsive</h3><p>Screen space ke hisaab se layout adapt kar sakte hain.</p></div></div>
        <div className="fy-demo-heading"><div><h3>Try a narrow layout</h3><p>Same content ko kam space dene par cards wrap honge.</p></div><button type="button" className="fy-small-button" aria-pressed={narrow} onClick={()=>setNarrow(value=>!value)}>{narrow?'Use wider space':'Use narrow space'}</button></div><div className="fy-responsive-stage"><div style={{maxWidth:narrow?240:700}}>{['Read','Try','Build'].map(item=><span key={item}>{item}</span>)}</div></div><Takeaway>CSS files browser mein cache ho sakti hain, jisse repeat visits par downloads kam ho sakte hain. Offline availability caching aur application setup par depend karti hai.</Takeaway>
    </ChapterBlock>;
}

const METHOD_EXAMPLES = [
    {name:'Inline',where:'Opening HTML tag ke style attribute mein.',scope:'Ek element',files:[{label:'index.html',code:'<p style="color: blue; font-size: 20px;">\n  Learning CSS\n</p>'}],hint:'style attribute mein selector aur outer braces nahi likhte. Sirf declarations hoti hain.'},
    {name:'Internal',where:'Isi HTML page ke <head> mein <style> element.',scope:'Ek HTML page',files:[{label:'index.html',code:'<!doctype html>\n<html>\n<head>\n  <style>\n    p { color: blue; font-size: 20px; }\n  </style>\n</head>\n<body>\n  <p>Learning CSS</p>\n</body>\n</html>'}],hint:'<style> ke andar proper CSS rule likhte hain: selector, braces aur declarations.'},
    {name:'External',where:'Alag CSS file ko HTML ke <head> mein link karein.',scope:'Multiple linked HTML pages',files:[{label:'index.html',code:'<head>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <p>Learning CSS</p>\n</body>'},{label:'styles.css',code:'p {\n  color: blue;\n  font-size: 20px;\n}'}],hint:'href ka filename/path actual file se match hona chahiye. CSS file mein <style> tag nahi likhte.'},
] as const;
function Methods() {
    const [selected,setSelected]=useState(0);
    const method=METHOD_EXAMPLES[selected];
    return <ChapterBlock title="Where do you write the CSS?">
        <p className="fy-lead">Teen methods same style apply kar sakte hain. Farq yeh hai ki CSS kahan rakhi hai aur usse kitne elements/pages share kar sakte hain.</p>
        <div className="fy-choice-tabs" role="group" aria-label="CSS insertion methods">{METHOD_EXAMPLES.map((item,index)=><button key={item.name} type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>0{index+1}</span>{item.name}</button>)}</div><div className="fy-method-workspace"><div><h3>{method.name} CSS</h3><p>{method.where}</p><span className="fy-scope-badge"><Layers size={12}/>{method.scope}</span>{method.files.map(file=><Snippet key={file.label} label={file.label} code={file.code}/>)}</div><div className="fy-method-output"><span>EXPECTED OUTPUT</span><p>Learning CSS</p><small>Blue text · 20px font size</small><div><Lightbulb size={16}/>{method.hint}</div></div></div>
        <div className="fy-warning"><strong>Common confusion</strong><p>External CSS hamesha low priority aur internal CSS hamesha high priority nahi hoti. Normal internal/external rules ke beech matching, specificity aur source order matter karte hain. Selectors ke baad Priorities of CSS chapter mein cascade dekhein.</p></div>
    </ChapterBlock>;
}

const INITIAL_RULES: TeachingRule[] = [
    {id:'element',selector:'p',colour:'#059669',specificity:[0,0,0,1],order:1,enabled:true},
    {id:'class',selector:'.note',colour:'#2563eb',specificity:[0,0,1,0],order:2,enabled:true},
    {id:'id',selector:'#intro',colour:'#7c3aed',specificity:[0,1,0,0],order:3,enabled:true},
    {id:'later-id',selector:'#intro',colour:'#ea580c',specificity:[0,1,0,0],order:4,enabled:false},
    {id:'inline',selector:'style attribute',colour:'#e11d48',specificity:[1,0,0,0],order:5,enabled:false},
];
function Cascade() {
    const [rules,setRules]=useState(INITIAL_RULES);
    const winner=winningTeachingRule(rules);
    const change=(id:string,field:'enabled'|'important',value:boolean)=>setRules(previous=>previous.map(rule=>rule.id===id?{...rule,[field]:value}:rule));
    return <ChapterBlock title="When several rules match, which one wins?" eyebrow="UNDERSTAND THE CASCADE">
        <p className="fy-lead">Ek paragraph par multiple rules match kar sakti hain. Browser har property ke liye winning declaration choose karta hai. Yahan sab rules same author origin aur same layer mein hain.</p>
        <div className="fy-cascade-steps"><div><span>1</span><b>Does it match?</b><p>Selector ko element match karna chahiye.</p></div><ArrowRight/><div><span>2</span><b>Importance</b><p>Is lab mein important declarations normal declarations se upar hain.</p></div><ArrowRight/><div><span>3</span><b>Specificity</b><p>Normal inline → ID → class → element.</p></div><ArrowRight/><div><span>4</span><b>Source order</b><p>Baaki sab equal ho to later declaration jeetti hai.</p></div></div>
        <Snippet label="All these selectors match this paragraph" code={'<p id="intro" class="note">Which colour wins?</p>'}/><div className="fy-cascade-lab"><div className="fy-rule-list">{rules.map(rule=><div key={rule.id} className={winner?.id===rule.id?'fy-rule is-winner':'fy-rule'}><label><input type="checkbox" checked={rule.enabled} onChange={event=>change(rule.id,'enabled',event.target.checked)}/><code>{rule.selector}</code>{rule.id==='later-id'&&<small>later rule</small>}</label><i style={{background:rule.colour}}/><label className="fy-important"><input type="checkbox" checked={!!rule.important} onChange={event=>change(rule.id,'important',event.target.checked)}/><code>!important</code></label>{winner?.id===rule.id&&<span><Check size={11}/>Wins</span>}</div>)}</div><div className="fy-winner-output" aria-live="polite"><span>YOUR PARAGRAPH</span><p style={{color:winner?.colour||'#334155'}}>Which colour wins?</p><strong>{winner?`${winner.selector}${winner.important?' !important':''}`:'No active rule — inherited colour'}</strong><small>Enable/disable rules and try an important declaration.</small><button className="fy-small-button" type="button" onClick={()=>setRules(INITIAL_RULES)}><RotateCcw size={12}/>Reset rules</button></div></div>
        <Snippet label="Enabled declarations, in source order" code={rules.filter(rule=>rule.enabled).map(rule=>rule.id==='inline'?`<!-- On the paragraph: style="color: ${rule.colour}${rule.important?' !important':''}" -->`:`${rule.selector} { color: ${rule.colour}${rule.important?' !important':''}; }`).join('\n')||'/* No colour declarations enabled. */'}/>
        <Takeaway><strong>Try this:</strong> enable the later ID rule to see source order. Then make the element rule important. Finally enable an inline style and compare normal vs important declarations.</Takeaway><p className="fy-helper">The full cascade also accounts for origins, cascade layers, animations and transitions. This controlled example isolates importance, specificity and order so you can learn them one step at a time.</p>
    </ChapterBlock>;
}

function Syntax() {
    const [size,setSize]=useState(24);
    const [colour,setColour]=useState('#2563eb');
    return <ChapterBlock title="Build a valid rule, one declaration at a time">
        <p className="fy-lead"><code>selector {'{ property: value; }'}</code> ek CSS rule ka basic format hai. Braces declarations ko group karte hain; colon property/value ko separate karta hai; semicolon declarations ko separate karta hai.</p>
        <div className="fy-syntax-anatomy"><div><b>p</b><span>Selector</span><small>Which element?</small></div><em>{'{'}</em><div><b>font-size</b><span>Property</span><small>What changes?</small></div><em>:</em><div><b>{size}px</b><span>Value</span><small>What setting?</small></div><em>;</em><em>{'}'}</em></div>
        <div className="fy-syntax-controls"><label>font-size <output>{size}px</output><input type="range" aria-label="Syntax font size" min={14} max={38} value={size} onChange={event=>setSize(Number(event.target.value))}/></label><label>color<select aria-label="Syntax text colour" value={colour} onChange={event=>setColour(event.target.value)}><option value="#2563eb">Blue</option><option value="#7c3aed">Purple</option><option value="#059669">Green</option></select></label></div>
        <div className="fy-syntax-result"><p style={{fontSize:size,color:colour}}>Change the value. Watch the text.</p></div><Snippet code={`p {\n  font-size: ${size}px;\n  color: ${colour};\n}`}/><div className="fy-explanation-grid"><div><h3>Correct property name</h3><p>Use <code>font-size</code>, with a hyphen. <code>fontsize</code> is a different, invalid name.</p></div><div><h3>Correct value</h3><p>A size such as <code>24px</code> needs its unit. A colour can be a name or a valid colour value.</p></div><div><h3>Separate declarations</h3><p>Use a semicolon between declarations. Keeping the final semicolon makes editing easier.</p></div><div><h3>CSS comments</h3><p>Write <code>{'/* a comment */'}</code>. CSS comment syntax differs from an HTML comment.</p></div></div>
    </ChapterBlock>;
}

function Selectors() {
    const [selected,setSelected]=useState(0);
    const [hovered,setHovered]=useState(false);
    const [focused,setFocused]=useState(false);
    const item=SELECTOR_LESSONS[selected];
    const matches=(id:string)=>(item.matches as readonly string[]).includes(id)&&(item.selector!=='a:hover'||hovered)&&(item.selector!=='a:focus'||focused);
    return <ChapterBlock title="Selectors: point CSS at the right elements" eyebrow="THE SELECTOR EXPLORER">
        <p className="fy-lead">Selector ek condition hai: kaunse HTML elements par rule apply hoga? Neeche valid selector choose karein. Matching elements highlight honge aur count bhi badlega.</p>
        <div className="fy-selector-explorer"><div className="fy-selector-list" role="group" aria-label="Selector examples">{SELECTOR_LESSONS.map((entry,index)=><button type="button" key={entry.selector} aria-pressed={selected===index} onClick={()=>{setSelected(index);setHovered(false);setFocused(false);}}><code>{entry.selector}</code><span>{entry.name}</span></button>)}</div><div className="fy-selector-main"><div className="fy-selector-explanation" aria-live="polite"><span>{item.category}</span><h3>{item.name}</h3><code>{item.selector}</code><p>{item.meaning}</p><small>{item.rule}</small></div><div className="fy-match-count"><MousePointer2 size={13}/>{SELECTOR_ROWS.filter(row=>matches(row.id)).length} matching elements in this example</div><div className="fy-dom-tree" aria-label="Example HTML with selector matches">{SELECTOR_ROWS.map(row=><Fragment key={row.id}><div className={matches(row.id)?'fy-dom-row is-match':'fy-dom-row'} style={{marginLeft:row.depth*14}}><code>{row.markup}</code>{row.id==='link'?<a href="https://example.com" onClick={event=>event.preventDefault()} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}>Hover / focus this link</a>:<span>{matches(row.id)?'Selected':'—'}</span>}</div>{row.id==='deep'&&<><div className="fy-dom-row fy-dom-close" style={{marginLeft:14}}><code>&lt;/section&gt;</code></div><div className="fy-dom-row fy-dom-close"><code>&lt;/div&gt;</code></div></>}{row.id==='three'&&<div className="fy-dom-row fy-dom-close"><code>&lt;/ul&gt;</code></div>}</Fragment>)}</div><Snippet label="Apply this rule to the matching elements" code={`${item.selector} {\n  color: #1d4ed8;\n  background-color: #dbeafe;\n}`}/></div></div>
        <h3 className="fy-section-label">Four symbols that change the meaning</h3><div className="fy-selector-symbols"><div><b>,</b><h4>OR / group</h4><code>h2, p</code><p>Heading aur paragraphs.</p></div><div><b>space</b><h4>Inside, any depth</h4><code>.card p</code><p>Direct aur nested paragraphs.</p></div><div><b>&gt;</b><h4>Direct child</h4><code>.card &gt; p</code><p>Sirf ek level neeche.</p></div><div><b>+ / ~</b><h4>Following siblings</h4><code>.card + p</code><p>Same parent; + immediate, ~ all matching later siblings.</p></div></div>
        <Takeaway><strong>Dot, hash aur space ko dhyan se dekhein.</strong> <code>.note</code> class hai; <code>#note</code> ID hai. <code>.note.highlight</code> ek element par dono classes maangta hai; <code>.note .highlight</code> descendant relationship maangta hai.</Takeaway>
        <h3 className="fy-section-label">Pseudo-class vs pseudo-element</h3><div className="fy-explanation-grid"><div><h3><code>:hover</code> / <code>:focus</code></h3><p>Pseudo-class element ki state ya position check karti hai. Hover pointer ki state hai; focus keyboard/click selection ki state hai. Dono ko same na samjhein.</p></div><div><h3><code>::first-letter</code></h3><p>Pseudo-element element ke ek part ko style karta hai. Is paragraph ka first letter dekhein:</p><p className="fy-first-letter">Learning CSS starts with small experiments.</p></div></div><Snippet label="Style only the first letter of a paragraph" code={'p::first-letter {\n  color: #2563eb;\n  font-size: 2em;\n  font-weight: bold;\n}'}/>
        <div className="fy-warning"><strong>Selectors do not edit the HTML.</strong><p>Matching elements par declarations apply hoti hain. Agar selector kisi element ko match nahi karta, browser us rule ko us element par apply nahi karega. Class aur ID ke names HTML se exactly match hone chahiye.</p></div>
    </ChapterBlock>;
}

const CHECKS:Record<string,{question:string;options:string[];answer:number;why:string}>={
    'what-is-css':{question:'Heading ka colour badalna hai. Kaunsi technology use hogi?',options:['HTML structure','CSS styling','A database'],answer:1,why:'CSS presentation control karti hai. HTML heading ka structure/meaning deta hai.'},
    'evolution-of-css':{question:'Kya saari CSS3 features ek single 2011 release ka hissa thin?',options:['Yes','No, modern CSS develops in modules'],answer:1,why:'CSS modules independently develop hote hain. 2011 CSS 2.1 Recommendation ka milestone hai.'},
    'characteristics-of-css':{question:'Same class ko 3 pages par style karna hai. Kya common external stylesheet use kar sakte hain?',options:['Yes','No, every style must be repeated inline'],answer:0,why:'Har page common CSS file link kar sakta hai; us file ka reusable rule sab matching elements par lagega.'},
    'three-ways-to-insert-css':{question:'External stylesheet link karne ke liye kaunsa element use hota hai?',options:['<style href="styles.css">','<link rel="stylesheet" href="styles.css">','<css src="styles.css">'],answer:1,why:'HTML head mein link element stylesheet file ka path deta hai.'},
    'priorities-of-css':{question:'Same origin/layer mein normal #intro aur .note dono match karte hain. Higher specificity kiski hai?',options:['.note','#intro','Always the first rule'],answer:1,why:'Normal ID selector ki specificity class selector se higher hoti hai. Importance/layers equal hone ki condition yaad rakhein.'},
    'css-syntax':{question:'Valid declaration kaunsi hai?',options:['font-size = 24px','font-size: 24px;','font size: 24;'],answer:1,why:'Property aur value ke beech colon aur declarations ke beech semicolon hota hai. font-size ka naam hyphen ke saath hai.'},
    'css-selectors':{question:'.card > p nested section ke andar wale paragraph ko bhi select karega?',options:['Yes, every descendant','No, only direct children'],answer:1,why:'> direct children ko match karta hai. Space wala .card p deeper descendants ko bhi match karta hai.'},
};
function KnowledgeCheck({ lesson }: {lesson:string}) {
    const [answer,setAnswer]=useState<number>();
    const check=CHECKS[lesson];
    return <section className="sc-card fy-knowledge-check"><span><CheckCircle2 size={15}/>QUICK CHECK</span><h3>{check.question}</h3><div>{check.options.map((option,index)=><button type="button" key={option} aria-pressed={answer===index} className={answer===index?(index===check.answer?'is-correct':'is-incorrect'):''} onClick={()=>setAnswer(index)}>{option}</button>)}</div>{answer!==undefined&&<p role="status"><strong>{answer===check.answer?'Correct.':'Try again.'}</strong> {check.why}</p>}</section>;
}

export default function FoundationLesson({ lesson }: {lesson:string}) {
    const components:Record<string,()=>ReactNode>={'what-is-css':WhatCss,'evolution-of-css':History,'characteristics-of-css':Characteristics,'three-ways-to-insert-css':Methods,'priorities-of-css':Cascade,'css-syntax':Syntax,'css-selectors':Selectors};
    const Content=components[lesson];
    if (!Content) return null;
    return <div className="fy-foundation"><Content/><KnowledgeCheck lesson={lesson}/></div>;
}
