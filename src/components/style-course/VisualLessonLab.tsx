'use client';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Braces, Eye, MousePointer2, SlidersHorizontal } from 'lucide-react';

function Lab({ title, description, children }: { title:string; description:string; children:ReactNode }) {
    return <section id="lesson-visual" className="sc-card vl-lab"><div className="vl-heading"><span><SlidersHorizontal size={19}/></span><div><small>LEARN BY SEEING</small><h2>{title}</h2></div><b><span/>Interactive</b></div><p className="vl-intro">{description}</p>{children}</section>;
}
function Code({ children }: { children:string }) { return <pre className="vl-code"><code>{children}</code></pre>; }
function Range({ label, value, min=0, max=40, change }: {label:string;value:number;min?:number;max?:number;change:(value:number)=>void}) {
    return <label className="vl-range"><span>{label}<output>{value}px</output></span><input type="range" aria-label={label} min={min} max={max} value={value} onChange={event=>change(Number(event.target.value))}/></label>;
}

function BorderLab() {
    const [style,setStyle] = useState('solid');
    const [width,setWidth] = useState(4);
    const [radius,setRadius] = useState(16);
    const [color,setColor] = useState('#2563eb');
    const styles = ['none','hidden','dotted','dashed','solid','double','groove','ridge','inset','outset'];
    return <Lab title="One border. Four things you control." description="Style line ka pattern hai, width uski motai, colour uska rang aur radius corners ka roundness. Kisi value ko badlein aur output dekhein.">
        <div className="vl-workbench"><div className="vl-controls"><label>Border style<select value={style} onChange={event=>setStyle(event.target.value)}>{styles.map(value=><option key={value}>{value}</option>)}</select></label><Range label="Border width" value={width} min={1} max={16} change={setWidth}/><Range label="Corner radius" value={radius} max={60} change={setRadius}/><label className="vl-colour">Border colour<input aria-label="Border colour" type="color" value={color} onChange={event=>setColor(event.target.value)}/><code>{color}</code></label></div>
            <div className="vl-output"><small><Eye size={13}/>YOUR LIVE OUTPUT</small><div className="vl-border-stage"><div style={{borderStyle:style as CSSProperties['borderStyle'],borderWidth:width,borderColor:color,borderRadius:radius}}>Your content<br/><span>{style} · {width}px · {radius}px corners</span></div></div><Code>{`.box {\n  border: ${width}px ${style} ${color};\n  border-radius: ${radius}px;\n}`}</Code></div></div>
        <h3 className="vl-subheading">Compare every border style</h3><div className="vl-border-gallery">{styles.map(value=><button type="button" key={value} aria-pressed={style===value} onClick={()=>setStyle(value)}><span style={{border:`5px ${value} #2563eb`}}>{value}</span><code>border-style: {value};</code></button>)}</div><p className="vl-note">For this normal box, <code>none</code> and <code>hidden</code> show no border. They differ when resolving collapsed table borders.</p>
    </Lab>;
}

function BoxLab() {
    const [margin,setMargin] = useState(24);
    const [padding,setPadding] = useState(20);
    const [border,setBorder] = useState(6);
    const box = 160 + 2*padding + 2*border;
    return <Lab title="See the four layers of a CSS box" description="Content sabse andar hai. Padding content ke andar ki spacing, border uski boundary aur margin doosre elements se bahar ka gap hai.">
        <div className="vl-workbench"><div className="vl-controls"><Range label="Margin (outside)" value={margin} min={8} max={40} change={setMargin}/><Range label="Padding (inside)" value={padding} min={8} max={36} change={setPadding}/><Range label="Border thickness" value={border} min={1} max={16} change={setBorder}/><div className="vl-maths"><strong>Rendered box width</strong><b>{box}px</b><span>160 + {padding} × 2 + {border} × 2</span><small>Margin adds {margin*2}px of horizontal space outside this width.</small></div></div><div className="vl-output"><div className="vl-box-legend"><span>Margin</span><span>Border</span><span>Padding</span><span>Content</span></div><div className="vl-box-stage" role="img" aria-label={`Content 160 pixels wide, padding ${padding}, border ${border}, margin ${margin} pixels on each side`}><div className="vl-margin-layer" style={{padding:margin}}><div className="vl-padding-layer" style={{padding,border:`${border}px solid #8b5cf6`}}><div className="vl-content-layer">Content<br/><b>160 × 64px</b></div></div></div></div><Code>{`.box {\n  width: 160px; /* content-box */\n  padding: ${padding}px;\n  border: ${border}px solid #8b5cf6;\n  margin: ${margin}px;\n}`}</Code></div></div><p className="vl-note">With <code>box-sizing: border-box</code>, the declared width includes content, padding and border. Margin stays outside.</p>
    </Lab>;
}

function FlexLab() {
    const [direction,setDirection] = useState('row');
    const [justify,setJustify] = useState('space-between');
    const [align,setAlign] = useState('center');
    const [gap,setGap] = useState(12);
    const column = direction === 'column';
    return <Lab title="Arrange items, then change the axis" description="Flex parent ke andar items arrange hote hain. justify-content main axis par aur align-items cross axis par kaam karta hai. Direction badalne se axes bhi badalte hain.">
        <div className="vl-workbench"><div className="vl-controls"><label>flex-direction<select value={direction} onChange={event=>setDirection(event.target.value)}><option>row</option><option>column</option></select></label><label>justify-content<select value={justify} onChange={event=>setJustify(event.target.value)}>{['flex-start','center','flex-end','space-between','space-around','space-evenly'].map(value=><option key={value}>{value}</option>)}</select></label><label>align-items<select value={align} onChange={event=>setAlign(event.target.value)}>{['flex-start','center','flex-end','stretch'].map(value=><option key={value}>{value}</option>)}</select></label><Range label="Gap" value={gap} max={32} change={setGap}/></div><div className="vl-output"><div className="vl-axis"><ArrowRight size={16} style={{transform:column?'rotate(90deg)':undefined}}/><span>Main axis: {column?'vertical':'horizontal'}</span><small>Cross axis: {column?'horizontal':'vertical'}</small></div><div className="vl-flex-stage" style={{flexDirection:direction as CSSProperties['flexDirection'],justifyContent:justify,alignItems:align,gap}}>{['1','2','3'].map(value=><div key={value}>{value}</div>)}</div><Code>{`.parent {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  gap: ${gap}px;\n}`}</Code></div></div>
    </Lab>;
}

const selectors = [
    {value:'.card p', label:'Descendant', explanation:'Card ke andar jitne bhi paragraphs hain, sab select honge.', matches:['child','nested']},
    {value:'.card > p', label:'Direct child', explanation:'Sirf card ka direct paragraph child select hoga. Nested paragraph select nahi hoga.', matches:['child']},
    {value:'#intro', label:'ID', explanation:'id="intro" wala element select hoga.', matches:['child']},
    {value:'.note', label:'Class', explanation:'Jis element par class="note" hai, wahi select hoga.', matches:['nested','outside']},
    {value:'section + p', label:'Adjacent sibling', explanation:'Section ke turant baad usi parent ka paragraph select hoga.', matches:['outside']},
    {value:'.note.highlight', label:'Two classes together', explanation:'Dono classes ek hi element par honi chahiye. Beech mein space nahi hai.', matches:['nested']},
];
function SelectorLab() {
    const [selected,setSelected] = useState(0);
    const item = selectors[selected];
    const node = (id:string, children:ReactNode) => <div className={item.matches.includes(id)?'vl-tree-node is-match':'vl-tree-node'}><code>{children}</code><span>{item.matches.includes(id)?'Selected':'Not selected'}</span></div>;
    return <Lab title="Which elements does the selector choose?" description="Selector par click karein. Coloured elements par CSS apply hogi; baaki elements unchanged rahenge."><div className="vl-selector-tabs">{selectors.map((entry,index)=><button type="button" aria-pressed={selected===index} key={entry.value} onClick={()=>setSelected(index)}><code>{entry.value}</code><span>{entry.label}</span></button>)}</div><div className="vl-selector-demo"><div className="vl-tree-parent"><code>{'<section class="card">'}</code>{node('child','<p id="intro">Direct child</p>')}<div className="vl-tree-parent"><code>&lt;div&gt;</code>{node('nested','<p class="note highlight">Nested child</p>')}<code>&lt;/div&gt;</code></div><code>&lt;/section&gt;</code></div>{node('outside','<p class="note">Following sibling</p>')}</div><p className="vl-answer"><MousePointer2 size={16}/>{item.explanation}</p><Code>{`${item.value} {\n  color: #1d4ed8;\n  background-color: #dbeafe;\n}`}</Code></Lab>;
}

function SyntaxLab({ methods=false }: {methods?:boolean}) {
    return <Lab title={methods?'Three places to write the same CSS':'Read a CSS rule in three parts'} description={methods?'Inline, internal aur external CSS style likhne ki alag jagah hain. Neeche har method ka complete example diya hai.':'Selector element choose karta hai, property batati hai kya badlega aur value batati hai kitna ya kaisa badlega.'}>
        {methods?<div className="vl-methods"><article><span>01</span><h3>Inline</h3><code>{'<p style="color: blue">'}</code><p>Inside the HTML element</p><b>One element</b></article><article><span>02</span><h3>Internal</h3><code>&lt;style&gt; p {'{ color: blue; }'}</code><p>Inside the HTML head</p><b>One HTML page</b></article><article><span>03</span><h3>External</h3><code>style.css <ArrowRight size={12}/> index.html</code><p>{'Linked with <link rel="stylesheet">'}</p><b>Many HTML pages</b></article></div>:<div className="vl-syntax" role="img" aria-label="CSS rule: p is the selector, color is the property, blue is the value"><span><code>p</code><b>Selector</b><small>Which element?</small></span><em>{'{'}</em><span><code>color:</code><b>Property</b><small>What changes?</small></span><span><code>blue;</code><b>Value</b><small>Which colour?</small></span><em>{'}'}</em></div>}
        <div className="vl-syntax-output"><Braces size={18}/><span>CSS tells the browser how to display the HTML.</span><p style={{color:'blue'}}>This paragraph is blue.</p></div>
    </Lab>;
}

function W3ClassLab({ lesson }: { lesson:string }) {
    const options = lesson.includes('border') ? ['w3-border w3-border-blue','w3-leftbar w3-border-green','w3-border w3-round-large'] : lesson.includes('font-size') ? ['w3-small','w3-xlarge','w3-xxxlarge'] : lesson.includes('text-classes') ? ['w3-left-align','w3-center','w3-right-align'] : ['w3-blue','w3-green','w3-pale-yellow'];
    const [selected,setSelected] = useState(options[0]);
    return <Lab title="Change the class. See the design change." description="W3.CSS ki stylesheet mein styles pehle se likhe hain. HTML ke class attribute mein naam badlein aur output compare karein."><div className="vl-selector-tabs">{options.map(value=><button type="button" key={value} aria-pressed={selected===value} onClick={()=>setSelected(value)}><code>{value}</code></button>)}</div><div className="sc-rich-source sc-source-w3css vl-w3-stage"><div className={`w3-panel w3-padding ${selected}`}>Your W3.CSS example</div></div><Code>{`<div class="w3-panel w3-padding ${selected}">\n  Your W3.CSS example\n</div>`}</Code><p className="vl-note">The stylesheet is already included in these examples. Your own page needs the W3.CSS stylesheet link in its head.</p></Lab>;
}

export default function VisualLessonLab({ course, lesson }: {course:'css'|'w3css';lesson:string}) {
    if (course==='w3css' && ['what-is-a-web-framework','how-to-use-w3-css','w3-css-classes-colors-and-hover-effects','w3-css-border-classes','w3-css-font-size-classes','w3-css-text-classes'].includes(lesson)) return <W3ClassLab key={lesson} lesson={lesson}/>;
    if (lesson==='border-properties') return <BorderLab/>;
    if (['css-box-model-comprehensive-guide','box-sizing'].includes(lesson)) return <BoxLab/>;
    if (lesson==='display-flex') return <FlexLab/>;
    if (lesson==='css-selectors') return <SelectorLab/>;
    if (lesson==='three-ways-to-insert-css') return <SyntaxLab methods/>;
    if (['what-is-css','css-syntax'].includes(lesson)) return <SyntaxLab/>;
    return null;
}
