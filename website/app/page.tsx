import Image from "next/image";
import Link from "next/link";
import CommandCopy from "@/components/command-copy";
import SnapSection from "@/components/snap-section";
 
const primaryCommand = "npx cipwe audit https://your-site.com";

const sampleOutput = `$ npx cipwe audit https://acme.com\n\nCIPWE Score  87/100 (A)\n\n✔ Structured Data    28/30\n✔ Semantic HTML      18/20\n✔ Metadata           14/15\n◐ Crawl Signals      12/15\n✔ Agent Signals       9/10\n\nTop action: add FAQPage schema\nDone in 21.3s`;

export default function HomePage() {
  return (
    <main className="shell cleanHome">
      <section className="cleanHero" id="start-now">
        <p className="eyebrow">The Web Vitals for the AI Web</p>
        <h1 className="cleanHeroTitle">
          One clear command<br />
          to make your site visible<br />
          in <span>AI answers</span>.
        </h1>
        <p className="lead cleanLead">
          No setup maze. No heavy dashboard. Run once with npx, get an instant score, and ship
          high-impact fixes.
        </p>

        <div className="heroCommandCard cleanCommandCard">
          <div className="terminalChrome">
            <span /> <span /> <span />
            <small>Terminal</small>
          </div>
          <CommandCopy command={primaryCommand} className="commandButton large cleanCommand" />
        </div>

        <div className="cleanHeroActions pt-4">
          <a href="#see-it" className="btnPrimary" style={{ color: "#fff" }}>
            See output
          </a>
          <Link href="/docs" className="btnGhost">
            Read docs
          </Link>
        </div>
      </section>

      <section className="cleanStrip pt-10" aria-label="quick highlights">
        <p>⚡ Runs instantly with npx</p>
        <p>📊 Score + recommendations</p>
        <p>🛠️ Fixes you can ship today</p>
      </section>

      <SnapSection className="mediaShowcase" id="see-it" ariaLabel="terminal tutorial and screenshots">
        <div className="mediaHeader">
          <h2 className="eyebrow">See it in action</h2>
          <p>Run one command, get a full visibility breakdown in seconds.</p>
        </div>

        <article className="mediaCard videoCard">
          <video autoPlay loop muted playsInline preload="auto" poster="/img/analysis-screenshot-0.png">
            <source src="/cipwe-tutorial.mp4" type="video/mp4" />
          </video>
          <p className="mediaCaption">Full audit from <code>npx cipwe</code> — score, category breakdown, and actionable fixes in one run</p>
        </article>
      </SnapSection>

      {/* <section id="run-example" className="cleanTerminal" aria-label="CLI output">
        <h2>Run this, get this</h2>
        <pre>
          <code>{sampleOutput}</code>
        </pre>
      </section> */}

      <section className="cleanSteps" aria-label="how it works">
        <article>
          <span>1</span>
          <h3>Copy npx command</h3>
          <p>Run a full AI-readiness audit directly from your terminal.</p>
        </article>
        <article>
          <span>2</span>
          <h3>Review your score</h3>
          <p>Get weighted category scoring with high-priority recommendations.</p>
        </article>
        <article>
          <span>3</span>
          <h3>Ship quick fixes</h3>
          <p>Generate structured files and improve visibility for answer engines.</p>
        </article>
      </section>

      <section className="ctaBlock cleanCta">
        <h3>Start now with npx</h3>
        <p>Fastest way to make your site visible in AI answers.</p>
        <div className="commandStack">
          <CommandCopy command={primaryCommand} className="commandButton cleanCommand" />
        </div>
      </section>
    </main>
  );
}
