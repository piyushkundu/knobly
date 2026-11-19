import { StyleCompilerPage } from '@/components/style-course/StylePages';
export const dynamic = 'force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StyleCompilerPage id="css" taskId={id}/>;}
