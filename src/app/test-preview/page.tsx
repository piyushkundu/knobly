import { notFound } from 'next/navigation';
import ExamLocalPreview from '@/components/exam/ExamLocalPreview';

export const dynamic = 'force-dynamic';
export const metadata = {title:'Exam interface — local preview',robots:{index:false,follow:false}};

export default function TestPreviewPage() {
    if (process.env.NODE_ENV !== 'development') notFound();
    return <ExamLocalPreview/>;
}
