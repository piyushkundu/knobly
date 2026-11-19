import type { Metadata } from 'next';
import '@/components/style-course/style-course.css';
import '@/components/style-course/style-playground.css';
export const metadata: Metadata = { title: 'W3.CSS Course, Examples & Practice Tasks | Knobly', description: 'Learn W3.CSS with clear Hindi and English explanations, visual examples, handwritten notes and a live HTML/CSS compiler.' };
export default function Layout({children}:{children:React.ReactNode}) { return children; }
