import { StyleCompilerPage } from '@/components/style-course/StylePages';
import { getStyleCourse } from '@/lib/style-courses';
export function generateStaticParams(){return getStyleCourse('css').tasks.map(task=>({id:task.id}));}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StyleCompilerPage id="css" taskId={id}/>;}
