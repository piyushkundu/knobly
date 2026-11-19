import type { StyleCourseId } from '@/lib/style-course-types';

export function CourseMark({ course, className = '' }: { course: StyleCourseId; className?: string }) {
    if (course === 'w3css') return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="4" y="5" width="56" height="54" rx="15" fill="#047857" /><rect x="12" y="14" width="40" height="9" rx="3" fill="#a7f3d0" /><rect x="12" y="29" width="16" height="21" rx="3" fill="#fff" /><rect x="34" y="29" width="18" height="8" rx="3" fill="#6ee7b7" /><rect x="34" y="42" width="18" height="8" rx="3" fill="#6ee7b7" /></svg>;
    return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M7 3h50l-4.6 51L32 60l-20.4-6L7 3Z" fill="#2563eb" /><path d="M32 7v48l16.6-4.7L52.5 7H32Z" fill="#3b82f6" /><path d="M18 14h28l-.6 6H25l.5 6h19.3L43 44l-11 3-11-3-.8-9h6l.4 4.5 5.4 1.5 5.4-1.5.8-7.5H20L18 14Z" fill="#fff" /></svg>;
}

export default function CourseArtwork({ course }: { course: StyleCourseId }) {
    return <div className="sc-artwork" aria-hidden="true">
        <div className="sc-art-orbit sc-art-orbit-one" /><div className="sc-art-orbit sc-art-orbit-two" />
        <div className="sc-art-browser"><div className="sc-art-browser-bar"><i /><i /><i /><span>your-creation.css</span><b>LIVE</b></div><div className="sc-art-browser-body"><div className="sc-art-sample"><div className="sc-art-sample-orb" /><span>DESIGN WITHOUT LIMITS</span><strong>Make it<br />beautiful.</strong><div className="sc-art-sample-lines"><i /><i /></div><div className="sc-art-sample-button">Let’s create <span>↗</span></div></div><div className="sc-art-palette"><i /><i /><i /><i /></div></div></div>
        <div className="sc-art-shield"><CourseMark course={course} /></div>
        <div className="sc-art-code"><div><i />style.css</div><code><span>.your-ideas</span> {'{'}<br /><b>  display:</b> <em>grid;</em><br /><b>  gap:</b> <em>16px;</em><br />{'}'}</code></div>
        <div className="sc-art-label"><span>✦</span>{course === 'css' ? 'A little code. A lot of creativity.' : 'Beautiful layouts. Simple classes.'}</div>
    </div>;
}

export function CourseBackdrop({ course }: { course: StyleCourseId }) {
    return <div className="sc-backdrop" aria-hidden="true"><div className="sc-backdrop-wash" /><svg className="sc-code-pattern" width="100%" height="100%"><defs><pattern id={`sc-pattern-${course}`} width="150" height="150" patternUnits="userSpaceOnUse"><text x="12" y="30">{'{ }'}</text><text x="80" y="75">.class</text><text x="20" y="122">#style</text></pattern></defs><rect width="100%" height="100%" fill={`url(#sc-pattern-${course})`} /></svg><svg className="sc-trail sc-trail-one" viewBox="0 0 1400 180" preserveAspectRatio="none"><path d="M-50 120Q150 30 350 100T750 95T1150 100T1500 75" /></svg><svg className="sc-trail sc-trail-two" viewBox="0 0 1400 180" preserveAspectRatio="none"><path d="M-50 50Q200 150 400 85T800 90T1200 80T1500 120" /></svg><div className="sc-backdrop-symbol">{'{'}<span>{'}'}</span></div></div>;
}
