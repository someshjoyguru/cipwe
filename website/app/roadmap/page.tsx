import { roadmap } from "@/lib/site-content";

export default function RoadmapPage() {
  return (
    <main className="shell narrow">
      <section className="glassCard">
        <p className="eyebrow">Roadmap</p>
        <h1>Planned product direction</h1>
        <p className="lead">A transparent look at where CIPWE is heading next.</p>

        <div className="roadmapGrid">
          {roadmap.map((stage) => (
            <article key={stage.quarter} className="roadmapCard">
              <h2>{stage.quarter}</h2>
              <ul>
                {stage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
