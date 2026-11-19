"""Import the local teaching material without executing its scripts.

Usage: python scripts/import-style-courses.py --source /path/to/WebDesigning
Requires beautifulsoup4 for this one-time content import, not at runtime.
"""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment, Tag
import argparse, hashlib, json, re, textwrap, shutil

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
source = args.source.resolve()
out = root / 'public/style-course'
(out / 'reference').mkdir(parents=True, exist_ok=True)
(root / 'src/data').mkdir(parents=True, exist_ok=True)

def soup(name):
    return BeautifulSoup((source / name).read_text(encoding='utf-8-sig'), 'html.parser')

def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def clean_code(node):
    c = BeautifulSoup(str(node), 'html.parser')
    for br in c.find_all('br'): br.replace_with('\n')
    code = textwrap.dedent(c.get_text()).strip()
    # Keep image examples runnable when the old local images are absent.
    code = re.sub(r'(img_avatar[56]\.png|https://via\.placeholder\.com/200)', '/practice-media/study.svg', code)
    code = re.sub(r'(custom-marker\.png|marker\.png)', '/style-course/marker.svg', code)
    return code.replace('image.jpg', '/practice-media/landscape.svg').replace('/api/placeholder/200/200', '/practice-media/landscape.svg')

task_links = {'task1': '/web-design/css/tasks/ai-borders', 'task2': '/web-design/css/tasks/navigation-layout', 'task3': '/web-design/css/tasks/learning-journey', 'taskw3css': '/web-design/w3css/tasks/performance-table', 'taskw3css1': '/web-design/w3css/tasks/ai-exploration'}

def local_image(value):
    if value.startswith(('/practice-media/','/style-course/')): return value
    return '/practice-media/study.svg' if 'avatar' in value else '/practice-media/landscape.svg'

def pair_visual_code(node, result, prefix):
    """Keep a W3.CSS demonstration and its actual HTML immediately together."""
    if not prefix.startswith('w3css'): return result
    classes=node.get('class',[])
    if not classes or not any(c.startswith('w3-') for c in classes): return result
    if node.get('onclick'): return result
    is_leaf = node.name=='p' and len(node.get_text())<180
    is_element = node.name in ['img','button','table','ul']
    is_panel = node.name=='div' and not node.find(['h1','h2','h3','h4','table','ul','button','img']) and len(node.get_text())<350 and any(c in classes for c in ['w3-panel','w3-display-container'])
    if not (is_leaf or is_element or is_panel): return result
    example=BeautifulSoup(str(node),'html.parser')
    for icon in example.select('i.fas,script'): icon.decompose()
    for element in example.find_all(True):
        for key in list(element.attrs):
            if key.startswith('on'): del element[key]
        if element.name=='img': element['src']=local_image(element.get('src',''))
    return [{'tag':'div','attrs':{'class':'sc-paired-example'},'children':result+[{'code':str(example).strip()}]}]
def mapped_link(href):
    name = href.split('/')[-1].removesuffix('.html')
    return task_links.get(name, href if href.startswith(('https://', '#', '/')) else '#')

def nodes(node, prefix='source'):
    if isinstance(node, Comment): return []
    if isinstance(node, NavigableString):
        value = re.sub(r'\s+', ' ', str(node))
        for old,new in {
            'Overrides all other styles':'Within the same cascade origin and layer, important declarations override normal declarations.',
            "Here's the complete hierarchy from highest to lowest priority:":'For rules within the same origin, importance and layer, compare specificity as shown below. Importance is a separate part of the cascade:',
            '2011: CSS3':'Modern CSS modules',
            'CSS Level 3 introduces modules with animations, flexbox, grid, and more':'Modern CSS is developed as separate modules, including animations, flexbox and grid; they did not all arrive in one release.',
            'The w3-panel class creates bordered content blocks':'The w3-panel class adds horizontal padding and vertical margins; add w3-border for bordered content blocks',
            'class creates bordered content blocks, making sections visually distinct and highlighted.':'class adds horizontal padding and vertical margins. Add w3-border when you want a border.',
            'styles buttons with padding, rounded corners, and hover effects':'styles buttons with padding and hover effects; add w3-round for rounded corners',
            'Aligns items horizontally':'Aligns items along the main axis (set by flex-direction)',
            'Aligns items vertically':'Aligns items along the cross axis',
            'Fixed and sticky elements are positioned relative to the browser viewport.':'Fixed elements usually use the viewport; a transformed ancestor can create their containing block. Sticky uses its nearest scrolling ancestor and stays within its containing block.',
            'Toggles between relative and fixed positioning based on scroll position.':'Stays in normal flow, then sticks to an inset within its scrolling container and containing block.',
        }.items(): value=value.replace(old,new)
        return [{'text': value}] if value.strip() else []
    if node.name in ['script', 'style', 'nav', 'svg', 'path', 'link', 'meta']: return []
    classes = node.get('class', [])
    if any(c in classes for c in ['code-block', 'code-example', 'code-snippet']) or node.name == 'pre':
        return [{'code': clean_code(node)}]
    children = [item for child in node.children for item in nodes(child, prefix)]
    allowed = {'h1','h2','h3','h4','p','div','span','ul','ol','li','table','thead','tbody','tr','th','td','strong','b','em','i','code','br','a','button','details','summary','img'}
    tag = node.name if node.name in allowed else 'div'
    if node.get('onclick') and 'display' in node['onclick'] and 'none' in node['onclick']: tag='button'
    attrs = {key: node[key] for key in ['colspan','rowspan','tabindex'] if key in node.attrs}
    if classes: attrs['class'] = ' '.join(classes)
    if node.get('style'): attrs['style'] = node['style'].replace('image.jpg','/practice-media/landscape.svg')
    if node.get('id'): attrs['id'] = prefix + '-' + slug(node['id'])
    if tag in ['h1','h2','h3','h4']:
        attrs['id'] = prefix + '-topic-' + str(len(node.find_all_previous(['h1','h2','h3','h4'])))
    if tag == 'img':
        attrs.update({'src': local_image(node.get('src','')), 'alt': node.get('alt', 'Example image')})
        return pair_visual_code(node,[{'tag':'img','attrs':attrs,'children':[]}],prefix)
    if tag == 'button':
        action = node.get('onclick','')
        match = re.search(r"togglePanel\(['\"]([^'\"]+)", action)
        if match:
            attrs['data-lesson-toggle'] = prefix + '-' + slug(match[1])
        elif 'display' in action and 'none' in action:
            attrs['data-lesson-close'] = 'true'
    if tag == 'a': attrs['href'] = mapped_link(node.get('href', '#'))
    result=[{'tag': tag, 'attrs': attrs, 'children': children}] if children or tag == 'br' or classes or attrs.get('style') else []
    return pair_visual_code(node,result,prefix) if result else []

def example_codes(content):
    result = []
    def visit(items):
        for n in items:
            if 'code' in n: result.append(n['code'])
            visit(n.get('children', []))
    visit(content)
    return result

def visual_page(fragments, name, course, dest):
    original = soup(name)
    body = BeautifulSoup(''.join(str(n) for n in fragments), 'html.parser')
    for n in body.select('script,nav,link,meta,svg'): n.decompose()
    for n in body.find_all(True):
        for a in list(n.attrs):
            if a.lower().startswith('on'):
                action = n[a]
                match = re.search(r"togglePanel\(['\"]([^'\"]+)", action)
                if match: n['data-toggle'] = match[1]
                elif 'display' in action and 'none' in action: n['data-close'] = 'true'
                del n[a]
        if n.name == 'img': n['src'] = '/practice-media/study.svg'
        if n.name == 'a': n['href'] = mapped_link(n.get('href', '#'))
    styles = '\n'.join(s.get_text() for s in original.select('head style'))
    framework = '<link rel="stylesheet" href="/style-course/w3.css">' if course == 'w3css' else ''
    page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+framework+'<style>'+styles+'\nbody{padding:16px;overflow-wrap:anywhere}img{max-width:100%}table{max-width:100%} .button-container{display:none}</style></head><body>'+str(body)+'''<script>document.addEventListener('click',function(e){var t=e.target.closest('[data-toggle]');if(t){var p=document.getElementById(t.dataset.toggle);if(p){p.classList.toggle('w3-hide');p.hidden=!p.hidden}}var c=e.target.closest('[data-close]');if(c)c.parentElement.hidden=true});</script></body></html>'''
    page=page.replace("p.classList.toggle('w3-hide');p.hidden=!p.hidden", "if(p.classList.contains('w3-hide')){p.classList.remove('w3-hide');p.hidden=false}else{p.hidden=!p.hidden}")
    page=page.replace('/api/placeholder/200/200','/practice-media/landscape.svg').replace('custom-marker.png','/style-course/marker.svg').replace('marker.png','/style-course/marker.svg').replace("url('image.jpg')","url('/practice-media/landscape.svg')")
    (out / 'reference' / dest).write_text('\n'.join(line.rstrip() for line in page.splitlines())+'\n', encoding='utf-8')

guides = {
 'basics': ('CSS HTML ki appearance badalta hai: colors, fonts, spacing aur layout. Pehle element select karein, phir property aur value likhein.', 'HTML content banata hai; CSS uska look aur layout set karta hai.', 'Ek heading ka color aur paragraph ka font-size badal kar output dekhein.'),
 'history': ('CSS ka development levels aur modules mein hua. Aaj alag CSS features alag specifications mein develop hote hain.', 'CSS3 ek single release ya ek saal ka complete package nahi hai.', 'CSS1, CSS2 aur modern modular CSS ka short timeline banayein.'),
 'methods': ('Inline mein style attribute, internal mein <style>, external mein alag .css file use hoti hai. Reusable websites mein external stylesheet kaafi useful hai.', 'External stylesheet ka path sahi hona chahiye. Missing file se styling load nahi hogi.', 'Ek hi paragraph ko inline, internal aur external CSS se style karein.'),
 'cascade': ('Same element par multiple rules lagen to cascade decide karta hai kaunsa rule apply hoga. Same origin, importance aur layer mein ID ki specificity class se zyada hoti hai.', '!important selector specificity nahi hai. Origin, importance aur layers bhi matter karte hain; equal specificity mein later rule jeetta hai.', 'Ek paragraph ko class aur ID se alag colors dein; phir rule order badal kar dekhein.'),
 'selectors': ('Selector batata hai style kin elements par lagega. Element, class, ID, attribute aur combinators ko ek-ek karke practice karein.', 'div p sab descendant paragraphs select karta hai; div > p sirf direct children.', 'Ek list mein sirf even items ko :nth-child(even) se style karein.'),
 'border': ('Border element ke aas-paas ki line hai. Width, style aur color set karein; border-radius se corners round hote hain.', 'border: 2px solid blue mein width, style aur color teen parts hain.', 'Solid, dashed, dotted aur rounded border ke chaar boxes banayein.'),
 'display': ('Block nayi line leta hai; inline text ke flow mein rehta hai; inline-block inline rehte hue width aur height allow karta hai.', 'display:none layout se bhi element hata deta hai; visibility:hidden jagah preserve karta hai.', 'Teen links ko block, inline aur inline-block se compare karein.'),
 'flex': ('Parent par display:flex lagta hai. justify-content main axis aur align-items cross axis par items align karte hain.', 'Main axis flex-direction se badalta hai; justify-content hamesha horizontal nahi hota.', 'Teen cards ko gap ke saath arrange karein aur flex-wrap test karein.'),
 'box': ('Har box content, padding, border aur margin se milkar banta hai. Padding andar aur margin bahar ki spacing hai.', 'content-box mein width ke alawa padding aur border add hote hain.', 'Width 200px, padding 20px aur border 2px ke box ki actual width calculate karein.'),
 'shadow': ('box-shadow element ke bahar ya andar shadow banata hai. Offset, blur, spread aur color ko alag-alag samjhein.', 'Shadow layout space ko increase nahi karta.', 'Ek card par soft shadow aur hover shadow banayein.'),
 'sizing': ('box-sizing:border-box mein declared width ke andar padding aur border count hote hain.', 'Margin border-box width ka hissa nahi hai.', 'Same width ke content-box aur border-box elements compare karein.'),
 'decoration': ('box-decoration-break batata hai line ya column mein tootne wale box ka background aur border kaise paint hoga.', 'clone aur slice ko wrapping inline text ke saath compare karein.', 'Ek long highlighted sentence ko do lines mein wrap karein.'),
 'lists': ('list-style-type marker ka design, position uski placement aur image custom marker set karti hai.', 'list-style shorthand mein type, position aur image combine ho sakte hain.', 'Square bullets, roman numbers aur inside markers ki lists banayein.'),
 'text': ('Text alignment, decoration, case, spacing aur line-height readability ko control karte hain.', 'line-height lines ke beech aur letter-spacing letters ke beech spacing hai.', 'Ek article ko readable line-height aur justified/left alignment se compare karein.'),
 'font': ('Font family, size, weight aur style text ka appearance set karte hain. Hamesha fallback font family rakhein.', 'font shorthand mein size aur family required hote hain.', 'Heading aur body ke liye alag font-weight aur size choose karein.'),
 'background': ('Background color aur image element ke peeche dikhte hain. Repeat, size, position aur attachment ko alag test karein.', 'cover image ko crop kar sakta hai; contain poori image fit karta hai.', 'Ek hero section mein background-image, center aur cover use karein.'),
 'position': ('Static, relative, absolute, fixed aur sticky se positioning badalti hai. Absolute element aam taur par nearest positioned ancestor ke relative hota hai.', 'Sticky ko inset, jaise top:0, aur suitable scroll space chahiye.', 'Ek relative card ke top-right mein absolute badge rakhein.'),
 'tables': ('Table border, collapse, cell spacing, padding aur alignment ko set karein. Hover aur striped rows reading ko easy banate hain.', 'border-spacing separate borders mein kaam karta hai; collapsed borders mein nahi.', 'Ek report table mein alternate row colors aur hover highlight add karein.'),
 'framework': ('W3.CSS ready-made CSS classes ka toolkit hai. Classes HTML mein lagti hain aur stylesheet unka design provide karti hai.', 'w3-color jaise names families ko represent karte hain; actual classes w3-blue ya w3-red hoti hain.', 'w3-container, w3-blue aur w3-padding se ek banner banayein.'),
 'w3': ('Example mein di gayi class ko HTML element ke class attribute mein likhein. Phir visual reference aur apna output compare karein.', 'W3.CSS sirf styling deta hai; collapse ya close jaise behaviour ke liye JavaScript bhi chahiye ho sakti hai.', 'Example ka text, color ya size badal kar apna version banayein.'),
}

def guide_for(title, course):
 t=title.lower()
 if course=='w3css':
  lessons = [
   ('border',('w3-border se border, w3-border-blue se colour aur w3-leftbar jaise classes se thick side border lagta hai.', 'w3-border-color ek family ka naam hai; actual class w3-border-red ya w3-border-blue hoti hai.', 'Ek panel par thin blue border aur doosre par thick green left bar banayein.')),
   ('font size',('w3-small, w3-large, w3-xlarge aur w3-jumbo text ka size badalte hain. Ek hi text par classes compare karein.', 'Font size text ki height badalta hai; w3-wide letters ke beech spacing badhata hai.', 'Same heading ko teen size classes ke saath display karein.')),
   ('text classes',('w3-left-align, w3-center aur w3-right-align text align karte hain; w3-wide letter spacing aur w3-opacity transparency badalti hai.', 'w3-center text alignment hai; w3-display-middle positioning class hai.', 'Ek paragraph ko centre align aur ek heading ko w3-wide dein.')),
   ('table',('w3-table basic table, w3-striped alternate rows, w3-bordered row borders aur w3-hoverable row hover effect deta hai.', 'w3-table-all bordered/striped presentation combine karta hai. Horizontal scrolling ke liye w3-responsive wrapper use karein.', 'Ek report table ko striped, bordered aur hoverable banayein.')),
   ('rounded',('w3-round, w3-round-large aur w3-round-xlarge panel ke corners round karte hain.', 'Roundness aur shadow alag effects hain; shadow ke liye w3-card use karein.', 'Same panel ko teen roundness classes mein compare karein.')),
   ('collapsible',('Button par click karne se panel ki visibility JavaScript se toggle hoti hai. W3.CSS panel aur button ka design deta hai.', 'CSS class apne aap click behaviour nahi banati. Button ke saath toggle handler bhi chahiye.', 'Live example mein panel open/close karein, phir compiler mein uska text badlein.')),
   ('display',('w3-display-container parent ko positioning context deta hai. Andar w3-display-topleft, w3-display-middle aur doosre position classes use karein.', 'Position classes ko display container ke andar lagayein aur container ko visible height dein.', 'Ek card ke top-left, centre aur bottom-right par text rakhein.')),
   ('button',('w3-button padding aur hover styling deta hai. w3-blue se colour aur w3-round se rounded corners add karein.', 'Button ki appearance aur uska action alag hain. Action ke liye HTML form ya JavaScript chahiye.', 'Blue, green aur rounded buttons compare karein.')),
   ('container',('w3-container consistent left aur right padding deta hai. Class ko heading ya paragraph ke wrapper par lagayein.', 'w3-panel mein horizontal padding ke saath top/bottom margin bhi hota hai.', 'Ek coloured banner ko container ke andar banayein.')),
   ('panel',('w3-panel horizontal padding aur vertical margins ke saath content block banata hai. Colour ya border alag classes se add karein.', 'Panel par border automatically nahi aata; w3-border explicitly lagayein.', 'Do panels banayein: ek pale-blue, ek bordered.')),
   ('lists',('w3-ul se list items ko consistent spacing aur separators milte hain. w3-border aur w3-hoverable se list ko customise karein.', 'Closable item hide karne ke liye button ke saath click behaviour chahiye.', 'List ke ek item ko close karein aur hover style compare karein.')),
   ('image',('w3-round corners, w3-circle circular shape, w3-border boundary aur w3-grayscale grey colour effect deta hai.', 'Square image ya square crop par w3-circle ek circle banata hai. Opacity transparency hai, grayscale colour effect hai.', 'Same image ko normal, rounded, circular aur grayscale classes mein compare karein.')),
  ]
  for term,guide in lessons:
   if term in t: return guide
 for key, terms in [('history',['evolution']),('cascade',['priorit']),('methods',['ways to insert']),('selectors',['selector']),('border',['border']),('flex',['flex']),('display',['display property','display:','use cases']),('shadow',['shadow']),('sizing',['sizing']),('decoration',['decoration break']),('box',['box model']),('lists',['list styles']),('font',['font properties']),('background',['background properties']),('position',['position properties']),('tables',['css table properties']),('text',['text properties']),('framework',['framework','superpower','how to use'])]:
  if any(x in t for x in terms): return guides[key]
 return guides['w3' if course=='w3css' else 'basics']

def make_lesson(course, name, fragments, title, group):
 ident = slug(title)
 ident = re.sub(r'^\d+-', '', ident)
 content = [n for i,f in enumerate(fragments) for n in nodes(f,course+'-'+ident+'-'+str(i))]
 codes = example_codes(content)
 summary, remember, practice = guide_for(title,course)
 visual_page(fragments,name,course,course+'-'+ident+'.html')
 return {'id':ident, 'title':title, 'group':group, 'summary':summary,'remember':remember,'practice':practice,'source':name,'nodes':content,'examples':codes,'visual':f'/style-course/reference/{course}-{ident}.html'}

css=[]
intro=soup('cssintro.html')
for frag in intro.select_one('.content').find_all('div',class_='section',recursive=False):
 css.append(make_lesson('css','cssintro.html',[frag],frag.find(['h1','h2']).get_text(' ',strip=True),'Foundations & selectors'))
props=soup('cssproperties.html')
groups=[]
for n in props.select_one('.container').find_all(recursive=False):
 if 'header' in n.get('class',[]) or 'button-container' in n.get('class',[]): continue
 title=n.find(['h1','h2','h3']).get_text(' ',strip=True)
 if re.match(r'^\([ivx]+\)',title): groups[-1][1].append(n)
 elif title.startswith(('2. Display:','3. Display:','Practical Use Cases')): groups[-1][1].append(n)
 else: groups.append([title,[n]])
for title,frags in groups: css.append(make_lesson('css','cssproperties.html',frags,title,'Properties & layout'))

w3=[]
doc=soup('w3css.html')
for frag in doc.body.find_all('section',recursive=False):
 title=frag.find(['h1','h2']).get_text(' ',strip=True)
 clean=re.sub(r'^\d+\.\s*','',title)
 existing=next((l for l in w3 if l['title']==clean),None)
 if existing:
  existing['nodes'] += nodes(frag,'w3css-'+existing['id']+'-variation-'+str(len(existing['nodes'])))
  existing['examples'] = example_codes(existing['nodes'])
  # Keep both source examples in the visual reference, too.
  previous=next(g for g in w3_fragments if g[0]==clean)
  previous[1].append(frag)
  visual_page(previous[1],'w3css.html','w3css', 'w3css-'+existing['id']+'.html')
 else:
  if not w3: w3_fragments=[]
  w3_fragments.append([clean,[frag]])
  w3.append(make_lesson('w3css','w3css.html',[frag],clean,'Framework & classes'))
image_nodes=[]
start=False
for n in doc.body.find_all(recursive=False):
 if n.name=='h1' and 'Image Classes' in n.get_text(): start=True
 if start and 'button-container' in n.get('class',[]): break
 if start: image_nodes.append(n)
w3.append(make_lesson('w3css','w3css.html',image_nodes,'W3.CSS Image Classes','Framework & classes'))

# Retain the grid/responsive examples already on Knobly, alongside the source course.
def supplement(course,ident,title,summary,html,csscode=''):
 return {'id':ident,'title':title,'group':'More practice','summary':summary,'remember':'Small changes karke output compare karein. Narrow screen par bhi layout test karein.','practice':'Example mein ek naya card add karein aur responsive output check karein.','source':'Knobly practice','nodes':[{'code':html}]+([{'code':csscode}] if csscode else []),'examples':[html]+([csscode] if csscode else []),'demo':{'html':html,'css':csscode}}
css += [supplement('css','grid-layout','CSS Grid','Grid rows aur columns mein layout banata hai. repeat(3,1fr) teen equal columns banata hai.', '<div class="grid"><div>One</div><div>Two</div><div>Three</div></div>', '.grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }\n.grid > div { background:#dbeafe; padding:24px; }'), supplement('css','responsive-design','Responsive Design','Media queries se screen size ke hisaab se CSS change hoti hai.', '<div class="grid"><div>One</div><div>Two</div><div>Three</div></div>', '.grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }\n.grid > div { background:#dbeafe; padding:24px; }\n@media (max-width:768px) { .grid { grid-template-columns:1fr; } .sidebar { display:none; } }')]
w3 += [supplement('w3css','responsive-grid','W3.CSS Responsive Grid','w3-row-padding aur w3-third se responsive columns banayein.', '<div class="w3-row-padding"><div class="w3-third w3-blue w3-padding">Column 1</div><div class="w3-third w3-green w3-padding">Column 2</div><div class="w3-third w3-orange w3-padding">Column 3</div></div>'), supplement('w3css','cards-and-animations','Cards and Animations','w3-card-4 shadow aur w3-animate-opacity fade effect deta hai. Motion ko limited aur purposeful rakhein.', '<div class="w3-container w3-padding"><div class="w3-card-4 w3-round w3-padding w3-animate-opacity"><h2>Study card</h2><p>A card with a shadow and fade animation.</p><button class="w3-button w3-blue">Learn more</button></div></div>')]

task_specs=[('css','ai-borders','task1.html','AI information page','Borders, dimensions and spacing',['Create the green heading and a centred white content box.','Add two light-blue information sections with dotted borders.','Match border styles, spacing and text colours in the target.'],['border','background-color','width','height','margin','padding'],'border-properties'),('css','navigation-layout','task2.html','Website navigation layout','Display and inline-block layout',['Centre an 80%-wide red heading.','Create the horizontal black navigation links.','Place two equal bordered boxes next to each other.'],['display','inline-block','width','line-height','margin'],'display-property'),('css','learning-journey','task3.html','Web development journey','A complete CSS project',['Build the card, heading and two skill lists.','Position the Featured badge at the top-right of the card.','Add the target hover transitions, shadows and colours.'],['position','flex','transition','transform','box-shadow','list-style-type'],'css-position-properties'),('w3css','performance-table','taskw3css.html','Company performance table','Tables, colours and merged cells',['Build the three-column company report.','Use colspan and rowspan exactly as in the reference.','Apply W3.CSS table, border, stripe, hover and text-colour classes.'],['w3-table-all','w3-bordered','w3-striped','w3-hoverable','w3-text-blue'],'w3-css-table-classes'),('w3css','ai-exploration','taskw3css1.html','AI exploration website','Rebuild a complete reference with W3.CSS',['Recreate the original reference using W3.CSS containers, cards and responsive columns.','Include Home, Technologies, Applications, Future and Contact sections.','Add navigation anchors, a hero and footer; check the layout on narrow screens.'],['w3-container','w3-row-padding','w3-col','w3-card','w3-bar','w3-panel'],'w3-css-container')]
tasks={'css':[],'w3css':[]}
for course,ident,name,title,subtitle,steps,skills,lesson in task_specs:
 raw=(source/name).read_text(encoding='utf-8-sig')
 parsed=BeautifulSoup(raw,'html.parser')
 csscode='\n'.join(n.get_text() for n in parsed.select('style'))
 for n in parsed.select('style'): n.decompose()
 for n in parsed.select('link[rel="icon"]'): n['href']='/favicon.svg'
 for n in parsed.select('link[rel="stylesheet"]'): n['href']='/style-course/w3.css'
 target=raw.replace('https://www.w3schools.com/w3css/4/w3.css','/style-course/w3.css')
 target=re.sub(r'(\.\./)+favicon\.svg','/favicon.svg',target)
 (out / (ident+'.html')).write_text('\n'.join(line.rstrip() for line in target.splitlines())+'\n',encoding='utf-8')
 if ident == 'ai-exploration':
  class_map={'navbar':'w3-bar w3-top w3-blue w3-padding','logo':'w3-bar-item','nav-links':'w3-bar','container':'w3-content w3-padding','hero':'w3-panel w3-blue w3-center w3-padding-32 w3-round-large','section':'w3-container w3-white w3-card w3-round-large w3-padding-16 w3-margin-top','content-grid':'w3-row-padding','card':'w3-col m6 l3 w3-panel w3-pale-blue w3-padding'}
  for node in parsed.select('[class]'):
   node['class']=' '.join(class_map.get(c,c) for c in node.get('class',[])).split()
  for node in parsed.select('footer'): node['class']='w3-container w3-dark-grey w3-center w3-padding'.split()
  csscode='/* W3.CSS provides the layout and component styles. */\nbody { padding-top:110px; font-family:Arial,sans-serif; background:#f0f4f8; }\nnav ul { margin:0; padding:0; list-style:none; }\nnav li { display:inline-block; padding:8px; }\nnav a { color:inherit; text-decoration:none; }\nsection { scroll-margin-top:120px; }'
 starter='<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>'+title+'</title>\n</head>\n<body>\n  <!-- Build your task here. -->\n</body>\n</html>'
 tasks[course].append({'id':ident,'title':title,'subtitle':subtitle,'source':name,'steps':steps,'skills':skills,'lesson':lesson,'target':'/style-course/'+ident+'.html','starter':{'html':starter,'css':''},'solution':{'html':str(parsed),'css':csscode},'note':'The original design uses custom CSS. Use it as the visual reference and practise recreating it with W3.CSS classes.' if ident=='ai-exploration' else ''})

# Quiz files are duplicates; preserve originals, extract each CSS question once.
quizraw=(source/'wp1.html').read_text(encoding='utf-8')
question_text=quizraw.split('$scope.questions =',1)[1].lstrip()
question_text=re.sub(r',\s*([\]}])',r'\1',question_text)
questions=json.JSONDecoder().raw_decode(question_text)[0]
css_questions=[]
for q in questions:
 if re.search(r'CSS|property|style sheet|spacing between lines|website responsive',q['question'],re.I):
  original=q.copy()
  if 'website responsive' in q['question']:
   q={**q,'question':'Which option is a ready-made framework often used to create responsive websites?'}
  if 'background color' in q['question']:
   q={**q,'question':'Which dedicated CSS longhand property changes the background colour?'}
  if 'valid CSS position property' in q['question']:
   q={**q,'question':'Which option is not a valid value of the CSS position property?'}
  if 'background image' in q['question']:
   q={**q,'question':'Which dedicated CSS longhand property sets the background image?'}
  explanations={'<style>':'The <style> element contains an internal stylesheet in the HTML document.','Bootstrap':'Bootstrap provides ready-made responsive layout components. Plain CSS can also create responsive layouts.','background-color':'background-color sets just the background colour; background is a shorthand for several background properties.','table-align':'table-align is not a CSS property. Use text-align for cell text and margin/layout rules to position a table.','All of the above':'These frameworks provide utilities or components for grid-based layouts.','line-height':'line-height controls line box height. letter-spacing controls the gap between characters.','z-index':'z-index affects stacking order, subject to stacking contexts and the applicable layout/positioning rules.','float':'float is a separate CSS property, not a value of position. Valid position values include static, relative, absolute, fixed and sticky.','font-weight':'font-weight controls the thickness of text; bold or 700 are common values.','SASS':'Sass is a CSS preprocessor; its source must be compiled to CSS for browsers.','text-shadow':'text-shadow adds shadow to text. box-shadow applies to the element box.','visibility':'visibility:hidden hides the element while preserving its layout space. display:none removes the layout box.','margin':'Margin is the space outside the border; padding is the space between content and border.','color':'color sets text colour; background-color sets the background.','background-image':'background-image sets an image layer; background is the broader shorthand.'}
  answer=q['options'][q['correctAnswer']]
  css_questions.append({**q,'sourceQuestion':original['question'],'source':'wp1.html / wp2.html','explanation':explanations.get(answer,'Correct answer: '+answer+'. Try this concept in the compiler.')})

w3_questions=[q for q in css_questions if 'framework' in q['question'].lower()]
for question,options,answer,explanation in [
 ('Which class adds 16px left and right padding?',['w3-container','w3-round','w3-circle','w3-hide'],0,'w3-container adds horizontal padding. It does not add the vertical margins provided by w3-panel.'),
 ('What does w3-panel add compared with a plain container?',['JavaScript events','Top and bottom margins','A border automatically','A fixed height'],1,'w3-panel adds vertical margins as well as horizontal padding. Add w3-border explicitly when needed.'),
 ('Which class makes an image circular?',['w3-round','w3-circle','w3-card','w3-wide'],1,'w3-circle applies a 50% border radius. A square image or square crop produces a circle.'),
 ('Which class gives table rows a hover highlight?',['w3-striped','w3-hoverable','w3-table','w3-centered'],1,'w3-hoverable highlights a row when the pointer is over it; w3-striped alternates row backgrounds.'),
 ('Which class positions content in the centre of a display container?',['w3-center','w3-display-middle','w3-left','w3-panel'],1,'Use w3-display-middle inside a w3-display-container. w3-center aligns text.'),
 ('Does a styled W3.CSS button toggle a panel automatically?',['Yes, always','Only on phones','No, add the required behaviour','Only with w3-blue'],2,'CSS styles the button. JavaScript or a native HTML interaction must handle the toggle.'),
 ('Which class is used for a one-third responsive column?',['w3-third','w3-three','w3-grid-3','w3-column-third'],0,'Use w3-third within a row. Check the layout at narrow widths to see its responsive behaviour.'),
 ('Which class adds a card shadow?',['w3-card-4','w3-shadow-text','w3-display-top','w3-round'],0,'w3-card-4 adds a box shadow; w3-round changes corner rounding.'),
]: w3_questions.append({'question':question,'options':options,'correctAnswer':answer,'explanation':explanation,'source':'Knobly revision based on imported lessons','sourceQuestion':question})

relevant=['csspage.html','cssintro.html','cssproperties.html','w3css.html','task1.html','task2.html','task3.html','taskw3css.html','taskw3css1.html','wp1.html','wp2.html','webdesigning_notes.html']
(out / 'originals').mkdir(exist_ok=True)
manifest=[]
for name in relevant:
 raw=(source/name).read_bytes()
 (out/'originals'/(name+'.txt')).write_bytes(raw)
 manifest.append({'file':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'archive':'/style-course/originals/'+name+'.txt'})

from style_note_additions import extend_css_notes, extend_w3_notes
extend_css_notes(css, nodes, example_codes)
extend_w3_notes(w3, nodes, example_codes)

data={'css':{'id':'css','name':'CSS','description':'Learn styling step by step: selectors, properties, layouts and complete practice projects.','notesUrl':'https://drive.google.com/file/d/1CVoM8VfnFLxc5tuTDcpjHWZAKUKaaDLA/view?usp=sharing','lessons':css,'tasks':tasks['css'],'quiz':css_questions},'w3css':{'id':'w3css','name':'W3.CSS','description':'Build responsive websites using ready-made classes, clear examples and complete practice tasks.','notesUrl':'https://drive.google.com/file/d/1CWZRb_lQCn65zLUSEbRnihxyebsOZ-NK/view?usp=sharing','lessons':w3,'tasks':tasks['w3css'],'quiz':w3_questions}}
(root/'src/data/style-courses.generated.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
report={'files':manifest,'inspected':[p.name for p in source.glob('*.html')],'excludedNonCss':['angularjs.html','javascript.html','web.html','webdesigning.html'],'quizDuplicates':['wp1.html','wp2.html'],'counts':{k:{'lessons':len(v['lessons']),'examples':sum(len(l['examples']) for l in v['lessons']),'tasks':len(v['tasks']),'questions':len(v['quiz'])} for k,v in data.items()},'notesSource':'webdesigning_notes.html','imageRepairs':['img_avatar5.png','img_avatar6.png','https://via.placeholder.com/200'],'technicalClarifications':['Cascade and specificity use origin, importance and layers.','CSS3 is modular, not a single 2011 release.','Panels add padding/margins; borders must be requested with border classes.','W3.CSS buttons are not rounded unless a rounding class is added.','Interactive collapse/close behaviour needs JavaScript.']}
report['imageRepairs'] += ['custom-marker.png','marker.png','image.jpg','/api/placeholder/200/200']
(root/'docs/STYLE_COURSE_IMPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report['counts']))
