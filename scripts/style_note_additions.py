"""Authored clarifications and visual examples after reviewing all 45 CSS PDF pages.

Keep original source nodes; append the note topics that were not explained there.
The notes contain a few invalid declarations, so these examples use valid CSS.
"""
from bs4 import BeautifulSoup
from html import escape

def code(value):
    return '<pre>'+escape(value)+'</pre>'

def section(title, pages, explanation, content):
    return '<div class="note-addition"><span class="notes-page">Handwritten PDF · pages '+pages+'</span><h2>'+title+'</h2><p>'+explanation+'</p>'+content+'</div>'

def extend_css_notes(lessons, nodes, examples):
    additions = {}
    additions['css-selectors'] = section('Using more than one class', '8–9', 'Ek element par multiple classes ho sakti hain. .card.note dono classes wale ek hi element ko select karta hai; .card .note kisi descendant ko.',
        '<div class="note-compare"><div><div class="note-swatch" style="border:3px solid #2563eb;background:#dbeafe">class="card note"</div><strong>Both classes on one element</strong>'+code('.card.note { border: 3px solid #2563eb; }')+'</div><div><div class="note-swatch" style="background:#fef3c7">Parent .card → child .note</div><strong>A descendant inside the card</strong>'+code('.card .note { background: #fef3c7; }')+'</div></div>')

    sides = ['top','right','bottom','left']
    side_rows = ''.join('<tr><td><code>'+family+'-'+side+'</code></td><td>'+meaning+'</td><td><code>'+family+'-'+side+': '+str((index+1)*8)+'px;</code></td></tr>' for family,meaning in [('margin','Space outside this side of the border'),('padding','Space between this side and the content')] for index,side in enumerate(sides))
    additions['css-box-model-comprehensive-guide'] = section('Margin and padding: every side', '24–26', 'Top, right, bottom aur left ko alag set kar sakte hain. Padding element ke background ke andar hoti hai. Margin doosre elements se distance banata hai.',
        '<table><tr><th>Property</th><th>What changes?</th><th>Example</th></tr>'+side_rows+'</table><h3>Read shorthand clockwise</h3><p>Four values ka order: top → right → bottom → left. Two values: top/bottom, phir left/right.</p>'+code('.box {\n  margin: 8px 16px 24px 32px;\n  padding: 10px 20px;\n}\n/* margin: 12px;       all four sides */\n/* margin: 8px 16px;   vertical, horizontal */\n/* margin: 8px 16px 24px; top, horizontal, bottom */')+'<p>Negative margin allowed ho sakta hai; negative padding invalid hai. Vertical margins of normal block elements can collapse. Flex/grid items behave differently.</p>')

    border_rows=''.join('<tr><td><code>border-'+side+'-width</code></td><td>Thickness of the '+side+' edge</td><td><code>border-'+side+'-width: 4px;</code></td></tr>' for side in sides)
    additions['border-properties'] = section('Individual sides: width, style and colour', '12–13, 26–27', 'Har side ka shorthand aur longhand dono likh sakte hain. Border width px, em ya thin/medium/thick ho sakti hai; percentage valid border-width nahi hai.',
        '<table><tr><th>Longhand</th><th>Meaning</th><th>Valid example</th></tr>'+border_rows+'</table><div class="note-compare">'+''.join('<div><div class="note-swatch" style="border-'+side+':6px solid #2563eb">'+side.title()+' side</div>'+code('.box {\n  border-'+side+': 6px solid #2563eb;\n  /* Or set the three longhands: */\n  border-'+side+'-width: 6px;\n  border-'+side+'-style: solid;\n  border-'+side+'-color: #2563eb;\n}')+'</div>' for side in sides)+'</div><h3>Width shorthand</h3>'+code('border-width: 2px 4px 6px 8px;\n/* top, right, bottom, left */')+'<p>A width or colour alone does not create a visible border when border-style is none.</p>')

    additions['display-property'] = section('Width, height, float and clear', '28', 'Width aur height size set karte hain. Float ke paas text wrap hota hai; clear se following content float ke side mein aane se roka ja sakta hai.',
        '<div class="note-compare"><div><h3>Fixed vs relative width</h3><div class="note-swatch" style="width:140px">140px</div><div class="note-swatch" style="width:75%;background:#dcfce7">75% of parent</div>'+code('.fixed-size { width: 140px; height: 70px; }\n.relative-size { width: 75%; height: auto; }')+'</div><div><h3>Float: text flows alongside</h3><div style="display:flow-root;background:#f8fafc;padding:12px"><div style="float:left;width:72px;height:64px;background:#2563eb;color:white;margin:0 12px 8px 0;text-align:center;padding:16px 4px">Image</div><p>Text wraps beside the floated image. Once the image ends, text uses the available width.</p><p style="clear:both;background:#dcfce7;padding:10px">clear: both — starts below the float.</p></div>'+code('.image { float: left; margin-right: 12px; }\n.next-section { clear: both; }\n.parent { display: flow-root; }')+'</div></div><table><tr><th>Property</th><th>Values</th><th>Remember</th></tr><tr><td>width / height</td><td>px, %, auto</td><td>Percentage height needs a definite containing-block height in the usual case.</td></tr><tr><td>float</td><td>left, right, none</td><td>Useful for wrapping text around an image.</td></tr><tr><td>clear</td><td>left, right, both, none</td><td>Move following content below the selected floats.</td></tr></table><p>Modern page layouts usually use Flexbox or Grid; float is still useful for text wrapping.</p>')

    additions['font-properties'] = section('Font variant, font size and the font shorthand', '19–20', 'font-variant: small-caps se small capital letters milte hain. font-weight thickness badalta hai; font-size text ka size badalta hai. Notes mein in dono ke examples ko mix na karein.',
        '<div class="note-compare"><div><div class="note-swatch">Learning CSS</div>'+code('font-variant: normal;')+'</div><div><div class="note-swatch" style="font-variant:small-caps">Learning CSS</div>'+code('font-variant: small-caps;')+'</div></div><table><tr><th>Property</th><th>What changes?</th><th>Example</th></tr><tr><td>font-size</td><td>Size of the text</td><td>font-size: 24px;</td></tr><tr><td>font-weight</td><td>Thickness of the strokes</td><td>font-weight: 700;</td></tr><tr><td>font-variant</td><td>Small-cap presentation</td><td>font-variant: small-caps;</td></tr></table><h3>Combine font settings</h3>'+code('.intro {\n  font: italic small-caps 700 20px/1.6 Georgia, serif;\n}\n/* style, variant, weight, size/line-height, family */')+'<p>Font size and family are required in the font shorthand. Keep fallback families at the end.</p>')

    additions['text-properties'] = section('Vertical alignment and text colour', '20, 22–23', 'vertical-align inline elements aur table cells ke liye hai. Flex items ko align karne ke liye align-items use karein.',
        '<div class="note-compare">'+''.join('<div><p style="font-size:22px;line-height:2">Text <span style="vertical-align:'+value+';font-size:12px;background:#dbeafe;padding:3px">example</span></p>'+code('vertical-align: '+value+';')+'</div>' for value in ['baseline','super','sub','middle'])+'</div><p style="color:#2563eb">color: #2563eb changes the text colour.</p>'+code('p {\n  color: #2563eb;\n  word-spacing: 4px;\n  letter-spacing: 1px;\n  line-height: 1.8;\n}\n.label { vertical-align: middle; }')+'<p>text-decoration: blink is obsolete and unreliable. Use underline, overline, line-through or none in modern examples.</p>')

    additions['box-shadow'] = section('Hover and transition: see what changes', '33, 41–42', 'Hover par element ki style change hoti hai. Transition property aur duration batati hai ki change kitni smoothly hoga. Keyboard users ke liye focus-visible bhi dein.',
        '<div class="note-hover-card" tabindex="0">Hover or focus this card</div>'+code('.card {\n  background: #dbeafe;\n  transition: background-color .3s, transform .3s;\n}\n.card:hover, .card:focus-visible {\n  background: #bfdbfe;\n  transform: translateY(-4px);\n}\n@media (prefers-reduced-motion: reduce) {\n  .card { transition: none; }\n}')+'<p>transition-duration measures time (s or ms); it is not a size. Transition only the properties you intend to animate.</p>')

    additions['background-properties'] = section('Colour formats and gradients', '20–21, 35', 'Named colours, hex aur rgb() ek hi colour ko likhne ke alag formats hain. linear-gradient() background-image banata hai; yeh font colour ki value nahi hai.',
        '<div class="note-compare"><div><div class="note-swatch" style="background:royalblue;color:white">royalblue</div>'+code('background-color: royalblue;')+'</div><div><div class="note-swatch" style="background:#4169e1;color:white">#4169e1</div>'+code('background-color: #4169e1;')+'</div><div><div class="note-swatch" style="background:rgb(65,105,225);color:white">rgb(65, 105, 225)</div>'+code('background-color: rgb(65, 105, 225);')+'</div><div><div class="note-swatch" style="background:linear-gradient(90deg,#2563eb,#7c3aed);color:white">Gradient</div>'+code('background: linear-gradient(90deg, #2563eb, #7c3aed);')+'</div></div>')
    additions['background-properties'] += section('Background repeat and attachment','21','Repeat image ke pattern ko control karta hai. Attachment decide karta hai ki scrolling par background image kis reference ke saath rahegi.', '<div class="note-compare">'+''.join('<div><div style="height:100px;background-color:#eff6ff;background-image:url(\'/style-course/marker.svg\');background-size:22px 22px;background-repeat:'+value+'"></div>'+code('background-repeat: '+value+';')+'</div>' for value in ['repeat','repeat-x','repeat-y','no-repeat'])+'</div><table><tr><th>background-attachment</th><th>What happens when you scroll?</th></tr><tr><td>scroll</td><td>Background stays attached to the element; it scrolls with the page.</td></tr><tr><td>fixed</td><td>Background is fixed relative to the viewport in the usual case.</td></tr><tr><td>local</td><td>Background scrolls with the element\'s own content.</td></tr></table>'+code('.panel {\n  background-image: url("/practice-media/landscape.svg");\n  background-repeat: no-repeat;\n  background-attachment: scroll;\n  background-position: center;\n  background-size: cover;\n}'))
    additions['text-properties'] += section('Text transform: change the displayed case','23','text-transform display ko badalta hai; HTML mein likha original text change nahi hota.', '<div class="note-compare">'+''.join('<div><p style="text-transform:'+value+'">Learning CSS is creative</p>'+code('text-transform: '+value+';')+'</div>' for value in ['none','uppercase','lowercase','capitalize'])+'</div>')
    additions['display-flex'] = section('Put the notebook layouts into practice','16–19, 33–42','Notebook ke navigation, login-card aur image-gallery layouts mein yehi display, alignment, spacing, colour aur font properties ek saath use hoti hain. Code ko HTML compiler mein copy karke change karein.',
        '<h3>1. Navigation bar and page sections</h3><div style="display:flex;justify-content:space-between;align-items:center;background:#1e3a8a;color:white;padding:16px;border-radius:10px"><strong>Study Studio</strong><span>Home · Courses · Contact</span></div>'+code('''<style>
.site-header { display:flex; justify-content:space-between; align-items:center;
  gap:16px; padding:20px; background:#1e3a8a; color:white; }
.site-header nav { display:flex; gap:16px; }
.site-header a { color:white; text-decoration:none; }
.page-panels { display:flex; flex-wrap:wrap; gap:20px; padding:20px; }
.page-panels section { flex:1 1 220px; border:2px solid #cbd5e1; padding:20px; }
</style>
<header class="site-header"><strong>Study Studio</strong><nav>
  <a href="#courses">Courses</a><a href="#updates">Updates</a>
</nav></header>
<main class="page-panels"><section id="courses"><h2>Courses</h2><ul><li>HTML</li><li>CSS</li></ul></section>
  <section id="updates"><h2>Updates</h2><p>Your learning news.</p></section></main>''')+
        '<h3>2. A styled form card</h3><div style="max-width:280px;margin:20px auto;padding:22px;border:1px solid #cbd5e1;border-radius:14px;background:#f8fafc"><strong>Course enquiry</strong><div style="margin-top:14px;padding:10px;border:1px solid #cbd5e1;background:white;border-radius:6px">Your name</div><div style="margin-top:10px;padding:10px;border:1px solid #cbd5e1;background:white;border-radius:6px">Your email</div><div style="margin-top:14px;padding:10px;background:linear-gradient(90deg,#2563eb,#7c3aed);color:white;text-align:center;border-radius:7px">Send enquiry</div></div>'+code('''<style>
.enquiry { max-width:320px; margin:30px auto; padding:24px;
  background:#f8fafc; border:1px solid #cbd5e1; border-radius:14px; font-family:Arial; }
.enquiry label { display:block; margin-top:12px; }
.enquiry input { box-sizing:border-box; width:100%; padding:10px; margin-top:5px;
  border:1px solid #94a3b8; border-radius:6px; }
.enquiry button { width:100%; margin-top:16px; padding:12px; border:0;
  border-radius:7px; color:white; background:linear-gradient(90deg,#2563eb,#7c3aed); }
</style>
<form class="enquiry" onsubmit="event.preventDefault()">
  <h2>Course enquiry</h2><label>Name<input name="name" required></label>
  <label>Email<input name="email" type="email" required></label>
  <button type="submit">Send enquiry</button>
</form>''')+'<p>This is a local styling demonstration. It does not create accounts or send form data.</p>'+
        '<h3>3. Image gallery with a hover effect</h3><div class="note-compare"><div><img src="/practice-media/landscape.svg" alt="Mountain landscape for the gallery"><strong>Mountain view</strong></div><div><img src="/practice-media/study.svg" alt="Study workspace for the gallery"><strong>Study space</strong></div></div>'+code('''<style>
.gallery { display:flex; flex-wrap:wrap; justify-content:center; gap:20px; }
.gallery figure { width:220px; margin:0; border:1px solid #cbd5e1;
  border-radius:12px; overflow:hidden; background:white; }
.gallery img { width:100%; height:160px; object-fit:cover; transition:transform .3s; }
.gallery figure:hover img { transform:scale(1.05); }
.gallery figcaption { padding:14px; text-align:center; font-weight:700; }
</style>
<div class="gallery">
  <figure><img src="/practice-media/landscape.svg" alt="Mountain landscape"><figcaption>Mountain view</figcaption></figure>
  <figure><img src="/practice-media/study.svg" alt="Study workspace"><figcaption>Study space</figcaption></figure>
</div>''')+'<p>The final notebook pages (43–45) discuss HTML required and pattern validation. Continue with <a href="/html/elements">HTML Form Validation in Elements, Tags and Attributes</a> for those HTML topics.</p>')

    for ident, html in additions.items():
        lesson=next(item for item in lessons if item['id']==ident)
        fragment=BeautifulSoup(html,'html.parser')
        lesson['nodes'] += [node for child in fragment.children for node in nodes(child, 'notes-'+ident)]
        lesson['examples']=examples(lesson['nodes'])

    page_ranges={
        'what-is-css':[1], 'characteristics-of-css':[1], 'three-ways-to-insert-css':[2,3], 'priorities-of-css':[4],
        'css-syntax':[4], 'css-selectors':list(range(4,11)), 'border-properties':[11,12,13,26,27],
        'display-property':[13,14,15,16,28], 'display-flex':[16,17,18,19,33,34,35,36,37,38,39,40,41,42],
        'css-box-model-comprehensive-guide':[24,25,26,27,28], 'font-properties':[19,20],
        'text-properties':[20,22,23], 'background-properties':[20,21,35], 'list-styles':[23,24],
        'css-position-properties':[29,30,31,32], 'box-shadow':[33,41,42],
    }
    for lesson in lessons: lesson['notesPages']=page_ranges.get(lesson['id'],[])

def extend_w3_notes(lessons, nodes, examples):
    additions={
        'how-to-use-w3-css': section('Your own styles with W3.CSS','4','Framework ke baad apni stylesheet link kar sakte hain. Component colours/classes ko samajhkar custom style likhein; kuch utility classes !important use karti hain.',code('<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\n<link rel="stylesheet" href="lesson.css">\n\n<h2 class="lesson-title">My heading</h2>')+code('/* lesson.css */\n.lesson-title { font-family: Georgia, serif; font-size: 26px; }')+'<p>Use w3-large/w3-xlarge for the framework size utilities, or use your own class when defining a custom heading.</p>'),
        'w3-css-border-classes': section('Thick bars on every side','3','w3-border thin border deta hai. w3-topbar, w3-rightbar, w3-bottombar aur w3-leftbar thicker edges banate hain.', '<div class="note-compare">'+''.join('<div><div class="w3-panel w3-pale-blue w3-border-blue '+value+'">'+value+'</div>'+code('<div class="w3-panel w3-pale-blue w3-border-blue '+value+'">Border example</div>')+'</div>' for value in ['w3-topbar','w3-rightbar','w3-bottombar','w3-leftbar'])+'</div>'),
        'w3-css-image-classes': section('Opacity and grayscale are different','10','Opacity image ko transparent banati hai; grayscale uske colours ko grey banata hai. Dono effects ko compare karein.', '<div class="note-compare">'+''.join('<div><img src="/practice-media/landscape.svg" alt="Mountain landscape, '+value+'" class="w3-image '+value+'" style="width:100%;height:120px;object-fit:cover">'+code('<img class="w3-image '+value+'" src="photo.jpg" alt="Mountain view">')+'</div>' for value in ['w3-opacity','w3-grayscale','w3-grayscale-max'])+'</div>'),
    }
    pages={'what-is-a-web-framework':[1],'discover-w3-css-your-design-superpower':[1],'how-to-use-w3-css':[1,2,4],'w3-css-classes-colors-and-hover-effects':[2,3],'w3-css-border-classes':[3],'w3-css-font-size-classes':[4],'w3-css-text-classes':[5],'w3-css-table-classes':[5,6,7],'w3-css-container':[7],'w3-css-panel':[7,8],'w3-css-rounded-panel':[7,8],'w3-css-button':[8],'w3-css-display-container':[8],'w3-css-display-positions':[8],'collapsible-panel':[8],'w3-css-lists':[8,9,10],'w3-css-image-classes':[10]}
    for lesson in lessons:
        lesson['notesPages']=pages.get(lesson['id'],[])
        if lesson['id'] in additions:
            fragment=BeautifulSoup(additions[lesson['id']],'html.parser')
            lesson['nodes'] += [node for child in fragment.children for node in nodes(child, 'notes-'+lesson['id'])]
            lesson['examples']=examples(lesson['nodes'])
