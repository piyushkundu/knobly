import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(relative) {
    const exports = {};
    const source = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, { exports });
    return exports;
}
const { flexBorderTask } = load('../src/data/css-flex-border-task.ts');
const { displayBorderTask } = load('../src/data/css-display-border-task.ts');
const { previewDocument } = load('../src/lib/style-course-demo.ts');
for (const task of [displayBorderTask, flexBorderTask]) {
    writeFileSync(new URL('../public' + task.target, import.meta.url), previewDocument(task.solution, 'css') + '\n');
    process.stdout.write(`Built ${task.title} reference.\n`);
}
