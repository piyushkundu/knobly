import postcss, { type Node as CssNode } from 'postcss';
import { parseHTML } from 'linkedom';
import { getCSSLanguageService, TextDocument } from 'vscode-css-languageservice';
import type { StyleDraft, StyleTask } from './style-course-types';

export interface StyleEvaluation {
    score: number;
    grade: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    matchedSkills: string[];
    missingSkills: string[];
    syntaxErrors: string[];
    breakdown: { label: string; score: number; max: number }[];
}

const languageService = getCSSLanguageService();
const borderStyle = /\b(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)\b/i;
function tokens(text: string) { return new Set(text.toLowerCase().match(/[a-z0-9]+/g) || []); }
function textOnly(html: string) {
    const {document} = parseHTML(html);
    document.querySelectorAll('script,style,template,head').forEach(element=>element.remove());
    return document.documentElement?.textContent || document.textContent || '';
}

// This is a repeatable code/skill check, not a screenshot or pixel-match score.
// Parsing is inert: submitted scripts, links, imports and resources are never executed/fetched.
export function evaluateStyleTask(task: StyleTask, draft: StyleDraft): StyleEvaluation {
    const {document} = parseHTML(draft.html);
    const syntaxErrors: string[] = [];
    const applied: {prop:string;value:string}[] = [];
    const sheets = [draft.css, ...Array.from(document.querySelectorAll('style')).map(element=>element.textContent || '')];
    let ruleCount = 0;
    for (const [index, css] of sheets.entries()) {
        if (!css.trim()) continue;
        const label = index===0?'style.css':`HTML style block ${index}`;
        try {
            const root = postcss.parse(css);
            const doc = TextDocument.create(`inmemory://submission-${index}.css`,'css',1,css);
            for (const diagnostic of languageService.doValidation(doc,languageService.parseStylesheet(doc))) {
                if (diagnostic.severity && diagnostic.severity<=2) syntaxErrors.push(`${label}, line ${diagnostic.range.start.line+1}: ${diagnostic.message}`);
            }
            root.walkRules(rule=>{
                let parent:CssNode|undefined=rule.parent;
                while(parent) { if(parent.type==='atrule'&&'name' in parent&&/keyframes$/i.test(String(parent.name)))return; parent=parent.parent; }
                try {
                    const selector=rule.selector.replace(/:(?:hover|active|focus|visited|link)(?![\w-])/g,'');
                    const matches=Array.from(document.querySelectorAll(selector)).some(element=>!element.closest('head,style,script,template'));
                    if(!matches)return;
                    const declarations=new Map<string,string>();
                    for(const node of rule.nodes)if(node.type==='decl')declarations.set(node.prop.toLowerCase(),node.value.trim().toLowerCase());
                    if(declarations.size)ruleCount++;
                    for(const [prop,value] of declarations)applied.push({prop,value});
                } catch { /* Invalid/unmatched selectors do not earn skill credit. */ }
            });
        } catch (error) {
            const problem=error as {reason?:string;line?:number};
            syntaxErrors.push(`${label}${problem.line?`, line ${problem.line}`:''}: ${problem.reason||'CSS could not be parsed.'}`);
        }
    }
    for(const element of document.querySelectorAll('[style]')) {
        if(element.closest('head,style,script,template'))continue;
        try { postcss.parse(`x{${element.getAttribute('style')}}`).walkDecls(declaration=>{applied.push({prop:declaration.prop.toLowerCase(),value:declaration.value.trim().toLowerCase()});});ruleCount++; }
        catch { syntaxErrors.push('An HTML style attribute has invalid CSS.'); }
    }
    const has = (prop:string,value?:string) => applied.some(declaration=>declaration.prop===prop&&(!value||declaration.value===value));
    const hasBorder = (part:string) => applied.some(({prop,value})=>{
        if(prop===part)return true;
        if(!/^border(?:-(?:top|right|bottom|left))?$/.test(prop))return false;
        if(part==='border')return true;
        if(part==='border-style')return borderStyle.test(value);
        if(part==='border-width')return /\b(?:\d+(?:\.\d+)?(?:px|em|rem)|thin|medium|thick)\b/.test(value);
        return part==='border-color'&&/(?:#[\da-f]{3,8}\b|(?:rgb|hsl)a?\(|\b(?:red|blue|green|orange|purple|black|white|gray|grey|transparent|currentcolor)\b)/.test(value);
    });
    const matchesSkill = (skill:string) => {
        if(skill.startsWith('w3-'))return Array.from(document.querySelectorAll('[class]')).some(element=>element.classList.contains(skill));
        if(skill==='inline-block'||skill==='flex')return has('display',skill);
        const colon=skill.indexOf(':');
        if(colon>=0)return has(skill.slice(0,colon).trim(),skill.slice(colon+1).trim());
        if(['border','border-style','border-width','border-color'].includes(skill))return hasBorder(skill);
        if(skill==='background-color')return has('background-color')||has('background');
        if(skill==='margin'||skill==='padding')return applied.some(({prop})=>prop===skill||prop.startsWith(skill+'-'));
        return has(skill);
    };
    const matchedSkills=task.skills.filter(matchesSkill),missingSkills=task.skills.filter(skill=>!matchesSkill(skill));
    let structure=0;
    const structureTips:string[]=[];
    const markup=draft.html.replace(/<!--[\s\S]*?(?:-->|$)/g,'');
    if(/<!doctype\s+html\s*>/i.test(markup))structure+=5;else structureTips.push('Add <!DOCTYPE html>.');
    if(/<html[\s>]/i.test(markup)&&/<head[\s>]/i.test(markup)&&/<body[\s>]/i.test(markup))structure+=10;else structureTips.push('Include html, head and body in index.html.');
    if(document.querySelector('title')?.textContent?.trim())structure+=5;else structureTips.push('Give the page a title inside head.');
    if(document.querySelector('meta[name="viewport"]'))structure+=5;else structureTips.push('Add a viewport meta tag for small screens.');
    const expected=tokens(textOnly(task.solution.html)),actual=tokens(textOnly(draft.html));
    const coverage=expected.size?[...expected].filter(token=>actual.has(token)).length/expected.size:0;
    const content=Math.round(20*coverage);
    const skillScore=Math.round(40*matchedSkills.length/Math.max(1,task.skills.length));
    const hasFramework=task.skills.some(skill=>skill.startsWith('w3-'))&&matchedSkills.length>0;
    const syntax=ruleCount||hasFramework?Math.max(0,15-Math.min(syntaxErrors.length,5)*3):0;
    const score=structure+content+skillScore+syntax;
    const grade=score>=90?'A+':score>=80?'A':score>=70?'B':score>=60?'C':score>=40?'D':'F';
    const strengths:string[]=[],improvements:string[]=[];
    if(structure===25)strengths.push('Complete HTML document structure.');
    if(matchedSkills.length)strengths.push(`Used on page elements: ${matchedSkills.join(', ')}.`);
    if(content>=16)strengths.push('Most of the target page content is present.');
    improvements.push(...structureTips);
    if(missingSkills.length)improvements.push(`Add or correct these skills on matching HTML elements: ${missingSkills.join(', ')}.`);
    if(coverage<.8)improvements.push('Compare the target heading, navigation, cards and footer; some content is still missing.');
    if(!ruleCount&&!hasFramework)improvements.push('Write CSS in style.css or an HTML <style> block and make sure its selectors match your elements.');
    if(syntaxErrors.length)improvements.push('Fix the CSS syntax errors listed below and submit again.');
    if(!improvements.length)improvements.push('Use Compare to check colours, spacing and small-screen layout visually.');
    return {score,grade,feedback:score>=80?'Accha kaam! Core code checks pass ho rahe hain. Ab target se design compare karein.':'Achhi shuruaat. Neeche missing parts dekhein, code improve karein aur phir Submit karein.',strengths,improvements,matchedSkills,missingSkills,syntaxErrors:syntaxErrors.slice(0,12),breakdown:[{label:'HTML structure',score:structure,max:25},{label:'Target content',score:content,max:20},{label:'CSS skills',score:skillScore,max:40},{label:'CSS syntax',score:syntax,max:15}]};
}
