import translations from '@/data/html-test-option-hindi.json';

export const HTML_PRACTICE_TEST_ID = 'm9kENtknsRZ22KD2HnPV';
const hindiOptions: Record<string, string> = translations;

export function htmlOptionHindi(testId: string | undefined, text: string): string | undefined {
    if (testId !== HTML_PRACTICE_TEST_ID) return undefined;
    return Object.hasOwn(hindiOptions, text) ? hindiOptions[text] : undefined;
}
