import generated from '@/data/style-courses.generated.json';
import { flexBorderTask } from '@/data/css-flex-border-task';
import { displayBorderTask } from '@/data/css-display-border-task';
import type { CourseSummary, StyleCourse, StyleCourseId } from './style-course-types';

const cssLessons = [...generated.css.lessons];
const priorityIndex = cssLessons.findIndex(lesson => lesson.id === 'priorities-of-css');
if (priorityIndex >= 0 && cssLessons.some(lesson => lesson.id === 'css-selectors')) {
    const [priorities] = cssLessons.splice(priorityIndex, 1);
    cssLessons.splice(cssLessons.findIndex(lesson => lesson.id === 'css-selectors') + 1, 0, priorities);
}
const cssTasks = [...generated.css.tasks];
cssTasks.splice(cssTasks.findIndex(task => task.id === 'navigation-layout') + 1, 0, displayBorderTask, flexBorderTask);
const cssCourse = { ...generated.css, lessons: cssLessons, tasks: cssTasks } as StyleCourse;

export function getStyleCourse(id: StyleCourseId): StyleCourse {
    return id === 'css' ? cssCourse : generated[id] as StyleCourse;
}
export function courseSummary(id: StyleCourseId): CourseSummary {
    const course = getStyleCourse(id);
    return {
        id, name: course.name, description: course.description, notesUrl: '',
        lessons: course.lessons.map(({ id, title, group }) => ({ id, title, group })),
        tasks: course.tasks.map(({ id, title, subtitle, skills, inlineAfter, inlineDescription }) => ({ id, title, subtitle, skills, inlineAfter, inlineDescription })),
        quizCount: course.quiz.length,
        exampleCount: course.lessons.reduce((total, lesson) => total + lesson.examples.length + 1, 0),
    };
}
