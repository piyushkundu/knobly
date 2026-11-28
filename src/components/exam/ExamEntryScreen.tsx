"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  Focus,
  Layers,
  Loader2,
  Play,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { examClock } from "@/lib/exam-transition";
import styles from "./ExamTransition.module.css";
const subscribeOnline = (listener: () => void) => {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
};
export interface ExamEntryProps {
  title: string;
  durationMinutes: number;
  questionCount: number;
  totalPoints: number;
  maxWarnings: number;
  remainingSeconds?: number;
  resumeDeadline?: number;
  resuming?: boolean;
  starting?: boolean;
  error?: string;
  preview?: boolean;
  onStart: () => void;
  onBack: () => void;
}
export default function ExamEntryScreen({
  title,
  durationMinutes,
  questionCount,
  totalPoints,
  maxWarnings,
  remainingSeconds,
  resumeDeadline,
  resuming = false,
  starting = false,
  error = "",
  preview = false,
  onStart,
  onBack,
}: ExamEntryProps) {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const [remaining, setRemaining] = useState(() =>
    resumeDeadline
      ? Math.max(0, Math.ceil((resumeDeadline - Date.now()) / 1000))
      : (remainingSeconds ?? 0),
  );
  useEffect(() => {
    if (!resumeDeadline) return;
    const timer = setInterval(
      () =>
        setRemaining(
          Math.max(0, Math.ceil((resumeDeadline - Date.now()) / 1000)),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [resumeDeadline]);
  const expired = resuming && remaining <= 0;
  const rules = [
    {
      icon: Copy,
      title: "Keep your work your own",
      text: "Right-click, copy and paste are disabled during the test.",
    },
    {
      icon: Focus,
      title: "Stay in fullscreen",
      text: "Leaving fullscreen or switching tabs triggers a warning.",
    },
    {
      icon: ShieldCheck,
      title: `${maxWarnings} warnings end the test`,
      text: "Your test submits automatically when the warning limit is reached.",
    },
    {
      icon: Clock3,
      title: "Keep an eye on the clock",
      text: "The test also submits automatically when time runs out.",
    },
  ];
  return (
    <section
      className={`${styles.screen} ${preview ? styles.previewScreen : ""}`}
      aria-labelledby="exam-entry-title"
      onClick={(event) => event.stopPropagation()}
    >
      {preview && (
        <div className={styles.preview}>
          LOCAL PREVIEW • Sample test • No real attempt is created
        </div>
      )}
      <header className={styles.header}>
        <button
          className={styles.back}
          aria-label="Back to dashboard"
          onClick={onBack}
          disabled={starting}
        >
          <ArrowLeft size={19} />
        </button>
        <span className={styles.brand}>
          K<span>.</span>
        </span>
        <div>
          <strong>KNOBLY</strong>
          <span>YOUR EXAM SPACE</span>
        </div>
        <span className={styles.headerBadge}>
          <ShieldCheck size={15} />
          Secure exam
        </span>
      </header>
      <div className={styles.entryLayout}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>
            {resuming
              ? "Pick up where you left off"
              : "A little preparation. A confident start."}
          </span>
          <h1 id="exam-entry-title">
            {resuming ? (
              <>
                Your practice.
                <br />
                <em>Ready to continue.</em>
              </>
            ) : (
              <>
                Take a breath.
                <br />
                <em>You’ve got this.</em>
              </>
            )}
          </h1>
          <p>
            Read the instructions, settle in and focus on one question at a
            time.
          </p>
          <div className={styles.shieldArt} aria-hidden="true">
            <div className={styles.orbit} />
            <div className={styles.artCenter}>
              <ShieldCheck size={60} strokeWidth={1.3} />
            </div>
            <span className={styles.artTop}>
              <Check size={13} />
              Stay focused
            </span>
            <span className={styles.artBottom}>
              <BookOpen size={13} />
              Learn with every attempt
            </span>
          </div>
          <div className={styles.journey}>
            <span>
              <b>01</b>Get ready
            </span>
            <i />
            <span>
              <b>02</b>Take your test
            </span>
            <i />
            <span>
              <b>03</b>Review & improve
            </span>
          </div>
          <div className={styles.prep}>
            <h2>A quick moment before you begin</h2>
            <p>
              <CheckCheck size={16} />
              Choose a quiet spot and keep a stable connection.
            </p>
            <p>
              <Layers size={16} />
              Use the question palette to move around the test.
            </p>
            <p>
              <BookOpen size={16} />
              Mark questions for review and come back to them.
            </p>
          </div>
        </div>
        <div className={styles.entryCard}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>
              <BookOpen size={15} />
              {resuming ? "Resume practice" : "Test overview"}
            </span>
            <span
              className={`${styles.connection} ${!online ? styles.offline : ""}`}
              role="status"
            >
              {online ? <Wifi size={13} /> : <WifiOff size={13} />}
              {online ? "Browser online" : "You are offline"}
            </span>
          </div>
          <h2>{title}</h2>
          <div className={styles.facts}>
            <div>
              <Clock3 size={18} />
              <strong>
                {durationMinutes}
                <small>min</small>
              </strong>
              <span>Duration</span>
            </div>
            <div>
              <Layers size={18} />
              <strong>{questionCount}</strong>
              <span>Questions</span>
            </div>
            <div>
              <GraduationIcon />
              <strong>{totalPoints}</strong>
              <span>Total points</span>
            </div>
          </div>
          <div className={styles.timerNote}>
            <Clock3 size={17} />
            <p>
              {resuming ? (
                <>
                  <strong>{examClock(remaining)} remaining</strong>
                  <span>
                    {expired
                      ? "This practice time has ended. Return to the dashboard to choose your next test."
                      : "Your original timer keeps running. Resume to use the time you have left."}
                  </span>
                </>
              ) : (
                <>
                  <strong>Your timer starts when you start.</strong>
                  <span>Take a moment to read the rules first.</span>
                </>
              )}
            </p>
          </div>
          <div className={styles.rulesHeader}>
            <h3>Know the exam rules</h3>
            <span>{maxWarnings}-warning limit</span>
          </div>
          <div className={styles.rules}>
            {rules.map(({ icon: Icon, title, text }) => (
              <div className={styles.rule} key={title}>
                <span>
                  <Icon size={17} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.languageNote}>
            <span>Question display</span>
            <strong>Hindi + English</strong>
            <p>
              Available translations appear with each question and option.
              Technical code stays as written.
            </p>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {!online && (
            <p className={styles.error} role="alert">
              Reconnect to the internet before starting your test.
            </p>
          )}
          <button
            className={styles.startButton}
            disabled={starting || !online || expired}
            onClick={onStart}
          >
            {starting ? (
              <Loader2 size={19} className={styles.spin} />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            {starting
              ? "Preparing your test…"
              : expired
                ? "Practice time ended"
                : preview
                  ? "Preview test experience"
                  : resuming
                    ? "Enter fullscreen & resume"
                    : "Enter fullscreen & start test"}
            {!starting && <ArrowRight size={18} />}
          </button>
          <p className={styles.agreement}>
            By starting, you acknowledge the fullscreen and monitoring rules
            shown above.
          </p>
        </div>
      </div>
      <footer className={styles.footer}>
        <ShieldCheck size={14} />
        Focus on learning. Your answer review comes after the test.
      </footer>
    </section>
  );
}
function GraduationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="m3 8 9-5 9 5-9 5-9-5Z" />
      <path d="M7 10.5V16c3 3 7 3 10 0v-5.5M21 8v8" />
    </svg>
  );
}
