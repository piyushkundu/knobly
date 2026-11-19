import generated from '@/data/style-courses.generated.json';
import type { CourseSummary, StyleCourse, StyleCourseId } from './style-course-types';

export function getStyleCourse(id: StyleCourseId): StyleCourse {
    return generated[id] as StyleCourse;
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
