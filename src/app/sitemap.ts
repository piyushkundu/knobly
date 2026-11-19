import { MetadataRoute } from 'next';
import { getStyleCourse } from '@/lib/style-courses';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://knoblyweb.in';
    const now = new Date();

    return [
        ...(['css', 'w3css'] as const).flatMap(id => {
            const course = getStyleCourse(id), base = `${baseUrl}/web-design/${id}`;
            return [
                ...['notes', 'quiz', 'tasks'].map(page => ({ url: `${base}/${page}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
                ...course.lessons.map(lesson => ({ url: `${base}/learn/${lesson.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
                ...course.tasks.map(task => ({ url: `${base}/tasks/${task.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
                ...(id === 'w3css' ? [{url: base, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6}] : []),
            ];
        }),
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/notes`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/mcq`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/cybersecurity`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/syllabus`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/shortcuts`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        // Python
        { url: `${baseUrl}/python`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/python/fundamentals`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/python/control-statements`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/python/lists`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/python/tuples`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/python/functions`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/python/file-handling`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/python/numpy`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/python/handwritten-notes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        // Web Design
        { url: `${baseUrl}/web-design`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/web-design/css`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/web-design/javascript`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        // HTML
        { url: `${baseUrl}/html`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/html/intro`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/html/elements`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/html/compiler`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        // Other
        { url: `${baseUrl}/iot`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/ccc`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ];
}
