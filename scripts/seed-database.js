/**
 * Knobly OS - Database Seeding Script
 * Run with: npm run seed
 * 
 * This script automatically creates all Firestore collections
 * and populates them with sample data.
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Load environment variables
config();

// Firebase config from .env
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

// Validate config
if (!firebaseConfig.projectId) {
    console.error('❌ Error: Firebase config not found!');
    console.error('   Make sure .env file exists with all VITE_FIREBASE_* variables');
    process.exit(1);
}

console.log('🔧 Knobly OS - Database Seeding Script');
console.log('=====================================');
console.log(`📦 Project: ${firebaseConfig.projectId}`);
console.log('');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════

const OLEVEL_LEVELS = [
    { level_no: 1, title: "Introduction to IT", description: "Basics of Information Technology", required_xp: 0 },
    { level_no: 2, title: "Computer Fundamentals", description: "Hardware, Software & OS basics", required_xp: 100 },
    { level_no: 3, title: "Internet & Web", description: "Internet, Email, Web Browsing", required_xp: 250 },
    { level_no: 4, title: "MS Word Basics", description: "Word Processing fundamentals", required_xp: 400 },
    { level_no: 5, title: "MS Excel Basics", description: "Spreadsheet fundamentals", required_xp: 600 },
    { level_no: 6, title: "MS PowerPoint", description: "Presentation skills", required_xp: 800 },
    { level_no: 7, title: "Python Basics", description: "Introduction to Python programming", required_xp: 1000 },
    { level_no: 8, title: "Web Technologies", description: "HTML, CSS, JavaScript basics", required_xp: 1300 },
    { level_no: 9, title: "IoT Fundamentals", description: "Internet of Things concepts", required_xp: 1600 },
    { level_no: 10, title: "Final Challenge", description: "Complete O-Level assessment", required_xp: 2000 }
];

const CCC_LEVELS = [
    { level_no: 1, title: "Computer Basics", description: "Introduction to Computers", required_xp: 0 },
    { level_no: 2, title: "Operating System", description: "Windows/Linux basics", required_xp: 80 },
    { level_no: 3, title: "Internet Skills", description: "Web & Email usage", required_xp: 180 },
    { level_no: 4, title: "LibreOffice Writer", description: "Document processing", required_xp: 300 },
    { level_no: 5, title: "LibreOffice Calc", description: "Spreadsheet skills", required_xp: 450 },
    { level_no: 6, title: "LibreOffice Impress", description: "Presentations", required_xp: 600 },
    { level_no: 7, title: "Digital Financial Tools", description: "UPI, NetBanking, etc.", required_xp: 750 },
    { level_no: 8, title: "CCC Final Test", description: "Complete CCC certification prep", required_xp: 1000 }
];

const BADGES = [
    { badge_name: "First Steps", badge_icon: "ph-footprints", description: "Complete your first test", xp_reward: 25 },
    { badge_name: "Quick Learner", badge_icon: "ph-lightning", description: "Score 80%+ in any test", xp_reward: 50 },
    { badge_name: "Streak Master", badge_icon: "ph-fire", description: "Maintain 7-day streak", xp_reward: 100 },
    { badge_name: "Perfect Score", badge_icon: "ph-star", description: "Get 100% in any test", xp_reward: 150 },
    { badge_name: "Level 5 Pro", badge_icon: "ph-trophy", description: "Reach Level 5", xp_reward: 200 },
    { badge_name: "Champion", badge_icon: "ph-crown", description: "Reach Level 10", xp_reward: 500 },
    { badge_name: "Speed Demon", badge_icon: "ph-rocket-launch", description: "Complete test in half time", xp_reward: 75 },
    { badge_name: "Consistent", badge_icon: "ph-calendar-check", description: "30 day streak", xp_reward: 300 }
];

const SAMPLE_APPS = [
    { name: "Calculator", type: "Utility", link: "https://www.google.com/search?q=calculator", icon: "ti ti-calculator", color: "text-green-400" },
    { name: "Dictionary", type: "Learning", link: "https://www.dictionary.com", icon: "ti ti-book", color: "text-blue-400" },
    { name: "Typing Test", type: "Practice", link: "https://www.typingtest.com", icon: "ti ti-keyboard", color: "text-purple-400" }
];

const SAMPLE_VIDEOS = [
    { title: "Introduction to Computers", youtube_id: "dQw4w9WgXcQ", category: "Basics" },
    { title: "MS Word Tutorial", youtube_id: "dQw4w9WgXcQ", category: "Office" },
    { title: "Python for Beginners", youtube_id: "dQw4w9WgXcQ", category: "Programming" }
];

const SAMPLE_NOTIFICATIONS = [
    { title: "Welcome to Knobly!", message: "Start your learning journey today.", type: "info", is_read: false },
    { title: "New Feature: Test Dashboard", message: "Try the new gamified test system.", type: "feature", is_read: false }
];

const SAMPLE_QUESTIONS = [
    {
        question_text: "What does CPU stand for?", question_type: "MCQ", marks: 1, options: [
            { text: "Central Processing Unit", is_correct: true },
            { text: "Computer Personal Unit", is_correct: false },
            { text: "Central Program Utility", is_correct: false },
            { text: "Computer Processing Unit", is_correct: false }
        ]
    },
    {
        question_text: "Which of the following is an input device?", question_type: "MCQ", marks: 1, options: [
            { text: "Monitor", is_correct: false },
            { text: "Keyboard", is_correct: true },
            { text: "Printer", is_correct: false },
            { text: "Speaker", is_correct: false }
        ]
    },
    {
        question_text: "What is RAM?", question_type: "MCQ", marks: 1, options: [
            { text: "Read Access Memory", is_correct: false },
            { text: "Random Access Memory", is_correct: true },
            { text: "Run Access Module", is_correct: false },
            { text: "Read And Modify", is_correct: false }
        ]
    },
    {
        question_text: "HTML stands for?", question_type: "MCQ", marks: 1, options: [
            { text: "Hyper Text Markup Language", is_correct: true },
            { text: "High Tech Modern Language", is_correct: false },
            { text: "Hyper Transfer Markup Lang", is_correct: false },
            { text: "Home Tool Markup Language", is_correct: false }
        ]
    },
    {
        question_text: "Which software is used for spreadsheets?", question_type: "MCQ", marks: 1, options: [
            { text: "MS Word", is_correct: false },
            { text: "MS PowerPoint", is_correct: false },
            { text: "MS Excel", is_correct: true },
            { text: "MS Access", is_correct: false }
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// SEEDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const levelIdMap = {};
const testIdMap = {};

async function seedExamLevels() {
    console.log('📊 Creating exam_levels...');
    const batch = writeBatch(db);

    for (const level of OLEVEL_LEVELS) {
        const ref = doc(collection(db, 'exam_levels'));
        batch.set(ref, { ...level, track_id: 'OLEVEL', created_at: new Date() });
        levelIdMap[`OLEVEL-${level.level_no}`] = ref.id;
    }

    for (const level of CCC_LEVELS) {
        const ref = doc(collection(db, 'exam_levels'));
        batch.set(ref, { ...level, track_id: 'CCC', created_at: new Date() });
        levelIdMap[`CCC-${level.level_no}`] = ref.id;
    }

    await batch.commit();
    console.log(`   ✓ Created ${OLEVEL_LEVELS.length} O-Level + ${CCC_LEVELS.length} CCC levels`);
}

async function seedExamTests() {
    console.log('📝 Creating exam_tests...');
    const batch = writeBatch(db);

    const tests = [
        { title: "Level 1 Practice Test", level_no: 1, duration: 15, marks: 20, xp: 30 },
        { title: "Level 2 Practice Test", level_no: 2, duration: 20, marks: 25, xp: 40 },
        { title: "Level 3 Practice Test", level_no: 3, duration: 20, marks: 30, xp: 50 },
        { title: "Level 4 Practice Test", level_no: 4, duration: 25, marks: 35, xp: 60 },
        { title: "Level 5 Final Test", level_no: 5, duration: 30, marks: 50, xp: 100 }
    ];

    for (const t of tests) {
        const levelId = levelIdMap[`OLEVEL-${t.level_no}`];
        if (levelId) {
            const ref = doc(collection(db, 'exam_tests'));
            batch.set(ref, {
                title: t.title,
                track_id: 'OLEVEL',
                level_id: levelId,
                mode: 'PRACTICE',
                duration_minutes: t.duration,
                total_marks: t.marks,
                xp_reward: t.xp,
                is_active: true,
                created_at: new Date()
            });
            testIdMap[`OLEVEL-${t.level_no}`] = ref.id;
        }
    }

    for (const t of tests.slice(0, 4)) {
        const levelId = levelIdMap[`CCC-${t.level_no}`];
        if (levelId) {
            const ref = doc(collection(db, 'exam_tests'));
            batch.set(ref, {
                title: `CCC ${t.title}`,
                track_id: 'CCC',
                level_id: levelId,
                mode: 'PRACTICE',
                duration_minutes: t.duration,
                total_marks: t.marks,
                xp_reward: t.xp,
                is_active: true,
                created_at: new Date()
            });
            testIdMap[`CCC-${t.level_no}`] = ref.id;
        }
    }

    await batch.commit();
    console.log(`   ✓ Created O-Level and CCC tests`);
}

async function seedExamQuestions() {
    console.log('❓ Creating exam_questions + exam_options...');
    const batch = writeBatch(db);
    let questionCount = 0;
    let optionCount = 0;

    const testId = testIdMap['OLEVEL-1'];
    if (testId) {
        for (let i = 0; i < SAMPLE_QUESTIONS.length; i++) {
            const q = SAMPLE_QUESTIONS[i];
            const qRef = doc(collection(db, 'exam_questions'));
            batch.set(qRef, {
                test_id: testId,
                question_text: q.question_text,
                question_type: q.question_type,
                marks: q.marks,
                order_no: i + 1,
                created_at: new Date()
            });
            questionCount++;

            for (let j = 0; j < q.options.length; j++) {
                const opt = q.options[j];
                const oRef = doc(collection(db, 'exam_options'));
                batch.set(oRef, {
                    question_id: qRef.id,
                    option_text: opt.text,
                    is_correct: opt.is_correct,
                    order_no: j + 1
                });
                optionCount++;
            }
        }
    }

    await batch.commit();
    console.log(`   ✓ Created ${questionCount} questions with ${optionCount} options`);
}

async function seedExamBadges() {
    console.log('🏆 Creating exam_badges...');
    const batch = writeBatch(db);

    for (const badge of BADGES) {
        const ref = doc(collection(db, 'exam_badges'));
        batch.set(ref, { ...badge, created_at: new Date() });
    }

    await batch.commit();
    console.log(`   ✓ Created ${BADGES.length} badges`);
}

async function seedApps() {
    console.log('📱 Creating apps...');
    const batch = writeBatch(db);

    for (const app of SAMPLE_APPS) {
        const ref = doc(collection(db, 'apps'));
        batch.set(ref, { ...app, user_id: null, created_at: new Date() });
    }

    await batch.commit();
    console.log(`   ✓ Created ${SAMPLE_APPS.length} global apps`);
}

async function seedVideos() {
    console.log('🎬 Creating videos...');
    const batch = writeBatch(db);

    for (const video of SAMPLE_VIDEOS) {
        const ref = doc(collection(db, 'videos'));
        batch.set(ref, { ...video, created_at: new Date() });
    }

    await batch.commit();
    console.log(`   ✓ Created ${SAMPLE_VIDEOS.length} videos`);
}

async function seedNotifications() {
    console.log('🔔 Creating notifications...');
    const batch = writeBatch(db);

    for (const notif of SAMPLE_NOTIFICATIONS) {
        const ref = doc(collection(db, 'notifications'));
        batch.set(ref, { ...notif, created_at: new Date() });
    }

    await batch.commit();
    console.log(`   ✓ Created ${SAMPLE_NOTIFICATIONS.length} notifications`);
}

async function seedEmptyCollections() {
    console.log('📦 Creating empty collections (placeholders)...');

    const collections = [
        'profiles',
        'user_settings',
        'exam_user_state',
        'exam_attempts',
        'exam_responses',
        'exam_user_badges',
        'exam_leaderboard',
        'exam_proctor_log'
    ];

    for (const col of collections) {
        const ref = doc(collection(db, col), '_placeholder');
        await setDoc(ref, { _placeholder: true, created_at: new Date() });
    }

    console.log(`   ✓ Initialized ${collections.length} collections`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
    try {
        console.log('🚀 Starting database seeding...\n');

        await seedExamLevels();
        await seedExamTests();
        await seedExamQuestions();
        await seedExamBadges();
        await seedApps();
        await seedVideos();
        await seedNotifications();
        await seedEmptyCollections();

        console.log('\n=====================================');
        console.log('✅ DATABASE SEEDING COMPLETE!');
        console.log('=====================================');
        console.log('\nYou can now run: npm run dev');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during seeding:', error.message);
        console.error(error);
        process.exit(1);
    }
}

main();
