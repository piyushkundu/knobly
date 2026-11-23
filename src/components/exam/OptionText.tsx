import { htmlOptionHindi } from '@/lib/html-test-option-language';

export default function OptionText({ testId, text }: { testId?: string; text: string }) {
    const hindi = htmlOptionHindi(testId, text);
    if (!hindi) return <>{text}</>;
    return <span className="block leading-relaxed break-words">
        <span lang="en" className="block">{text}</span>
        <span lang="hi" className="block mt-1.5">{hindi}</span>
    </span>;
}
