import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, BookOpen, Code2, LayoutGrid, ListChecks, Monitor, Paintbrush, Radio, Terminal, Braces } from 'lucide-react';
import styles from './page.module.css';

const title = 'Chandan Computers O Level Notes';
const description = 'Study notes for all four NIELIT O Level modules, with direct links to HTML, CSS, W3.CSS and JavaScript.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/chandancomputer' },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: { title, description, url: '/chandancomputer', type: 'website' },
  twitter: { card: 'summary', title, description },
};

const modules = [
  {
    code: 'M1-R5',
    title: 'IT Tools & Network Basics',
    description: 'Computer fundamentals, operating systems, LibreOffice and networking.',
    href: '/it-tools',
    icon: Monitor,
    tone: styles.blue,
    topics: [{ title: 'Computer Fundamentals', href: '/olevel/chapter-1', icon: Monitor }],
  },
  {
    code: 'M2-R5',
    title: 'Web Design & Publishing',
    description: 'Build, style and add interactivity to web pages.',
    href: '/web-design',
    icon: Code2,
    tone: styles.purple,
    topics: [
      { title: 'HTML', href: '/html', icon: Code2 },
      { title: 'CSS', href: '/web-design/css', icon: Paintbrush },
      { title: 'W3.CSS', href: '/web-design/w3css', icon: LayoutGrid },
      { title: 'JavaScript', href: '/web-design/javascript', icon: Braces },
    ],
  },
  {
    code: 'M3-R5',
    title: 'Python Programming',
    description: 'Problem solving with Python, from control flow to functions and files.',
    href: '/python',
    icon: Terminal,
    tone: styles.amber,
    topics: [{ title: 'Handwritten Notes', href: '/python/handwritten-notes', icon: BookOpen }],
  },
  {
    code: 'M4-R5',
    title: 'Internet of Things (IoT)',
    description: 'Connected devices, sensors, microcontrollers and IoT applications.',
    href: '/iot',
    icon: Radio,
    tone: styles.green,
    topics: [{ title: 'IoT Notes & Downloads', href: '/iot/notes', icon: BookOpen }],
  },
];

export default function ChandanComputerPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}><BookOpen size={21} aria-hidden="true" /></span>
            Chandan Computers
          </div>
          <Link href="/syllabus" className={styles.syllabus}>
            <ListChecks size={17} aria-hidden="true" />
            <span>Syllabus</span>
          </Link>
        </header>

        <main>
          <section className={styles.hero} aria-labelledby="page-title">
            <div className={styles.heroArtwork} aria-hidden="true">
              <div className={styles.artworkTile}><BookOpen strokeWidth={1.25} /></div>
            </div>
            <div className={styles.heroContent}>
              <p className={styles.course}>NIELIT O Level</p>
              <h1 id="page-title">Chandan Computers <span>O Level Notes</span></h1>
              <p>Find notes and topic links for all four course modules.</p>
              <a href="#course-modules" className={styles.heroButton}>
                Browse modules <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section id="course-modules" className={styles.modules} aria-labelledby="modules-title">
            <h2 id="modules-title">Course modules</h2>
            <div className={styles.grid}>
              {modules.map(({ code, title, description, href, icon: Icon, tone, topics }) => (
                <article key={code} className={`${styles.card} ${tone}`}>
                  <Link href={href} className={styles.moduleLink}>
                    <div className={styles.cardTop}>
                      <span className={styles.iconTile}><Icon size={23} aria-hidden="true" /></span>
                      <span className={styles.moduleCode}>{code}</span>
                      <ArrowRight className={styles.moduleArrow} size={21} aria-hidden="true" />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </Link>
                  <ul className={styles.topics} aria-label={`${title} topics and notes`}>
                    {topics.map(({ title, href, icon: TopicIcon }) => (
                      <li key={href}>
                        <Link href={href} className={styles.topic}>
                          <TopicIcon size={16} aria-hidden="true" />
                          {title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
