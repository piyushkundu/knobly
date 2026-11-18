// Emmet 2.4.11 ships declarations but omits them from its package exports map.
// Describe the small public API used here until that upstream map is corrected.
declare module 'emmet' {
    export interface ExtractedAbbreviation { abbreviation: string; start: number; end: number; location: number }
    export function extract(source: string, position: number): ExtractedAbbreviation | undefined;
    export default function expand(abbreviation: string, config?: {
        syntax?: string;
        maxRepeat?: number;
        options?: {
            'output.indent'?: string;
            'output.field'?: (index: number, placeholder: string) => string;
        };
    }): string;
}
