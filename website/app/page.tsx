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
        <p className="eyebrow">ChatGPT, Perplexity &amp; Google AI pull answers from websites</p>
        <h1 className="cleanHeroTitle">
          Is your site<br />
          showing up in<br />
          <span>AI answers</span>?
        </h1>
        <p className="lead cleanLead">
          One npx command to find out. Get an instant score and ship
          the fixes that make AI tools cite your content.
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
        <p>⚡ One command, instant results</p>
        <p>📊 Score + what to fix</p>
        <p>🛠️ AI cites you, not your competitor</p>
      </section>

      <SnapSection className="mediaShowcase" id="see-it" ariaLabel="terminal tutorial and screenshots">
        <div className="mediaHeader">
          <h2 className="eyebrow">See it in action</h2>
          <p>One command tells you exactly what AI tools can and can&apos;t find on your site.</p>
        </div>

        <article className="mediaCard videoCard">
          <video autoPlay loop muted playsInline preload="auto" poster="/img/analysis-screenshot-0.png">
            <source src="/cipwe-tutorial.mp4" type="video/mp4" />
          </video>
          <p className="mediaCaption">Full audit from <code>npx cipwe</code> - score, category breakdown, and actionable fixes in one run</p>
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
          <h3>Run one command</h3>
          <p>No install needed. npx runs a full scan from your terminal in seconds.</p>
        </article>
        <article>
          <span>2</span>
          <h3>See what AI can&apos;t find</h3>
          <p>Get a score showing what ChatGPT, Perplexity &amp; others can read on your page.</p>
        </article>
        <article>
          <span>3</span>
          <h3>Fix it &amp; get cited</h3>
          <p>Ship the fixes so AI pulls answers from your site, not your competitor&apos;s.</p>
        </article>
      </section>

      <section className="ctaBlock cleanCta">
        <h3>Check your site now</h3>
        <p>Find out in 10 seconds if AI tools can find and cite your content.</p>
        <div className="commandStack">
          <CommandCopy command={primaryCommand} className="commandButton cleanCommand" />
        </div>
      </section>
    </main>
  );
}
