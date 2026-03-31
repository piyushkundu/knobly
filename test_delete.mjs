// Run with: node test_delete.mjs
// Tests if Firebase delete works using the Admin SDK (bypasses security rules)
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const sa = {
    "project_id": "knobly-7a656",
    "client_email": "firebase-adminsdk-fbsvc@knobly-7a656.iam.gserviceaccount.com",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3Itaj5o1cgXn7\nUge82fInz+tkx/xr7/RGCwPh2EGfWvU2t6QX4joGDX0+OVYtKlM2chycOL6JBW6n\nrXOsYmviVPLPCkh5ORu/X/iD40fliJSvi4T8nBSB8M7hYO5eCzRt54+nEciC6AGB\nQX6L+uCoWA/1fEg8dEuUsWZc4wcvT+2IE0vlrwetr5hZxv66tBzAv224Cs7odsgO\nbA9nO79zvUzjhXyvYDfKSCR+M8Ogkv7Q6XEV/wrBnS/eliyuUl1N8auyxs//7PhI\n16iml0UyVb4LZ5dj6jJTWkRFexRxS/5q8SQRaA7lzVV+PBdyoMOQoJfuxeBDwwhD\n1g9ZWxFpAgMBAAECggEALo5UO3luYWBm9q19WxSa22UfhdDTSktHcZD2TTExSYYR\nhXX86Ldxob1HJAzma/fxDIvI2ywPv/yaC1VsbRveKj0HNvv5vZt3gtiucDTUv7TP\ne6r/xUoWaowhw6jlIBJAI1p1Kfc63pCFZWsVdRdzikhM0k7kfD3iQuwwRhfO6Uc9\nYWajZx/wzN+rNzePhWH48u8y1Hh1JwFu7Lq5ukIfrrpNjfTarVfW4Wzu8L+4fI61\nUYkp8An3W/PdqZ/dsyiMKjEN7aX2yB9EbhNLo/BUm9GIQ9riPTSe+TyJw9SdSF1O\nDY87aurRPCJXfoHdK33o4aGWTohN6I6BqLiBPiwfewKBgQDtUYJFd6dmtsrJxMme\noB4Wnzm4L5ovCsUUbXiiaXJkmI5qY9k73upPBlywuitPD8u5yDWi993pkJuxXoj7\nVnh7QFh2HOJ0RO4FZVb4Fo1fqbyT00bDu28eoaLfRQZ0TxCesL0AhDsTSSBlEem0\noTAUhocvQKKCxCXE0YZK1Y8TNwKBgQDFjW+lbBSs5hOWH15t2W2NpmkAf+JvrA3R\n7WaJ1zaZIL5rQcvxXuR+HZ6qDMeGJbUSJ4qkEP5EOABe5KR+YO+kv3+/HOtteAQg\nT+OGsfteHQ8z7KZSifWAEhEVgmmnFkatOe0yI45aVaOIi7VaicnsAoZCp++24gCJ\nr/DatyyQXwKBgGTryrh7/+aASZCwbQVWFjWMlOEs7SagL9tWCn0W1pzM+5NmztTV\nIVNl4zkMkqpWj058Q8MAIZDX/D3bc+lehnHzlSr1cZ/8SDRnOirafFh4OEetC2Tl\naoXeOwMzuWDw1qKFinqTwQOcj3gru/Uiru2roAWKORHfFCi06aUdWHDVAoGBALbI\nNz2qM7MJqaOj4H3ox8lg6BQzPvIuEhdi/RWaT4T829JnbWglcWoSw8P40P8YkmF6\nvncw1eGOoyEpkdzwmaooGO1dt6JwgfjXkeAFe1tHrdJQKk+CH+jgTnhFUrXrEXej\negiDB2ojhIyJH0Hm7TH13/16XnwqvW6noETtaEknAoGBAKOswDShLLKNiQyq8IkH\nv8P9H2c6Yc6TOKqbuckNUN6WUwYPIt7eKAJTN9lWNc6/8Ui4HjjKHCGHi3KBuPha\n4Ydl5YrnLHWMSyv7WOQHSnvzi7pTgr9RYH6RfF/Q7JSs2D6xh1cdQRuwDFshLsS1\n8Lerm3raPTxFaOEMalNJvHEl\n-----END PRIVATE KEY-----\n"
};

try {
    initializeApp({ credential: cert(sa) });
} catch(e) {
    // already initialized
}
const db = getFirestore();

async function main() {
    console.log('=== Creating test data ===');
    const testRef = await db.collection('exam_tests').add({
        title: 'DELETE_DEBUG_TEST',
        description: 'Temp test for delete debugging',
        created_at: new Date()
    });
    console.log('✅ Created test:', testRef.id);

    const q1 = await db.collection('exam_questions').add({ test_id: testRef.id, question_text: 'Test Q1?', question_type: 'MCQ', created_at: new Date() });
    const q2 = await db.collection('exam_questions').add({ test_id: testRef.id, question_text: 'Test Q2?', question_type: 'MCQ', created_at: new Date() });
    await db.collection('exam_options').add({ question_id: q1.id, option_text: 'Opt A', is_correct: true });
    await db.collection('exam_options').add({ question_id: q1.id, option_text: 'Opt B', is_correct: false });
    console.log('✅ Created 2 questions and 2 options');

    console.log('\n=== Deleting individual option first ===');
    const optSnap = await db.collection('exam_options').where('question_id', '==', q1.id).get();
    for (const o of optSnap.docs) {
        await db.collection('exam_options').doc(o.id).delete();
        console.log('  Deleted option:', o.id);
    }
    console.log('✅ Options deleted');

    console.log('\n=== Deleting questions one by one ===');
    const qSnap = await db.collection('exam_questions').where('test_id', '==', testRef.id).get();
    for (const q of qSnap.docs) {
        await db.collection('exam_questions').doc(q.id).delete();
        console.log('  Deleted question:', q.id);
    }
    console.log('✅ Questions deleted');

    console.log('\n=== Deleting the test ===');
    await db.collection('exam_tests').doc(testRef.id).delete();
    console.log('✅ Test deleted');

    console.log('\n=== Verifying all gone ===');
    const v1 = await db.collection('exam_questions').where('test_id', '==', testRef.id).get();
    console.log('Remaining questions:', v1.size, '(should be 0)');
    const v2 = await db.collection('exam_tests').doc(testRef.id).get();
    console.log('Test doc exists:', v2.exists, '(should be false)');

    if (v1.size === 0 && !v2.exists) {
        console.log('\n✅✅✅ SERVER-SIDE DELETE WORKS PERFECTLY!');
        console.log('>>> The problem is FIRESTORE SECURITY RULES blocking client-side (browser) deletes!');
        console.log('>>> Fix: Update rules in Firebase Console > Firestore > Rules to allow admin deletes');
    }
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
