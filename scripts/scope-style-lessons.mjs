// Keep the source lesson graphics without allowing their CSS to style the app.
import postcss from 'postcss';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

function splitSelectors(value) {
    const result = [];
    let depth = 0, quote = '', start = 0;
    for (let i = 0; i < value.length; i++) {
        const char = value[i];
        if (quote) { if (char === quote && value[i - 1] !== '\\') quote = ''; continue; }
        if (char === '"' || char === "'") quote = char;
        else if (char === '(' || char === '[') depth++;
        else if (char === ')' || char === ']') depth--;
        else if (char === ',' && depth === 0) { result.push(value.slice(start, i).trim()); start = i + 1; }
    }
    result.push(value.slice(start).trim());
    return result;
}
export function scopeLessonCss(css, name) {
    const root = postcss.parse(css);
    const scope = `.sc-site :where(.sc-rich-source.sc-source-${name})`;
    const animations = new Map();
    root.walkAtRules(/keyframes$/i, rule => {
        const original = rule.params;
        rule.params = `sc-${name}-${original}`;
        animations.set(original, rule.params);
    });
    root.walkAtRules(/^(import|font-face|charset)$/i, rule => rule.remove());
    root.walkRules(rule => {
        if (/keyframes$/i.test(rule.parent?.name || '')) return;
        const selectors = splitSelectors(rule.selector).filter(selector => !/(^|[\s>+~])(nav|header|footer|button)(?=$|[\s>+~.:#[])|\.button-(container|link)/.test(selector));
        if (!selectors.length) { rule.remove(); return; }
        rule.selector = selectors.map(selector => {
            const rooted = /^(html|body|:root)(?=$|[\s>+~.:#[])/.test(selector);
            const mapped = selector.replace(/(^|[\s>+~])(html|body|:root)(?=$|[\s>+~.:#[])/g, (_, space) => space + scope)
                .replace(/(^|[\s>+~])(h[12])(?=$|[\s>+~.:#[])/g, (_, space, tag) => `${space}[data-source-heading="${tag}"]`);
            return rooted ? mapped : `${scope} ${mapped}`;
        }).join(',\n');
    });
    root.walkDecls(decl => {
        if (/animation/.test(decl.prop)) for (const [before, after] of animations) decl.value = decl.value.replace(new RegExp(`\\b${before}\\b`, 'g'), after);
        decl.value = decl.value.replace(/(?:custom-)?marker\.png/g, '/style-course/marker.svg').replace(/image\.jpg/g, '/practice-media/landscape.svg');
    });
    return root.toString();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const root = new URL('../', import.meta.url);
    const parts = ['/* Generated from the archived source. Run node scripts/scope-style-lessons.mjs. */'];
    for (const name of ['cssintro', 'cssproperties', 'w3css']) {
        const source = readFileSync(new URL(`public/style-course/originals/${name}.html.txt`, root), 'utf8');
        const head = source.split(/<\/head\s*>/i)[0];
        const styles = [...head.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map(match => match[1]).join('\n');
        const framework = name === 'w3css' ? readFileSync(new URL('public/style-course/w3.css', root), 'utf8') : '';
        parts.push(scopeLessonCss(framework + '\n' + styles, name));
    }
    const target = new URL('src/components/style-course/style-source.generated.css', root);
    writeFileSync(target, parts.join('\n'));
    console.log('Generated scoped source lesson styles:', fileURLToPath(target));
}
