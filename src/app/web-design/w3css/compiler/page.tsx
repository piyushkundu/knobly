import { StyleCompilerPage } from '@/components/style-course/StylePages';
export default async function Page({searchParams}:{searchParams:Promise<{lesson?:string}>}){const {lesson}=await searchParams;return <StyleCompilerPage id="w3css" lessonId={lesson}/>;}
