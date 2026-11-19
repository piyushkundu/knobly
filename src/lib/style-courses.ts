import generated from '@/data/style-courses.generated.json';
import type { CourseSummary, StyleCourse, StyleCourseId } from './style-course-types';

const cssLessons = [...generated.css.lessons];
const priorityIndex = cssLessons.findIndex(lesson => lesson.id === 'priorities-of-css');
if (priorityIndex >= 0 && cssLessons.some(lesson => lesson.id === 'css-selectors')) {
    const [priorities] = cssLessons.splice(priorityIndex, 1);
    cssLessons.splice(cssLessons.findIndex(lesson => lesson.id === 'css-selectors') + 1, 0, priorities);
}
const cssCourse = { ...generated.css, lessons: cssLessons } as StyleCourse;

export function getStyleCourse(id: StyleCourseId): StyleCourse {
    return id === 'css' ? cssCourse : generated[id] as StyleCourse;
}
export function courseSummary(id: StyleCourseId): CourseSummary {
    const course = getStyleCourse(id);
    return {
        id, name: course.name, description: course.description, notesUrl: '',
        lessons: course.lessons.map(({ id, title, group }) => ({ id, title, group })),
        tasks: course.tasks.map(({ id, title, subtitle, skills }) => ({ id, title, subtitle, skills })),
        quizCount: course.quiz.length,
        exampleCount: course.lessons.reduce((total, lesson) => total + lesson.examples.length + 1, 0),
    };
}
