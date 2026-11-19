import { LockKeyhole } from 'lucide-react';

export default function LockedNotes({ full=false }: {full?:boolean}) {
    const Title=full?'h1':'h2';
    return <section className={full?'sc-card sc-notes-locked is-full':'sc-card sc-notes-locked'} aria-label="Handwritten notes coming soon">
        <span className="sc-notes-lock-icon"><LockKeyhole size={full?31:22}/></span>
        <div><span className="sc-coming-soon">Coming Soon</span><Title>Handwritten Notes</Title><p>Notes abhi taiyar ho rahe hain. Tab tak illustrated lessons aur live examples se practice karein.</p></div>
        <button type="button" disabled><LockKeyhole size={14}/>Locked for now</button>
    </section>;
}
