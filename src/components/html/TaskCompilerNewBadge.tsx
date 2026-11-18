'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { isPracticeNew, isDownloadNew, PRACTICE_LAUNCHED_AT, DOWNLOAD_LAUNCHED_AT, PRACTICE_NEW_UNTIL, DOWNLOAD_NEW_UNTIL } from '@/lib/task-practice';

const serverSnapshot = () => false;

export default function TaskCompilerNewBadge({ feature }: { feature: 'practice' | 'download' }) {
    const snapshot = useCallback(() => feature === 'practice' ? isPracticeNew(Date.now()) : isDownloadNew(Date.now()), [feature]);
    const subscribe = useCallback((notify: () => void) => {
        const now = Date.now();
        const starts = feature === 'practice' ? PRACTICE_LAUNCHED_AT : DOWNLOAD_LAUNCHED_AT;
        const expires = feature === 'practice' ? PRACTICE_NEW_UNTIL : DOWNLOAD_NEW_UNTIL;
        const timers: ReturnType<typeof setTimeout>[] = [];
        if (now < starts) timers.push(setTimeout(notify, starts - now));
        if (now < expires) timers.push(setTimeout(notify, expires - now));
        return () => timers.forEach(clearTimeout);
    }, [feature]);
    const visible = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
    return visible ? <span className="rounded px-1 py-0.5 text-[8px] font-extrabold leading-none tracking-wide" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>NEW</span> : null;
}
