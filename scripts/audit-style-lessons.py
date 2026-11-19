"""Check that visual restoration retains the imported material and note topics."""
from pathlib import Path
import hashlib, json, re, subprocess

root=Path(__file__).resolve().parents[1]
baseline_commit='eb64816ead5cc533745605e8ae22c71c4f4415c8'
before=json.loads(subprocess.check_output(['rtk','proxy','git','show',baseline_commit+':src/data/style-courses.generated.json'],cwd=root))
after=json.loads((root/'src/data/style-courses.generated.json').read_text(encoding='utf-8'))

clarifications={
    'Aligns items horizontally':'Aligns items along the main axis (set by flex-direction)',
    'Aligns items vertically':'Aligns items along the cross axis',
    'Fixed and sticky elements are positioned relative to the browser viewport.':'Fixed elements usually use the viewport; a transformed ancestor can create their containing block. Sticky uses its nearest scrolling ancestor and stays within its containing block.',
    'Toggles between relative and fixed positioning based on scroll position.':'Stays in normal flow, then sticks to an inset within its scrolling container and containing block.',
}
def flatten(nodes):
    for node in nodes:
        yield node
        yield from flatten(node.get('children',[]))
def digest(value): return hashlib.sha256(value.encode()).hexdigest()

report={'baselineCommit':baseline_commit,'lessons':[],'clarifications':clarifications,'missing':[]}
for course in before:
    assert before[course]['tasks']==after[course]['tasks'], 'Existing tasks changed'
    assert before[course]['quiz']==after[course]['quiz'], 'Existing quiz changed'
    for old in before[course]['lessons']:
        new=next(item for item in after[course]['lessons'] if item['id']==old['id'])
        all_nodes=list(flatten(new['nodes']))
        text={node['text'] for node in all_nodes if 'text' in node}
        missing_text=[]
        for node in flatten(old['nodes']):
            if 'text' not in node: continue
            expected=node['text']
            for original,corrected in clarifications.items(): expected=expected.replace(original,corrected)
            if expected not in text: missing_text.append(expected)
        missing_examples=[code for code in old['examples'] if code not in new['examples']]
        if missing_text or missing_examples: report['missing'].append({'course':course,'lesson':old['id'],'text':missing_text,'examples':missing_examples})
        report['lessons'].append({'course':course,'lesson':old['id'],'originalTextLeaves':sum('text' in node for node in flatten(old['nodes'])),'originalExampleHashes':[digest(code) for code in old['examples']],'exampleCount':len(new['examples']),'styledNodes':sum(bool(node.get('attrs',{}).get('class') or node.get('attrs',{}).get('style')) for node in all_nodes),'notesPages':new.get('notesPages',[])})

properties=['font-family','font-style','font-variant','font-weight','font-size','font','color','background-color','background-image','background-repeat','background-attachment','background','word-spacing','letter-spacing','text-decoration','vertical-align','line-height','text-transform','text-align','text-indent','list-style-type','list-style-image','list-style-position','list-style','margin','padding','border-color','border-width','border-style','border','border-radius','width','height','float','clear','position','top','right','bottom','left','display','align-items','justify-content','gap','flex-direction','transition']
properties += [family+'-'+side for family in ['margin','padding','border'] for side in ['top','right','bottom','left']]
properties += ['border-'+side+'-'+part for side in ['top','right','bottom','left'] for part in ['width','style','color']]
content=json.dumps([lesson['nodes'] for lesson in after['css']['lessons']])
missing_properties=[prop for prop in properties if prop not in content]
assert not missing_properties, missing_properties
report['handwrittenCssProperties']=sorted(set(properties))
report['notes']={
 'css':{'driveId':'1CVoM8VfnFLxc5tuTDcpjHWZAKUKaaDLA','pagesReviewed':45,'coverage':[
  {'pages':[1],'topics':'Introduction and characteristics','lessons':['what-is-css','characteristics-of-css']},
  {'pages':[2,3],'topics':'Inline, internal, external CSS','lessons':['three-ways-to-insert-css']},
  {'pages':list(range(4,11)),'topics':'Syntax, cascade, selectors, multiple classes','lessons':['css-syntax','priorities-of-css','css-selectors']},
  {'pages':[11,12,13,26,27],'topics':'Borders and all side longhands','lessons':['border-properties']},
  {'pages':[14,15,16,17,18,19,28],'topics':'Display, navigation, dimensions, float and clear','lessons':['display-property','display-flex']},
  {'pages':[19,20],'topics':'Font family, size, weight, variant and shorthand','lessons':['font-properties']},
  {'pages':[20,21,35],'topics':'Colour, backgrounds, repeat, attachment, gradients','lessons':['background-properties']},
  {'pages':[22,23],'topics':'Text, spacing, vertical alignment and case','lessons':['text-properties']},
  {'pages':[23,24],'topics':'List markers and shorthand','lessons':['list-styles']},
  {'pages':[24,25,26],'topics':'Margin and padding on all four sides','lessons':['css-box-model-comprehensive-guide']},
  {'pages':[29,30,31,32],'topics':'All five positioning modes','lessons':['css-position-properties']},
  {'pages':[33,41,42],'topics':'Hover, transition and image gallery','lessons':['box-shadow','display-flex']},
  {'pages':list(range(33,43)),'topics':'Form card, news layout and image gallery worked examples','lessons':['display-flex']},
  {'pages':[43,44,45],'topics':'HTML required and pattern validation','route':'/html/elements','crossLinkedFrom':'display-flex'},
 ]},
 'w3css':{'driveId':'1CWZRb_lQCn65zLUSEbRnihxyebsOZ-NK','pagesReviewed':10,'coverage':[
  {'pages':[1,2],'topics':'Framework setup, colours and hover','lessons':['how-to-use-w3-css','w3-css-classes-colors-and-hover-effects']},
  {'pages':[3],'topics':'All border sides, thick bars, hover borders','lessons':['w3-css-border-classes']},
  {'pages':[4],'topics':'Font sizes and custom overrides','lessons':['w3-css-font-size-classes','how-to-use-w3-css']},
  {'pages':[5],'topics':'Text alignment, spacing, opacity','lessons':['w3-css-text-classes']},
  {'pages':[5,6,7],'topics':'All table classes','lessons':['w3-css-table-classes']},
  {'pages':[7,8],'topics':'Container, panel, rounded panel, buttons and display positions','lessons':['w3-css-container','w3-css-panel','w3-css-rounded-panel','w3-css-button','w3-css-display-container','w3-css-display-positions','collapsible-panel']},
  {'pages':[8,9,10],'topics':'Lists, close controls and image classes','lessons':['w3-css-lists','w3-css-image-classes']},
 ]}
}
for note in report['notes'].values():
    assert {page for group in note['coverage'] for page in group['pages']}==set(range(1,note['pagesReviewed']+1))
assert not report['missing'], json.dumps(report['missing'],ensure_ascii=False)[:5000]
(root/'docs/STYLE_LESSON_COVERAGE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'lessonsChecked':len(report['lessons']),'originalTextLeavesRetained':sum(row['originalTextLeaves'] for row in report['lessons']),'originalCodeExamplesRetained':sum(len(row['originalExampleHashes']) for row in report['lessons']),'cssNotePropertiesCovered':len(report['handwrittenCssProperties']),'notesPagesReviewed':55,'missing':len(report['missing'])}))
