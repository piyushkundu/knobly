'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { PRACTICE_LAUNCHED_AT, DOWNLOAD_LAUNCHED_AT, PRACTICE_NEW_UNTIL, DOWNLOAD_NEW_UNTIL, PREVIEW_TOOLS_LAUNCHED_AT, PREVIEW_TOOLS_NEW_UNTIL } from '@/lib/task-practice';

const serverSnapshot = () => false;

export default function TaskCompilerNewBadge({ feature }: { feature: 'practice' | 'download' | 'autoRun' | 'fullscreen' }) {
    const starts = feature === 'practice' ? PRACTICE_LAUNCHED_AT : feature === 'download' ? DOWNLOAD_LAUNCHED_AT : PREVIEW_TOOLS_LAUNCHED_AT;
    const expires = feature === 'practice' ? PRACTICE_NEW_UNTIL : feature === 'download' ? DOWNLOAD_NEW_UNTIL : PREVIEW_TOOLS_NEW_UNTIL;
    const snapshot = useCallback(() => Date.now() >= starts && Date.now() < expires, [starts, expires]);
    const subscribe = useCallback((notify: () => void) => {
        const now = Date.now();
        const timers: ReturnType<typeof setTimeout>[] = [];
        if (now < starts) timers.push(setTimeout(notify, starts - now));
        if (now < expires) timers.push(setTimeout(notify, expires - now));
        return () => timers.forEach(clearTimeout);
    }, [starts, expires]);
    const visible = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
    return visible ? <span className="rounded px-1 py-0.5 text-[8px] font-extrabold leading-none tracking-wide" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>NEW</span> : null;
}
