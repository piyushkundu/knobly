import { bilingualParts, type ExamLanguage } from '@/lib/exam-presentation';
import styles from './ExamWorkspace.module.css';

export default function ExamText({ text, language = 'both' }: {text:string;language?:ExamLanguage}) {
    const lines = text.split('\n');
    if (lines.length > 2 && bilingualParts(lines.slice(0,2).join('\n'))) return <span className={styles.prose}><ExamText text={lines.slice(0,2).join('\n')} language={language}/><ExamText text={lines.slice(2).join('\n')} language={language}/></span>;
    const parts = bilingualParts(text);
    if (parts) return <span className={styles.bilingual}>
        {language !== 'en' && <span lang="hi" className={styles.hindi}>{parts.hi}</span>}
        {language !== 'hi' && <span lang="en" className={language === 'both' ? styles.translation : undefined}>{parts.en}</span>}
    </span>;
    // Questions and options are text, never injected HTML. Preserve source code literally.
    return <span className={styles.prose}>{lines.map((line, index) => {
        if(bilingualParts(line))return <ExamText key={index} text={line} language={language}/>;
        const code = /^\s+\S|^\s*(?:print\(|for |while |def |return |import |from |<\/?[a-z!]|[a-z_$][\w$]*\s*=[^=])/i.test(line);
        return code ? <code className={styles.codeLine} key={index}>{line || ' '}</code> : <span className={styles.textLine} key={index}>{line || '\u00a0'}</span>;
    })}</span>;
}
