// Ready-to-import MCQs must use four labelled options and exactly one trailing
// answer marker. Leave unstructured input on the existing AI formatting path.
export function formattedQuestionCount(text: string): number {
    const blocks = text.split('###---###').map(block => block.trim()).filter(Boolean);
    if (!blocks.length) return 0;
    for (const block of blocks) {
        const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const firstOption = lines.findIndex(line => /^[A-D][.)]\s+/.test(line));
        if (firstOption < 1) return 0;
        const options = lines.slice(firstOption);
        if (options.length !== 4 || !options.every((line, i) => new RegExp(`^${'ABCD'[i]}[.)]\\s+\\S`).test(line))) return 0;
        const markers = options.filter(line => /\s\*$/.test(line));
        if (markers.length !== 1 || options.some(line => line.replace(/\s\*$/, '').includes('*'))) return 0;
    }
    return blocks.length;
}
