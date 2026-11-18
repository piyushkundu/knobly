// Emmet 2.4.11 ships declarations but omits them from its package exports map.
// Describe the small public API used here until that upstream map is corrected.
declare module 'emmet' {
    export interface MarkupNode { name?: string; attributes?: { name?: string }[]; children: MarkupNode[] }
    export interface MarkupTree { children: MarkupNode[] }
    export interface Config { readonly __emmetConfig?: never }
    export interface ExtractedAbbreviation { abbreviation: string; start: number; end: number; location: number }
    export function extract(source: string, position: number): ExtractedAbbreviation | undefined;
    export function resolveConfig(config?: {
        syntax?: string;
        maxRepeat?: number;
        options?: {
            'output.indent'?: string;
            'output.field'?: (index: number, placeholder: string) => string;
        };
    }): Config;
    export function parseMarkup(abbreviation: string, config: Config): MarkupTree;
    export function stringifyMarkup(tree: MarkupTree, config: Config): string;
}
