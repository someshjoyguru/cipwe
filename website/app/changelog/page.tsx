import { changelog } from "@/lib/site-content";

export default function ChangelogPage() {
  return (
    <main className="shell narrow">
      <section className="glassCard">
        <p className="eyebrow">Changelog</p>
        <h1>What’s new in CIPWE</h1>
        <p className="lead">Track release highlights, improvements, and quality updates.</p>

        <div className="timeline">
          {changelog.map((entry) => (
            <article key={entry.date + entry.title} className="timelineItem">
              <p>{entry.date}</p>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
