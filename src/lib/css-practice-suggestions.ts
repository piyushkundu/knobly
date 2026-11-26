import type * as Monaco from 'monaco-editor';
import { getCSSLanguageService, TextDocument, type CompletionItem } from 'vscode-css-languageservice';

const service = getCSSLanguageService();
const blank = (text: string) => text.replace(/[^\r\n]/g, ' ');

// Preserve every offset so edits inside an HTML style block replace the right characters.
export function cssSourceAt(source: string, offset: number, language: string): string | null {
    if (language === 'css') return source;
    if (language !== 'html') return null;
    const markup = source.replace(/<!--[\s\S]*?(?:-->|$)|<(script|textarea|title|xmp)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, blank);
    const blocks = /(<style\b(?:"[^"]*"|'[^']*'|[^'">])*?>)([\s\S]*?)(?:<\/style\s*>|$)/gi;
    for (const match of markup.matchAll(blocks)) {
        const start = match.index! + match[1].length;
        const end = start + match[2].length;
        if (offset >= start && offset <= end) return blank(source.slice(0, start)) + source.slice(start, end) + blank(source.slice(end));
    }
    return null;
}

export function cssCompletionItems(source: string, offset: number, language: string): CompletionItem[] {
    const css = cssSourceAt(source, offset, language);
    if (css === null || css.length > 200_000) return [];
    const document = TextDocument.create('inmemory://practice.css', 'css', 1, css);
    return service.doComplete(document, document.positionAt(offset), service.parseStylesheet(document)).items;
}

export function installCssSuggestions(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    const disposables: Monaco.IDisposable[] = [];
    // Monaco waits for every provider in a group. A stalled remote worker can
    // otherwise hide even our completed results behind an endless Loading popup.
    // The HTML practice provider already covers tags/attributes; restore native
    // completion providers when this practice session ends.
    type CompletionDefaults = {readonly modeConfiguration:{readonly completionItems?:boolean};setModeConfiguration(options:{readonly completionItems?:boolean}):void};
    // The installed types use top-level namespaces; older CDN runtimes use languages.*.
    const legacy=monaco.languages as unknown as {html?:{htmlDefaults?:CompletionDefaults};css?:{cssDefaults?:CompletionDefaults}};
    const defaultsList:(CompletionDefaults|undefined)[]=[monaco.html?.htmlDefaults??legacy.html?.htmlDefaults,monaco.css?.cssDefaults??legacy.css?.cssDefaults];
    for (const defaults of defaultsList) {
        if(!defaults)continue;
        const previous=defaults.modeConfiguration;
        defaults.setModeConfiguration({...previous,completionItems:false});
        disposables.push({dispose:()=>defaults.setModeConfiguration(previous)});
    }
    const range = (value: {start:{line:number;character:number};end:{line:number;character:number}}) => new monaco.Range(value.start.line+1,value.start.character+1,value.end.line+1,value.end.character+1);
    for (const language of ['css', 'html']) disposables.push(monaco.languages.registerCompletionItemProvider(language, {
        triggerCharacters: [':', '-', ' ', ';', '{'],
        provideCompletionItems(model, position) {
            if (model !== editor.getModel()) return { suggestions: [] };
            const word = model.getWordUntilPosition(position);
            return { suggestions: cssCompletionItems(model.getValue(), model.getOffsetAt(position), model.getLanguageId()).map(item => {
                const edit = item.textEdit;
                return {
                    label: item.label,
                    kind: item.kind === 10 ? monaco.languages.CompletionItemKind.Property : item.kind === 16 ? monaco.languages.CompletionItemKind.Color : monaco.languages.CompletionItemKind.Value,
                    insertText: edit?.newText || item.insertText || item.label,
                    insertTextRules: item.insertTextFormat === 2 ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
                    range: edit ? range('range' in edit ? edit.range : edit.replace) : new monaco.Range(position.lineNumber,word.startColumn,position.lineNumber,word.endColumn),
                    sortText: item.sortText,
                    filterText: item.filterText,
                    detail: item.detail || 'CSS · VS Code language service',
                    documentation: typeof item.documentation === 'string' ? item.documentation : item.documentation ? {value:item.documentation.value} : undefined,
                    command: item.command ? {id:item.command.command,title:item.command.title} : undefined,
                };
            }) };
        },
    }));
    const typing = editor as typeof editor & {onDidType(listener:(text:string)=>void):Monaco.IDisposable};
    disposables.push(typing.onDidType(text => {
        if (!/^[a-zA-Z\-:]$/.test(text)) return;
        const model = editor.getModel(), position = editor.getPosition();
        if (model && position && cssSourceAt(model.getValue(),model.getOffsetAt(position),model.getLanguageId()) !== null) editor.trigger('knobly.css','editor.action.triggerSuggest',{});
    }));
    return () => disposables.splice(0).forEach(disposable=>disposable.dispose());
}
