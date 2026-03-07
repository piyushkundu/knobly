'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection, getDocs, getDoc, doc, setDoc, updateDoc,
    query, where, orderBy, limit, onSnapshot, addDoc
} from 'firebase/firestore';

/* ── Interfaces ── */
export interface Profile { id: string; full_name?: string; exam_track?: string;[k: string]: any; }
export interface UserState { user_id: string; track_id?: string | null; current_level: number; total_xp: number; total_points?: number; streak_days: number;[k: string]: any; }
export interface Level { id: string; level_no: number; title: string; description?: string; required_xp: number; track_id: string;[k: string]: any; }
export interface ExamTest {
    id: string; title: string; track_id: string; level_id?: string; level_no?: number; level_title?: string;
    required_xp?: number; mode: string; duration_minutes: number; total_marks: number; xp_reward: number;
    is_active: boolean; live_start?: string; live_end?: string; live_bonus_xp?: number;[k: string]: any;
}
export interface LeaderRow { id: string; user_id: string; full_name: string; current_level: number; total_xp: number; track_rank: number; exam_track: string;[k: string]: any; }
export interface Badge { id: string; badge_name: string; badge_icon?: string; description?: string; xp_reward?: number;[k: string]: any; }
export interface Attempt {
    id: string; test_title: string; total_marks: number; durationLabel: string;
    status: string; score: number; accuracy: number; submitted_at?: string; started_at?: string;
}
export interface Stats { testsCompleted: number; avgScore: number; avgAccuracy: number; totalCorrect: number; totalWrong: number; }

/* ── Hook ── */
export function useDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userState, setUserState] = useState<UserState | null>(null);
    const [levels, setLevels] = useState<Level[]>([]);
    const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
    const [availableTests, setAvailableTests] = useState<ExamTest[]>([]);
    const [lockedTests, setLockedTests] = useState<ExamTest[]>([]);
    const [liveTests, setLiveTests] = useState<ExamTest[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [attemptHistory, setAttemptHistory] = useState<Attempt[]>([]);
    const [isLoadingMain, setIsLoadingMain] = useState(true);
    const [trackSaving, setTrackSaving] = useState(false);
    const [trackError, setTrackError] = useState('');
    const [activeTest, setActiveTest] = useState<ExamTest | null>(null);
    const [stats, setStats] = useState<Stats>({ testsCompleted: 0, avgScore: 0, avgAccuracy: 0, totalCorrect: 0, totalWrong: 0 });

    // Also load from 'tests' + 'test_results' (the simpler Next.js collections)
    const [simpleTests, setSimpleTests] = useState<any[]>([]);
    const [simpleResults, setSimpleResults] = useState<any[]>([]);

    const avatarInitials = useMemo(() => {
        const name = profile?.full_name || user?.displayName || '';
        if (!name) return 'ST';
        const parts = name.trim().split(/\s+/);
        return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
    }, [profile, user]);

    const nextLevelXp = useMemo(() => {
        const level = userState?.current_level || 1;
        return 100 + (level - 1) * 50;
    }, [userState]);

    const xpProgressPercent = useMemo(() => {
        const xp = userState?.total_xp || userState?.total_points || 0;
        const pct = Math.round((xp / nextLevelXp) * 100);
        return Math.min(100, isNaN(pct) ? 0 : pct);
    }, [userState, nextLevelXp]);

    const xpToNextLevel = useMemo(() => {
        const xp = userState?.total_xp || userState?.total_points || 0;
        return Math.max(0, nextLevelXp - xp);
    }, [userState, nextLevelXp]);

    const lvlUnlocked = useCallback((lvl: Level) => {
        const xp = userState?.total_xp || userState?.total_points || 0;
        return xp >= (lvl.required_xp || 0);
    }, [userState]);

    const unlockedTestsForLevel = useMemo(() =>
        availableTests.filter(t => t.level_id === activeLevelId), [availableTests, activeLevelId]);

    const lockedTestsForLevel = useMemo(() =>
        lockedTests.filter(t => t.level_id === activeLevelId), [lockedTests, activeLevelId]);

    function formatDateTime(value?: string) {
        if (!value) return '-';
        return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    /* ── Load functions ── */
    async function loadProfile() {
        if (!user) return null;
        try {
            const snap = await getDoc(doc(db, 'profiles', user.uid));
            if (snap.exists()) { const p = { id: snap.id, ...snap.data() } as Profile; setProfile(p); return p; }
        } catch (e) { console.error('Profile error:', e); }
        return null;
    }

    async function loadUserState() {
        if (!user) return;
        try {
            const q = query(collection(db, 'exam_user_state'), where('user_id', '==', user.uid));
            const snap = await getDocs(q);
            if (snap.empty) {
                const p = profile;
                const newState: UserState = { user_id: user.uid, track_id: p?.exam_track || 'OLEVEL', current_level: 1, total_xp: 0, streak_days: 0 };
                await addDoc(collection(db, 'exam_user_state'), { ...newState, created_at: new Date().toISOString() });
                setUserState(newState);
            } else {
                setUserState(snap.docs[0].data() as UserState);
            }
        } catch (e) { console.error('loadUserState error:', e); }
    }

    async function loadLevels(p?: Profile | null) {
        try {
            const snap = await getDocs(collection(db, 'exam_levels'));
            const lvls = snap.docs.map(d => ({ id: d.id, ...d.data() } as Level));
            lvls.sort((a, b) => (a.level_no || 0) - (b.level_no || 0));
            setLevels(lvls);
            if (lvls.length > 0 && !activeLevelId) setActiveLevelId(lvls[0].id);
        } catch (e) { console.error('loadLevels error:', e); }
    }

    async function loadTests(p?: Profile | null, lvls?: Level[]) {
        try {
            const q = query(collection(db, 'exam_tests'), where('is_active', '==', true));
            const snap = await getDocs(q);
            const tests = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamTest));
            const xp = userState?.total_xp || userState?.total_points || 0;
            const allLvls = lvls || levels;
            const unlocked: ExamTest[] = [], locked: ExamTest[] = [];
            tests.forEach(t => {
                const lvl = allLvls.find(l => l.id === t.level_id) || {} as any;
                const levelNo = lvl.level_no || 1;
                // No level_id = always unlocked (0 XP). With level_id = use level's required_xp or formula
                const reqXp = !t.level_id ? 0 : (t.required_xp ?? lvl.required_xp ?? (100 + (levelNo - 1) * 50));
                const obj = { ...t, level_no: levelNo, level_title: lvl.title, required_xp: reqXp };
                if (xp >= reqXp) unlocked.push(obj); else locked.push(obj);
            });
            const sorter = (a: ExamTest, b: ExamTest) => (a.level_no || 1) - (b.level_no || 1);
            setAvailableTests(unlocked.sort(sorter));
            setLockedTests(locked.sort(sorter));
        } catch (e) { console.error('loadTests error:', e); }
    }

    async function loadLiveTests(p?: Profile | null) {
        try {
            const q = query(collection(db, 'exam_tests'), where('mode', '==', 'LIVE'), where('is_active', '==', true));
            const snap = await getDocs(q);
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamTest));
            const now = new Date();
            setLiveTests(all.filter(t => t.live_end && new Date(t.live_end) > now).sort((a, b) => new Date(a.live_start || '').getTime() - new Date(b.live_start || '').getTime()));
        } catch (e) { console.error('loadLiveTests error:', e); }
    }

    async function loadLeaderboard(p?: Profile | null) {
        try {
            // Build leaderboard from exam_user_state + profiles
            const stateSnap = await getDocs(collection(db, 'exam_user_state'));
            const states = stateSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

            // Load all profiles for name lookup
            const profileSnap = await getDocs(collection(db, 'profiles'));
            const profileMap: Record<string, any> = {};
            profileSnap.docs.forEach(d => { profileMap[d.id] = { id: d.id, ...d.data() }; });

            let board: LeaderRow[] = [];

            if (states.length > 0) {
                // Deduplicate: keep highest XP entry per user_id
                const userMap: Record<string, LeaderRow> = {};
                states.forEach((s: any) => {
                    const uid = s.user_id;
                    if (!uid) return;
                    if (!userMap[uid] || (s.total_xp || 0) > (userMap[uid].total_xp || 0)) {
                        const prof = profileMap[uid] || {};
                        userMap[uid] = {
                            id: s.id,
                            user_id: uid,
                            full_name: prof.full_name || prof.email || 'Unknown',
                            current_level: s.current_level || 1,
                            total_xp: s.total_xp || 0,
                            track_rank: 0,
                            exam_track: s.track_id || prof.exam_track || 'OLEVEL',
                        };
                    }
                });
                board = Object.values(userMap);
            } else {
                // Fallback: build from profiles if exam_user_state is empty
                board = profileSnap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        user_id: d.id,
                        full_name: data.full_name || data.email || 'Unknown',
                        current_level: 1,
                        total_xp: data.total_xp || 0,
                        track_rank: 0,
                        exam_track: data.exam_track || 'OLEVEL',
                    };
                });
            }

            // Sort by XP descending and assign ranks
            board.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));
            board.forEach((row, i) => { row.track_rank = i + 1; });

            setLeaderboard(board.slice(0, 20));
        } catch (e) { console.error('loadLeaderboard error:', e); }
    }

    async function loadBadges() {
        if (!user) return;
        try {
            const q = query(collection(db, 'exam_user_badges'), where('user_id', '==', user.uid));
            const snap = await getDocs(q);
            const userBadges = snap.docs.map(d => d.data());
            if (userBadges.length === 0) { setBadges([]); return; }
            const badgeIds = userBadges.map(ub => ub.badge_id);
            const bSnap = await getDocs(collection(db, 'exam_badges'));
            const allBadges = bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Badge));
            setBadges(allBadges.filter(b => badgeIds.includes(b.id)));
        } catch (e) { console.error('loadBadges error:', e); }
    }

    async function loadAttempts() {
        if (!user) return;
        try {
            const q = query(collection(db, 'exam_attempts'), where('user_id', '==', user.uid));
            const snap = await getDocs(q);
            const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort client-side to avoid Firebase composite index errors
            attempts.sort((a: any, b: any) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
            const recentAttempts = attempts.slice(0, 20);
            const testMap: Record<string, any> = {};
            [...availableTests, ...lockedTests].forEach(t => testMap[t.id] = t);
            const hist = recentAttempts.map((row: any) => {
                const t = testMap[row.test_id] || { title: `Test #${row.test_id?.substring(0, 6) || '?'}...` };
                return {
                    id: row.id, test_title: t.title, total_marks: t.total_marks || row.score || 0,
                    durationLabel: t.duration_minutes ? `${t.duration_minutes} min` : '-',
                    status: row.status, score: row.score, accuracy: row.accuracy || 0,
                    submitted_at: row.submitted_at, started_at: row.started_at,
                } as Attempt;
            });
            setAttemptHistory(hist);
            calcStats(hist);
        } catch (e) { console.error('loadAttempts error:', e); }
    }

    function calcStats(hist: Attempt[]) {
        if (!hist.length) { setStats({ testsCompleted: 0, avgScore: 0, avgAccuracy: 0, totalCorrect: 0, totalWrong: 0 }); return; }
        let totalScore = 0, totalAcc = 0, correct = 0, wrong = 0;
        hist.forEach(r => {
            totalScore += r.score || 0; totalAcc += r.accuracy || 0;
            const m = r.total_marks || 0; const c = Math.round((r.accuracy / 100) * m);
            correct += c; wrong += Math.max(0, m - c);
        });
        const n = hist.length;
        setStats({ testsCompleted: n, avgScore: n ? totalScore / n : 0, avgAccuracy: n ? totalAcc / n : 0, totalCorrect: correct, totalWrong: wrong });
    }

    // Also load simpler Next.js collections for fallback
    async function loadSimpleTests() {
        try {
            const q = query(collection(db, 'tests'), orderBy('created_at', 'desc'));
            const snap = await getDocs(q);
            setSimpleTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.warn('Simple tests load error:', e); }
    }

    async function loadSimpleResults() {
        if (!user) return;
        try {
            const q = query(collection(db, 'test_results'), orderBy('completed_at', 'desc'));
            const snap = await getDocs(q);
            setSimpleResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.warn('Simple results load error:', e); }
    }

    async function setTrack(trackId: string) {
        if (!user) { setTrackError('User not logged in.'); return; }
        setTrackSaving(true); setTrackError('');
        try {
            await updateDoc(doc(db, 'profiles', user.uid), { exam_track: trackId });
            const p = await loadProfile();
            await loadUserState();
            await loadLevels(p);
            await loadTests(p);
            await loadLiveTests(p);
            await loadLeaderboard(p);
        } catch (e: any) { setTrackError(e.message ?? 'Unknown error'); }
        finally { setTrackSaving(false); }
    }

    async function initData() {
        if (!user) return;
        try {
            const p = await loadProfile();
            await loadUserState();
            await loadLevels(p);
            await loadTests(p);
            await loadLiveTests(p);
            await loadLeaderboard(p);
            await loadBadges();
            await loadAttempts();
            await loadSimpleTests();
            await loadSimpleResults();
        } catch (e) { console.error(e); }
        setIsLoadingMain(false);
    }

    async function reloadAll() {
        if (!user) return;
        setIsLoadingMain(true);
        await initData();
    }

    useEffect(() => { if (user && !authLoading) initData(); }, [user, authLoading]);

    const mySimpleResults = useMemo(() => simpleResults.filter(r => r.user_id === user?.uid), [simpleResults, user]);

    return {
        user, authLoading, profile, userState, levels, activeLevelId, setActiveLevelId,
        availableTests, lockedTests, liveTests, leaderboard, badges, attemptHistory,
        isLoadingMain, stats, avatarInitials, nextLevelXp, xpProgressPercent, xpToNextLevel,
        unlockedTestsForLevel, lockedTestsForLevel, lvlUnlocked, formatDateTime,
        activeTest, setActiveTest, setTrack, trackSaving, trackError, reloadAll,
        simpleTests, mySimpleResults,
    };
}
