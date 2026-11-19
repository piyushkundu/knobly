import { StyleLessonPage } from '@/components/style-course/StylePages';
import { getStyleCourse } from '@/lib/style-courses';
export function generateStaticParams(){return getStyleCourse('css').lessons.map(lesson=>({slug:lesson.id}));}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <StyleLessonPage id="css" slug={slug}/>;}
