export const CSS_MILESTONES = [
    {year:'1994',title:'An idea for stylesheets',detail:'Håkon Wium Lie proposed CSS while working at CERN. Web authors needed a way to describe presentation separately from HTML content.',takeaway:'HTML could describe the document; a stylesheet could describe its appearance.'},
    {year:'1996',title:'CSS Level 1',detail:'CSS1 became a W3C Recommendation on 17 December 1996. It standardised core styling such as colours, fonts, text, margins, padding and borders.',takeaway:'A shared styling language gave authors and browser makers a common reference.'},
    {year:'1998',title:'CSS Level 2',detail:'CSS2 became a W3C Recommendation on 12 May 1998. It expanded the system with features such as positioning, media-specific styles and table styling.',takeaway:'CSS could describe more of a page layout and different output media.'},
    {year:'1999+',title:'Development in modules',detail:'Drafts of the first CSS3 modules appeared in 1999. Features began developing in separate modules instead of waiting for one huge specification.',takeaway:'Selectors, colours, layout and other areas can progress at different levels.'},
    {year:'2011',title:'CSS 2.1 becomes a Recommendation',detail:'CSS 2.1 became a W3C Recommendation on 7 June 2011. It refined and clarified CSS2 around interoperable implementation.',takeaway:'2011 is the CSS 2.1 Recommendation milestone, not the release date of all modern CSS.'},
    {year:'Today',title:'A family of evolving features',detail:'Modern CSS includes modules for flexible and grid layouts, media queries, custom properties, animation and many other features. Each module develops independently.',takeaway:'CSS3 is a familiar umbrella term. Check support for a feature rather than looking for one single CSS3 or CSS4 release.'},
] as const;

export const SELECTOR_ROWS = [
    {id:'card',depth:0,markup:'<div class="card">',text:'Card container'},
    {id:'heading',depth:1,markup:'<h2>CSS course</h2>',text:'CSS course'},
    {id:'intro',depth:1,markup:'<p id="intro">First paragraph</p>',text:'First paragraph'},
    {id:'nested',depth:1,markup:'<section>',text:'Nested section'},
    {id:'deep',depth:2,markup:'<p class="note highlight">Nested paragraph</p>',text:'Nested paragraph'},
    {id:'after',depth:0,markup:'<p class="note">Immediately after the div</p>',text:'Immediately after the div'},
    {id:'later',depth:0,markup:'<p>Another following paragraph</p>',text:'Another following paragraph'},
    {id:'list',depth:0,markup:'<ul>',text:'Lesson list'},
    {id:'one',depth:1,markup:'<li>HTML</li>',text:'HTML'},
    {id:'two',depth:1,markup:'<li>CSS</li>',text:'CSS'},
    {id:'three',depth:1,markup:'<li>JavaScript</li>',text:'JavaScript'},
    {id:'email',depth:0,markup:'<input type="email" required>',text:'Email input'},
    {id:'checkbox',depth:0,markup:'<input type="checkbox">',text:'Checkbox input'},
    {id:'link',depth:0,markup:'<a href="https://example.com">Read more</a>',text:'Read more'},
] as const;

export const SELECTOR_LESSONS = [
    {selector:'*',name:'Universal selector',category:'Basics',meaning:'Har element ko select karta hai.',rule:'* means every element in the example document.',matches:SELECTOR_ROWS.map(row=>row.id)},
    {selector:'p',name:'Element / type selector',category:'Basics',meaning:'Sirf <p> elements select hote hain.',rule:'Tag ka naam likhein; angle brackets nahi.',matches:['intro','deep','after','later']},
    {selector:'#intro',name:'ID selector',category:'Basics',meaning:'id="intro" wala element select hota hai.',rule:'# ke baad ID aati hai. Ek page par ID unique rakhein.',matches:['intro']},
    {selector:'.note',name:'Class selector',category:'Basics',meaning:'note class wale saare elements select hote hain.',rule:'Dot class ko select karta hai. Same class multiple elements par ho sakti hai.',matches:['deep','after']},
    {selector:'[type]',name:'Attribute selector',category:'Attributes',meaning:'Jis element par type attribute hai, use select karega.',rule:'Square brackets attribute ki presence check karte hain; value kuch bhi ho sakti hai.',matches:['email','checkbox']},
    {selector:'[type="email"]',name:'Attribute equals value',category:'Attributes',meaning:'type ki exact value email honi chahiye.',rule:'[type] aur [type="email"] alag conditions hain.',matches:['email']},
    {selector:'h2, p',name:'Group selector',category:'Relationships',meaning:'h2 aur p dono groups par same CSS lagegi.',rule:'Comma means OR: is example mein heading aur paragraphs dono.',matches:['heading','intro','deep','after','later']},
    {selector:'.card p',name:'Descendant selector',category:'Relationships',meaning:'Card ke andar kisi bhi depth par jo paragraph hai, use select karega.',rule:'Space means inside: direct child aur nested child dono.',matches:['intro','deep']},
    {selector:'.card > p',name:'Direct child selector',category:'Relationships',meaning:'Card ke sirf direct paragraph children select honge.',rule:'> ek level neeche dekhta hai. Nested section ka paragraph select nahi hoga.',matches:['intro']},
    {selector:'.card + p',name:'Adjacent sibling selector',category:'Relationships',meaning:'Card ke turant baad, same parent ka paragraph select hoga.',rule:'+ sirf immediately following sibling ko dekhta hai.',matches:['after']},
    {selector:'.card ~ p',name:'General sibling selector',category:'Relationships',meaning:'Card ke baad same parent ke saare matching paragraphs select honge.',rule:'~ following siblings ko dekhta hai; parent ya descendants ko nahi.',matches:['after','later']},
    {selector:'li:nth-child(even)',name:'nth-child pseudo-class',category:'States & patterns',meaning:'List mein even positions ke li items select honge.',rule:'Counting 1 se start hoti hai. Is list mein second item even hai.',matches:['two']},
    {selector:'.note.highlight',name:'Two classes together',category:'States & patterns',meaning:'Ek hi element par note aur highlight dono classes honi chahiye.',rule:'Beech mein space nahi. .note .highlight ka meaning alag hai.',matches:['deep']},
    {selector:'a:hover',name:'Hover pseudo-class',category:'States & patterns',meaning:'Link par pointer aane par CSS apply hogi.',rule:'Neeche example link par pointer rakhein. Pointer hatane par hover state khatam hoti hai.',matches:['link']},
    {selector:'a:focus',name:'Focus pseudo-class',category:'States & patterns',meaning:'Link keyboard ya click se focus hone par select hota hai.',rule:'Example link tak Tab se pahunchein, ya us par click karein. Focus aur hover alag states hain.',matches:['link']},
] as const;

export interface TeachingRule { id:string; selector:string; colour:string; specificity:readonly number[]; order:number; enabled:boolean; important?:boolean }
/** This lab compares author rules in one cascade layer, with no transitions/animations. */
export function winningTeachingRule(rules: readonly TeachingRule[]) {
    return rules.filter(rule=>rule.enabled).toSorted((a,b)=>{
        if (!!a.important!==!!b.important) return a.important?-1:1;
        for(let index=0;index<Math.max(a.specificity.length,b.specificity.length);index++) {
            const difference=(b.specificity[index]||0)-(a.specificity[index]||0);
            if(difference) return difference;
        }
        return b.order-a.order;
    })[0];
}
