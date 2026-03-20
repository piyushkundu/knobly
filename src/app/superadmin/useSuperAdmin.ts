'use client';
import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, writeBatch } from 'firebase/firestore';

export function useSuperAdmin() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [authError, setAuthError] = useState('');
    const [stats, setStats] = useState({ users: 0, tests: 0, questions: 0, apps: 0 });
    const [tests, setTests] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [apps, setApps] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Auth
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
                try {
                    const snap = await getDoc(doc(db, 'profiles', u.uid));
                    if (snap.exists() && snap.data().role === 'admin') { setIsAdmin(true); }
                    else { await signOut(auth); setIsAdmin(false); setAuthError('Access Denied: Admin Role Required'); }
                } catch (e) { console.error(e); }
            } else { setUser(null); setIsAdmin(false); }
        });
        return () => unsub();
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true); setAuthError('');
        try { await signInWithEmailAndPassword(auth, email, pass); }
        catch (e: any) { setAuthError(e.message); }
        setLoading(false);
    };
    const logout = async () => { await signOut(auth); };

    // Helper: try ordered query first, fallback to unordered
    const safeDocs = async (col: string, ...orderings: any[]) => {
        try {
            if (orderings.length > 0) {
                return await getDocs(query(collection(db, col), ...orderings));
            }
            return await getDocs(collection(db, col));
        } catch (e) {
            console.warn(`[SuperAdmin] Ordered query failed for ${col}, trying unordered`, e);
            try { return await getDocs(collection(db, col)); }
            catch (e2) { console.error(`[SuperAdmin] Failed to load ${col}`, e2); return null; }
        }
    };
    const snapToArr = (snap: any) => snap ? snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) : [];

    // Data Loading — each collection independent
    const refreshAll = useCallback(async () => {
        setSyncing(true);
        const pSnap = await safeDocs('profiles');
        const u = snapToArr(pSnap);
        setUsers(u);

        const tSnap = await safeDocs('exam_tests');
        const t = snapToArr(tSnap);
        setTests(t);

        const lSnap = await safeDocs('exam_levels');
        setLevels(snapToArr(lSnap));

        const bSnap = await safeDocs('exam_badges');
        setBadges(snapToArr(bSnap));

        const nSnap = await safeDocs('notifications');
        setNotifications(snapToArr(nSnap));

        const aSnap = await safeDocs('apps');
        const appsArr = snapToArr(aSnap);
        setApps(appsArr);

        const vSnap = await safeDocs('videos');
        setVideos(snapToArr(vSnap));

        const qSnap = await safeDocs('exam_questions');
        setStats({ users: u.length, tests: t.length, questions: qSnap ? qSnap.size : 0, apps: appsArr.length });

        // Load categories
        const catSnap = await safeDocs('exam_categories');
        const cats = snapToArr(catSnap).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setCategories(cats);

        // Build leaderboard from exam_user_state + profiles (deduplicated by user_id)
        const xpSnap = await safeDocs('exam_user_state');
        const xpArr = snapToArr(xpSnap);
        const profileMap: Record<string, any> = {};
        u.forEach((p: any) => { profileMap[p.id] = p; });
        let board: any[] = [];
        // Build a set of admin user IDs to exclude from leaderboard
        // Check both profiles (role='admin') and users collection (isAdmin=true)
        const adminIds = new Set<string>();
        u.forEach((p: any) => { if (p.role === 'admin' || p.isAdmin) adminIds.add(p.id); });
        // Also check users collection for isAdmin flag
        const usersSnap = await safeDocs('users');
        const usersArr = snapToArr(usersSnap);
        usersArr.forEach((usr: any) => { if (usr.isAdmin === true) adminIds.add(usr.id); });
        if (xpArr.length > 0) {
            // Deduplicate: keep highest points entry per user_id
            const userMap: Record<string, any> = {};
            xpArr.forEach((s: any) => {
                const uid = s.user_id;
                if (!uid || adminIds.has(uid)) return; // Skip admins
                if (!userMap[uid] || (s.total_points || s.total_xp || 0) > (userMap[uid].total_xp || 0)) {
                    const prof = profileMap[uid] || {};
                    userMap[uid] = { id: uid, full_name: prof.full_name || prof.email || 'Unknown', email: prof.email || '', total_xp: s.total_points || s.total_xp || 0, current_level: s.current_level || 1, stateDocId: s.id };
                }
            });
            board = Object.values(userMap);
        } else {
            board = u.filter((p: any) => !adminIds.has(p.id)).map((p: any) => ({ id: p.id, full_name: p.full_name || p.email || 'Unknown', email: p.email || '', total_xp: 0, current_level: 1, stateDocId: null }));
        }
        board.sort((a: any, b: any) => (b.total_xp || 0) - (a.total_xp || 0));
        board.forEach((r: any, i: number) => { r.rank = i + 1; });
        setLeaderboard(board);

        setSyncing(false);
    }, []);

    useEffect(() => { if (isAdmin) refreshAll(); }, [isAdmin, refreshAll]);

    // Test CRUD
    const saveTest = async (data: any) => {
        const payload = { ...data }; delete payload.id;
        if (payload.mode !== 'LIVE') { delete payload.live_start; delete payload.live_end; }
        if (data.id) { delete payload.created_at; await updateDoc(doc(db, 'exam_tests', data.id), payload); }
        else { payload.created_at = serverTimestamp(); await addDoc(collection(db, 'exam_tests'), payload); }
        refreshAll();
    };
    const deleteTest = async (id: string) => { await deleteDoc(doc(db, 'exam_tests', id)); refreshAll(); };

    // Question CRUD
    const loadQuestions = async (testId: string) => {
        const snap = await getDocs(query(collection(db, 'exam_questions'), where('test_id', '==', testId)));
        setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (a.created_at?.seconds || 0) - (b.created_at?.seconds || 0)));
    };
    const saveQuestion = async (testId: string, data: any) => {
        try {
            const payload = { test_id: testId, question_text: data.text, question_type: data.type, marks: data.marks, difficulty: data.difficulty };
            let qId = data.id;
            
            if (qId) {
                await updateDoc(doc(db, 'exam_questions', qId), payload);
            } else { 
                const ref = await addDoc(collection(db, 'exam_questions'), { ...payload, created_at: serverTimestamp() }); 
                qId = ref.id;
            }

            if (data.type !== 'SHORT' && data.options?.length) {
                // Delete ALL old options first
                const oldOptsSnap = await getDocs(query(collection(db, 'exam_options'), where('question_id', '==', qId)));
                if (!oldOptsSnap.empty) {
                    const deleteBatch = writeBatch(db);
                    oldOptsSnap.forEach(d => deleteBatch.delete(d.ref));
                    await deleteBatch.commit();
                }

                // Re-create all options fresh with correct is_correct boolean values
                const createBatch = writeBatch(db);
                data.options.filter((o: any) => o.text).forEach((o: any) => { 
                    createBatch.set(doc(collection(db, 'exam_options')), { question_id: qId, option_text: o.text, is_correct: o.is_correct === true });
                });
                await createBatch.commit();
            }
            loadQuestions(testId);
        } catch (err) {
            console.error('[saveQuestion] ERROR:', err);
            alert('Save failed: ' + (err as any).message);
        }
    };
    const deleteQuestion = async (id: string, testId: string) => { await deleteDoc(doc(db, 'exam_questions', id)); loadQuestions(testId); };
    const getOptionsForQuestion = async (qId: string) => {
        const snap = await getDocs(query(collection(db, 'exam_options'), where('question_id', '==', qId)));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    };
    const importQuestions = async (testId: string, text: string) => {
        const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
        const batch = writeBatch(db);
        blocks.forEach(block => {
            const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
            const qLine = lines.find(l => l.includes('?')) || lines[0];
            const question = qLine.replace(/^\d+[.)]\s*/, "");
            const options: any[] = [];
            lines.forEach(l => { if (/^[A-E][.)]/.test(l)) { let c = l.replace(/^[A-E][.)]\s*/, ""); let ic = false; if (c.trim().endsWith('*')) { ic = true; c = c.trim().slice(0, -1).trim(); } options.push({ text: c, is_correct: ic }); } });
            if (!options.find(o => o.is_correct) && options.length) options[0].is_correct = true;
            // Points per question are auto-calculated from test total_points / total_questions
            const qRef = doc(collection(db, 'exam_questions'));
            batch.set(qRef, { test_id: testId, question_text: question, question_type: options.length ? 'MCQ' : 'SHORT', marks: 1, difficulty: 'EASY', created_at: serverTimestamp() });
            options.forEach(o => { batch.set(doc(collection(db, 'exam_options')), { question_id: qRef.id, option_text: o.text, is_correct: o.is_correct }); });
        });
        await batch.commit();
        loadQuestions(testId);
        return blocks.length;
    };

    // Results
    const loadResults = async (testId?: string, userId?: string) => {
        try {
            let snap;
            try {
                snap = await getDocs(query(collection(db, 'exam_attempts'), orderBy('started_at', 'desc'), limit(50)));
            } catch {
                snap = await getDocs(collection(db, 'exam_attempts'));
            }
            let r = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (testId) r = r.filter((a: any) => a.test_id === testId);
            if (userId) r = r.filter((a: any) => a.user_id === userId);
            setResults(r);
        } catch (e) { console.error('[SuperAdmin] loadResults failed', e); }
    };
    const viewAttemptDetail = async (attempt: any) => {
        const rSnap = await getDocs(query(collection(db, 'exam_responses'), where('attempt_id', '==', attempt.id)));
        const responses = rSnap.docs.map(d => d.data());
        const qIds = responses.map((r: any) => r.question_id);
        if (!qIds.length) return { userName: '', testTitle: '', questions: [] };
        const qsSnap = await getDocs(query(collection(db, 'exam_questions'), where('test_id', '==', attempt.test_id)));
        const qs = qsSnap.docs.filter(d => qIds.includes(d.id)).map(d => ({ id: d.id, ...d.data() }));
        const optsSnap = await getDocs(query(collection(db, 'exam_options'), where('question_id', 'in', qIds.slice(0, 10))));
        const opts = optsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        return {
            userName: users.find(u => u.id === attempt.user_id)?.full_name || attempt.user_id,
            testTitle: tests.find(t => t.id === attempt.test_id)?.title || attempt.test_id,
            questions: qs.map((q: any) => ({ text: q.question_text, userSelected: responses.find((r: any) => r.question_id === q.id)?.option_id, options: opts.filter((o: any) => o.question_id === q.id) })),
        };
    };

    const deleteUser = async (uid: string) => {
        try {
            // Delete from profiles
            try { await deleteDoc(doc(db, 'profiles', uid)); } catch (_) { }
            // Delete from users collection
            try { await deleteDoc(doc(db, 'users', uid)); } catch (_) { }
            // Delete exam_user_state
            try {
                const stateSnap = await getDocs(query(collection(db, 'exam_user_state'), where('user_id', '==', uid)));
                for (const d of stateSnap.docs) { await deleteDoc(d.ref); }
            } catch (_) { }
            // Delete user badges
            try {
                const badgeSnap = await getDocs(query(collection(db, 'exam_user_badges'), where('user_id', '==', uid)));
                for (const d of badgeSnap.docs) { await deleteDoc(d.ref); }
            } catch (_) { }
            await refreshAll();
        } catch (e: any) {
            console.error('deleteUser error:', e);
            alert('Error deleting user: ' + (e.message || ''));
        }
    };
    const deleteLeaderboardUser = async (uid: string, stateDocId?: string) => {
        try { await deleteDoc(doc(db, 'profiles', uid)); } catch (_) { }
        if (stateDocId) { try { await deleteDoc(doc(db, 'exam_user_state', stateDocId)); } catch (_) { } }
        // Also remove their badges
        try { const bSnap = await getDocs(query(collection(db, 'exam_user_badges'), where('user_id', '==', uid))); const batch = writeBatch(db); bSnap.forEach(d => batch.delete(d.ref)); await batch.commit(); } catch (_) { }
        refreshAll();
    };

    // Update leaderboard user points
    const updateLeaderboardPoints = async (uid: string, stateDocId: string | null, newPoints: number) => {
        if (stateDocId) {
            await updateDoc(doc(db, 'exam_user_state', stateDocId), { total_points: newPoints, total_xp: newPoints });
        } else {
            // Create new state doc
            await addDoc(collection(db, 'exam_user_state'), { user_id: uid, total_points: newPoints, total_xp: newPoints, current_level: 1, created_at: serverTimestamp() });
        }
        refreshAll();
    };
    const getUserProfile = async (u: any) => {
        const xpSnap = await getDocs(query(collection(db, 'exam_user_state'), where('user_id', '==', u.id)));
        let xp = 0; if (!xpSnap.empty) { const data = xpSnap.docs[0].data(); xp = data.total_points || data.total_xp || 0; }
        const bSnap = await getDocs(query(collection(db, 'exam_user_badges'), where('user_id', '==', u.id)));
        const badgeIds = bSnap.docs.map(d => d.data().badge_id);
        const badgeNames = badgeIds.map(bid => badges.find(b => b.id === bid)?.badge_name || bid);
        return { ...u, total_xp: xp, badgeNames };
    };

    // Levels CRUD
    const saveLevel = async (data: any, editId?: string) => {
        if (editId) await updateDoc(doc(db, 'exam_levels', editId), data);
        else await addDoc(collection(db, 'exam_levels'), data);
        refreshAll();
    };
    const deleteLevel = async (id: string) => { await deleteDoc(doc(db, 'exam_levels', id)); refreshAll(); };

    // Badges CRUD
    const saveBadge = async (data: any, editId?: string) => {
        if (editId) await updateDoc(doc(db, 'exam_badges', editId), data);
        else await addDoc(collection(db, 'exam_badges'), data);
        refreshAll();
    };
    const deleteBadge = async (id: string) => { await deleteDoc(doc(db, 'exam_badges', id)); refreshAll(); };

    // Notifications
    const sendNotification = async (msg: string, link?: string) => {
        await addDoc(collection(db, 'notifications'), { message: msg, link: link || null, created_at: serverTimestamp() });
        refreshAll();
    };
    const deleteNotification = async (id: string) => { await deleteDoc(doc(db, 'notifications', id)); refreshAll(); };

    // Apps
    const deployApp = async (name: string, link: string, icon: string) => {
        await addDoc(collection(db, 'apps'), { name, link, icon_class: icon, is_system_app: true, created_at: serverTimestamp(), user_id: null });
        refreshAll();
    };
    const deleteApp = async (id: string) => { await deleteDoc(doc(db, 'apps', id)); refreshAll(); };

    // Videos
    const publishVideo = async (ytId: string, title: string) => {
        await addDoc(collection(db, 'videos'), { youtube_id: ytId, title, views: 'Featured', created_at: serverTimestamp() });
        refreshAll();
    };
    const deleteVideo = async (id: string) => { await deleteDoc(doc(db, 'videos', id)); refreshAll(); };

    // Categories CRUD
    const saveCategory = async (data: any, editId?: string) => {
        if (editId) { await updateDoc(doc(db, 'exam_categories', editId), data); }
        else { await addDoc(collection(db, 'exam_categories'), { ...data, created_at: serverTimestamp() }); }
        refreshAll();
    };
    const deleteCategory = async (id: string) => { await deleteDoc(doc(db, 'exam_categories', id)); refreshAll(); };

    return {
        user, isAdmin, loading, syncing, authError, stats,
        tests, questions, users, levels, badges, results, notifications, apps, videos, leaderboard, categories,
        login, logout, refreshAll,
        saveTest, deleteTest,
        loadQuestions, saveQuestion, deleteQuestion, getOptionsForQuestion, importQuestions,
        loadResults, viewAttemptDetail,
        deleteUser, deleteLeaderboardUser, updateLeaderboardPoints, getUserProfile,
        saveLevel, deleteLevel, saveBadge, deleteBadge,
        sendNotification, deleteNotification,
        deployApp, deleteApp, publishVideo, deleteVideo,
        saveCategory, deleteCategory,
    };
}
