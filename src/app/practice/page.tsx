import { Suspense } from 'react';
import PracticeClient from '@/components/learning/PracticeClient';
export default function PracticePage() {
    return <Suspense fallback={<div className="p-12 text-center">Loading your practice…</div>}><PracticeClient/></Suspense>;
}
