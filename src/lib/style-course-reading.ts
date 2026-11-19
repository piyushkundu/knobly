export interface ChapterPosition { id:string; top:number; bottom:number }

/** The chapter crossing the reading line remains active throughout its long body. */
export function activeReadingChapter(chapters: ChapterPosition[], line=140): string | undefined {
    if (!chapters.length) return undefined;
    return chapters.findLast(chapter=>chapter.top<=line)?.id || chapters[0].id;
}

export function courseChapterFromPath(path:string, course:string, ids:readonly string[]) {
    const prefix=`/web-design/${course}/learn/`;
    if (!path.startsWith(prefix)) return undefined;
    const id=path.slice(prefix.length);
    return ids.includes(id) ? id : undefined;
}
