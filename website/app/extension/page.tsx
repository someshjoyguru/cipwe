import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Chrome Extension - CIPWE",
  description:
    "Download the CIPWE Chrome Extension to audit any website's AI readiness score in one click. Free, no Chrome Web Store needed.",
};

const steps = [
  {
    num: "1",
    title: "Download the extension",
    desc: 'Click the button above to download the .zip file.',
  },
  {
    num: "2",
    title: "Unzip the file",
    desc: "Extract the downloaded zip - you'll get a folder called cipwe-chrome-extension.",
  },
  {
    num: "3",
    title: "Open Extensions page",
    desc: "Go to chrome://extensions in your Chrome browser address bar.",
  },
  {
    num: "4",
    title: "Enable Developer Mode",
    desc: "Toggle the Developer mode switch in the top-right corner of the page.",
  },
  {
    num: "5",
    title: 'Click "Load unpacked"',
    desc: "Click the Load unpacked button that appears in the top-left.",
  },
  {
    num: "6",
    title: "Select the folder",
    desc: "Navigate to and select the unzipped extension folder. Done!",
  },
];

const categories = [
  { name: "Structured Data", max: 30, icon: "{ }" },
  { name: "Semantic HTML", max: 20, icon: "</>" },
  { name: "Metadata", max: 15, icon: "◎" },
  { name: "Crawl Signals", max: 15, icon: "⇌" },
  { name: "Content Clarity", max: 10, icon: "¶" },
  { name: "Agent Signals", max: 10, icon: "⚙" },
];

export default function ExtensionPage() {
  return (
    <main className="shell extensionPage">
      {/* Hero */}
      <section className="extHero">
        <div className="extBadge">Chrome Extension</div>
        <h1 className="extTitle">
          Audit AI readiness<br />
          in <span>one click</span>.
        </h1>
        <p className="lead extLead">
          The same 19-rule CIPWE analysis, right in your browser toolbar.
          No terminal needed - click, scan, fix.
        </p>

        <a
          href="/cipwe-chrome-extension.zip"
          download="cipwe-chrome-extension.zip"
          className="extDownloadBtn"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M3 16h14"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download Extension
          <span className="extDownloadSize">(.zip · 24 KB)</span>
        </a>

        <p className="extFreeNote">
          100% free · No Chrome Web Store account needed · Works on Chrome, Edge, Brave, Arc
        </p>
      </section>

      {/* Preview mockup */}
      <section className="extPreview">
        <div className="extMockup">
          <div className="extMockupBar">
            <span /><span /><span />
            <div className="extMockupTitle">CIPWE Extension</div>
          </div>
          <div className="extMockupBody">
            <div className="extMockupScore">
              <div className="extRing">
                <svg viewBox="0 0 120 120" width="80" height="80">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="#2563EB" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="314"
                    strokeDashoffset="47"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                </svg>
                <span className="extRingText">85</span>
              </div>
              <div>
                <div className="extGrade">A-</div>
                <div className="extScoreSub">85/100 points</div>
              </div>
            </div>
            <div className="extMockupCats">
              {categories.map((c) => (
                <div key={c.name} className="extMockupCat">
                  <span className="extCatIcon">{c.icon}</span>
                  <span className="extCatName">{c.name}</span>
                  <div className="extCatBar">
                    <div
                      className="extCatFill"
                      style={{ width: `${Math.min(100, 50 + Math.random() * 50)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Install Steps */}
      <section className="extSteps" id="install">
        <h2 className="extSectionTitle">Install in 60 seconds</h2>
        <p className="extSectionSub">
          No developer account or Chrome Web Store needed.
          Just download, unzip, and load.
        </p>

        <div className="extStepGrid">
          {steps.map((step) => (
            <article key={step.num} className="extStepCard">
              <div className="extStepNum">{step.num}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="extStepNote">
          <strong>💡 Tip:</strong> Pin the extension by clicking the puzzle piece icon (🧩)
          in Chrome&apos;s toolbar, then pinning CIPWE for quick access.
        </div>
      </section>

      {/* Features */}
      <section className="extFeatures">
        <h2 className="extSectionTitle">What it checks</h2>
        <p className="extSectionSub">
          19 rules across 6 categories - the same engine as the CLI, scoring up to 100 points.
        </p>
        <div className="extCatGrid">
          {categories.map((c) => (
            <article key={c.name} className="extFeatureCard">
              <div className="extFeatureIcon">{c.icon}</div>
              <h3>{c.name}</h3>
              <p>{c.max} pts max</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="extCta">
        <h3>Ready to audit?</h3>
        <p>Download the extension and check any site in seconds.</p>
        <a
          href="/cipwe-chrome-extension.zip"
          download="cipwe-chrome-extension.zip"
          className="extDownloadBtn"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M3 16h14"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download Extension
        </a>
      </section>
    </main>
  );
}
