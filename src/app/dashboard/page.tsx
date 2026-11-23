'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, CheckCircle2, ChevronRight, Flame, Globe, HelpCircle, Loader2, LogOut, Play, RotateCcw, Search, Sparkles, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { useDashboard } from './useDashboard';
import DashboardTestList from './DashboardTestList';
import { practiceRequest, useLearning } from '@/components/learning/useLearning';
import ProgressChart from '@/components/learning/ProgressChart';
import styles from './dashboard.module.css';

const completed = (status?: string) => status === 'SUBMITTED' || status === 'AUTO_SUBMITTED';
function Metric({ label, value, help, icon }: { label: string; value: string | number; help: string; icon: React.ReactNode }) {
    return <div className={styles.metric}><div className={styles.metricIcon}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div><details className={styles.metricHelp}><summary aria-label={'About ' + label}><HelpCircle size={14}/></summary><p>{help}</p></details></div>;
}
export default function DashboardPage() {
    const d = useDashboard(), { user, loading: authLoading, logout } = useAuth(), learning = useLearning(user);
    const [subject, setSubject] = useState('all'), [search, setSearch] = useState(''), [status, setStatus] = useState('all'), [duration, setDuration] = useState('all');
    const [league, setLeague] = useState<'all' | 'week'>('all'), [analysing, setAnalysing] = useState(false), [analysisMessage, setAnalysisMessage] = useState(''), [actionError, setActionError] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    if (authLoading) return <div className={styles.loading}><Loader2 className="animate-spin"/>Loading your learning space…</div>;
    if (!user) return <LoginModal isOpen onClose={() => { window.location.href = '/'; }}/>;
    const data = learning.data, firstName = (d.profile?.full_name || user.displayName || 'Student').split(' ')[0];
    const tests = [...d.availableTests, ...d.lockedTests];
    const matches = (test: { id: string; title: string; category?: string; duration_minutes?: number }) =>
        (test.title + ' ' + (test.category || '')).toLowerCase().includes(search.trim().toLowerCase()) &&
        (status === 'all' || (status === 'attempted' ? d.attemptedTestIds.has(test.id) : !d.attemptedTestIds.has(test.id))) &&
        (duration === 'all' || (test.duration_minutes || 0) <= Number(duration));
    const recent = d.attemptHistory.filter(a => completed(a.status));
    const chart = recent.slice(0, 10).reverse().filter(row => row.total_marks > 0).map(row =>
        ({ label: row.test_title, value: (row.score || 0) / row.total_marks * 100 }));
    const resume = d.allAttempts.filter(attempt => {
        const test = d.availableTests.find(test => test.id === attempt.test_id);
        return attempt.status === 'IN_PROGRESS' && test?.mode === 'PRACTICE' &&
            Date.parse(attempt.started_at || '') + test.duration_minutes * 60_000 > Date.now();
    }).sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)))[0];
    const recommended = data?.topics.find(topic => topic.wrong > 0);
    const goalDays = data?.completedDays.filter(day => day >= data.week && day <= data.day).length || 0;
    const daily = data?.daily;
    const dailyLabel = daily?.status === 'completed' ? 'Review today’s answers' : daily ? 'Continue Daily 10' : 'Start Daily 10';
    const analyse = async () => {
        setAnalysing(true); setActionError('');
        try {
            let remaining = 1, iterations = 0;
            while (remaining > 0 && iterations++ < 100) {
                const result = await practiceRequest<{ remaining: number; analysed: number }>(user, { action: 'sync' });
                remaining = result.remaining;
                setAnalysisMessage(result.analysed + ' completed tests analysed' + (remaining ? ' · ' + remaining + ' remaining' : ''));
            }
            await learning.refresh();
        } catch (error) { setActionError(error instanceof Error ? error.message : 'Analysis could not finish. Please try again.'); }
        finally { setAnalysing(false); }
    };
    const lessonLink = (category: string) => /web|html/i.test(category) ? '/html/elements' : /python/i.test(category) ? '/python' : /ccc/i.test(category) ? '/ccc' : '/it-tools';
    return <div className={styles.page}>
        <header className={styles.header}><Link href="/" className={styles.brand}><span>K.</span><div>KNOBLY<small>YOUR LEARNING SPACE</small></div></Link>
            <nav><Link href="/"><Globe size={15}/>Home</Link><a href="#tests"><BookOpen size={15}/>Tests</a><a href="#progress"><TrendingUp size={15}/>Progress</a><Link href="/notes">Notes</Link></nav>
            <button className={styles.logout} onClick={logout} aria-label="Log out"><LogOut size={16}/><span>Log out</span></button>
        </header>
        <main className={styles.container}>
            <section className={styles.welcome}><div><span className={styles.eyebrow}>YOUR NEXT STEP STARTS HERE</span><h1>Welcome back, {firstName}<span>Let’s make today count.</span></h1><p>Practise a little. Understand your mistakes. See yourself improve.</p>
                <div className={styles.heroActions}>{resume ? <Link href={'/test/' + resume.test_id + '?resume=' + resume.id}><Play size={15}/>Continue your practice</Link> : <Link href="/practice"><Sparkles size={15}/>Your daily practice</Link>}<a href="#tests">Explore tests<ArrowRight size={15}/></a></div>
            </div><div className={styles.rank}><span className={styles.rankMedal}>{d.currentRank.icon}</span><div><small>YOUR EXAM RANK</small><strong>{d.currentRank.name}<b>{d.totalPoints} pts</b></strong><div className={styles.rankBar}><i style={{ width: d.rankProgressPercent + '%' }}/></div><p>{d.nextRank ? d.pointsToNextRank + ' points to ' + d.nextRank.name : 'Highest rank reached'}</p></div></div></section>
            <div className={styles.metrics}>
                <Metric label="Exam points" value={d.totalPoints} icon={<Zap size={20}/>} help="Points are awarded for correct answers on your first completed attempt at each exam. Retakes and Daily 10 do not add exam-rank points."/>
                <Metric label="Tests completed" value={d.stats.testsCompleted} icon={<CheckCircle2 size={20}/>} help="Number of different tests you have submitted. Repeated attempts at the same test count once here."/>
                <Metric label="First-attempt score" value={Math.round(d.stats.avgScore) + '%'} icon={<TrendingUp size={20}/>} help="Average score percentage from your first submitted attempt at each test. The progress chart below also shows later attempts."/>
                <Metric label="Accuracy" value={Math.round(d.stats.avgAccuracy) + '%'} icon={<Target size={20}/>} help="Average recorded accuracy on first submitted attempts. Older imported records may store accuracy separately from the calculated score."/>
            </div>
            {(learning.error || actionError) && <div className={styles.error} role="alert">{actionError || learning.error}<button onClick={learning.refresh}>Retry</button></div>}
            <div className={styles.featureGrid}>
                <section className={styles.daily}><div className={styles.dailyCopy}><span className={styles.dailyPill}><Sparkles size={13}/>A LITTLE EVERY DAY</span><h2>Your daily 10.<br/><span>Small steps. Real progress.</span></h2><p>Questions from all active tests, with extra attention to the questions you’ve answered incorrectly.</p><Link href="/practice" className={styles.dailyButton}>{dailyLabel}<ArrowRight size={17}/></Link><small>{daily?.status === 'completed' ? daily.score + '/' + daily.total + ' correct today · saved for review' : daily ? daily.answered + '/' + daily.total + ' answered · pick up where you left off' : 'Mixed subjects · saves as you go · refreshes at midnight, India time'}</small></div><div className={styles.dailyArt} aria-hidden="true"><div>10<span>QUESTIONS</span></div><b>✦</b><i>✓</i></div></section>
                <div className={styles.revisionCards} id="revision"><Link href="/practice?mode=wrong" className={styles.revision}><div className={styles.revisionIcon}><RotateCcw size={20}/></div><span>{data ? data.wrongCount : '—'}<small>questions to revisit</small></span><h3>Wrong Answers Notebook</h3><p>Turn past mistakes into your next improvement.</p><b>Revise mistakes<ArrowRight size={15}/></b></Link>
                    <Link href="/practice?mode=bookmarks" className={styles.bookmarks}><Bookmark size={20}/><div><h3>Saved for later <span>{data?.bookmarks.length || 0}</span></h3><p>Your personal revision collection.</p></div><ChevronRight size={18}/></Link></div>
            </div>
            <div className={styles.mainGrid}>
                <div className={styles.mainColumn}>
                    <section className={styles.card} id="tests"><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>CHOOSE YOUR NEXT CHALLENGE</span><h2>Available tests <small>{tests.length || d.simpleTests.length}</small></h2></div><BookOpen size={22}/></div>
                        <div className={styles.filters}><label className={styles.search}><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search test or chapter…" aria-label="Search tests"/></label>
                            <select aria-label="Attempt status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All attempts</option><option value="unattempted">Not attempted</option><option value="attempted">Attempted</option></select>
                            <select aria-label="Maximum duration" value={duration} onChange={event => setDuration(event.target.value)}><option value="all">Any duration</option><option value="15">Up to 15 min</option><option value="30">Up to 30 min</option><option value="60">Up to 60 min</option></select></div>
                        <div className={styles.subjects}><button aria-pressed={subject === 'all'} onClick={() => setSubject('all')}>📚 All</button>{d.categories.map((category: { id: string; name: string; emoji?: string }) => <button key={category.id} aria-pressed={subject === category.name} onClick={() => setSubject(category.name)}>{category.emoji || '📚'} {category.name}</button>)}</div>
                        <div className={styles.testList}>{d.isLoadingMain ? <p className={styles.empty}><Loader2 size={17} className="animate-spin"/>Loading your tests…</p> :
                            <DashboardTestList available={d.availableTests.filter(matches)} locked={d.lockedTests.filter(matches)} simple={tests.length ? [] : d.simpleTests.filter(matches)} subject={subject} attempted={d.attemptedTestIds} history={d.allAttempts}/>}</div>
                    </section>
                    <section className={styles.card} id="progress"><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>SEE HOW FAR YOU’VE COME</span><h2>Your progress</h2></div><TrendingUp size={22}/></div><p className={styles.caption}>Score percentage on your last {chart.length || 'few'} completed tests, including retakes. Hover over a point for details.</p><ProgressChart entries={chart}/>
                        <div className={styles.attempts}>{recent.slice(0, showHistory ? 20 : 5).map(row => <Link key={row.id} href={'/review/' + row.id}><div><strong>{row.test_title}</strong><small>{row.submitted_at ? new Date(row.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</small></div><b>{row.total_marks ? Math.round((row.score || 0) / row.total_marks * 100) + '%' : row.score + ' correct'}</b><ChevronRight size={15}/></Link>)}</div>
                        {recent.length > 5 && <button className={styles.analyseButton} onClick={() => setShowHistory(!showHistory)}>{showHistory ? 'Show fewer attempts' : 'Show recent 20 attempts'}</button>}
                        {Boolean(data?.recent.length) && <div className={styles.practiceHistory}><h3>Daily practice & revision</h3>{data?.recent.slice(0, 5).map(row => <div key={row.id}><span>{row.day} · {row.kind === 'daily' ? 'Daily 10' : row.kind === 'wrong' ? 'Mistake revision' : 'Saved questions'}</span><b>{row.status === 'completed' ? row.score + '/' + row.total : row.answered + '/' + row.total + ' answered'}</b></div>)}</div>}
                    </section>
                </div>
                <aside className={styles.sidebar}>
                    <section className={styles.card}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>FOCUS ON WHAT MATTERS</span><h2>Your next step</h2></div><Sparkles size={21}/></div>
                        {recommended ? <><h3 className={styles.recommendTitle}>Revisit {recommended.topic}</h3><p className={styles.caption}>{recommended.accuracy}% accuracy across {recommended.seen} answered questions. A short revision can help.</p><Link className={styles.secondaryButton} href={lessonLink(recommended.category)}><BookOpen size={15}/>Open related course<ArrowRight size={15}/></Link></> :
                            <p className={styles.caption}>Complete Daily 10 or analyse your completed tests to find the topics that need more attention.</p>}
                        <button className={styles.analyseButton} disabled={analysing} onClick={analyse}>{analysing ? <Loader2 size={14} className="animate-spin"/> : <RotateCcw size={14}/>} {analysing ? 'Analysing your answers…' : data?.analysedAt ? 'Refresh learning analysis' : 'Analyse my completed tests'}</button>
                        {analysisMessage && <p role="status" className={styles.caption}>{analysisMessage}</p>}
                        <div className={styles.topics}>{data?.topics.map(topic => <div key={topic.testId + topic.topic}><div><span>{topic.topic}</span><b>{topic.accuracy}%</b></div><div className={styles.topicBar}><i style={{ width: topic.accuracy + '%', background: topic.accuracy < 50 ? '#ee977f' : topic.accuracy < 75 ? '#d8b15c' : '#57b99b' }}/></div></div>)}</div>
                    </section>
                    <section className={styles.card}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>BUILD A LEARNING HABIT</span><h2>Your weekly goal</h2></div><Flame size={22}/></div><div className={styles.goalCount}><strong>{goalDays}<small> / {data?.weeklyGoal || 3} days</small></strong><span><Flame size={14}/>{data?.streak || 0} day streak</span></div>
                        <div className={styles.goalBar}><i style={{ width: Math.min(100, goalDays / (data?.weeklyGoal || 3) * 100) + '%' }}/></div><p className={styles.caption}>Finish Daily 10 on your chosen number of days this week.</p>
                        <div className={styles.goalChoices}>{[3, 5, 7].map(goal => <button key={goal} aria-pressed={(data?.weeklyGoal || 3) === goal} onClick={async () => {
                            try { await practiceRequest(user, { action: 'goal', weeklyGoal: goal }); await learning.refresh(); }
                            catch (error) { setActionError(error instanceof Error ? error.message : 'Goal could not be saved'); }
                        }}>{goal} days</button>)}</div>{goalDays >= (data?.weeklyGoal || 3) && <p className={styles.success}>🎉 Weekly goal complete. Keep going!</p>}
                    </section>
                    {d.liveTests.length > 0 && <section className={styles.card}><span className={styles.eyebrow}>LIVE & UPCOMING</span>{d.liveTests.map(test => <Link key={test.id} href={'/test/' + test.id} className={styles.live}><strong>{test.title}</strong><small>{d.formatDateTime(test.live_start)}</small><Play size={15}/></Link>)}</section>}
                    <section className={styles.card}><div className={styles.sectionTitle}><div><span className={styles.eyebrow}>GROW TOGETHER</span><h2>Leaderboard</h2></div><Trophy size={22}/></div><div className={styles.leagueTabs}><button aria-pressed={league === 'all'} onClick={() => setLeague('all')}>Exam ranks</button><button aria-pressed={league === 'week'} onClick={() => setLeague('week')}>This week</button></div>
                        <p className={styles.caption}>{league === 'all' ? 'Existing exam points and ranks.' : 'Daily 10 correct answers this week. One scored set per day; separate from exam points.'}</p>
                        {league === 'all' ? d.leaderboard.slice(0, 10).map((row, i) => <div key={row.id} className={styles.leader}><b>{String(i + 1).padStart(2, '0')}</b><span>{row.full_name}<small>{d.getRankForPoints(row.total_xp || 0, i === 0 && row.total_xp >= 800).name}</small></span><strong>{row.total_xp || 0}<small>pts</small></strong></div>) :
                            data?.weekly.length ? data.weekly.map((row, i) => <div key={row.id} className={styles.leader}><b>{i + 1}</b><span>{row.name}<small>{row.days.length} practice days</small></span><strong>{row.score}<small>correct</small></strong></div>) : <p className={styles.empty}>Complete Daily 10 to join this week’s league.</p>}
                    </section>
                    <details className={styles.card}><summary className={styles.recommendTitle}>How exam ranks work</summary><p className={styles.caption}>Correct answers on the first completed attempt earn exam points. Retakes and Daily 10 leave those points unchanged.</p>{d.RANKS.map(rank => <div key={rank.name} className={styles.leader}><b>{rank.icon}</b><span>{rank.name}</span><strong>{rank.minPoints}<small>points</small></strong></div>)}<p className={styles.caption}>Legend is reserved for the top-ranked student with at least 800 exam points.</p></details>
                </aside>
            </div>
            <footer className={styles.footer}><Link href="/"><ArrowLeft size={14}/>Back to Home</Link><span>One concept. One practice. One step forward.</span></footer>
        </main>
    </div>;
}
