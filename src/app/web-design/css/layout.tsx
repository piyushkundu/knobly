import type { Metadata } from 'next';
import '@/components/style-course/style-course.css';
import '@/components/style-course/style-playground.css';
import '@/components/style-course/style-course-premium.css';
import '@/components/style-course/style-source.generated.css';
import '@/components/style-course/style-lesson-visuals.css';
import '@/components/style-course/style-foundations.css';
import '@/components/style-course/css-task-access.css';
export const metadata: Metadata = { title: 'CSS Course, Examples & Practice Tasks | Knobly', description: 'Learn CSS with clear Hindi and English explanations, visual examples, handwritten notes and a live HTML/CSS compiler.' };
export default function Layout({children}:{children:React.ReactNode}) { return children; }
