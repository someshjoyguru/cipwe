import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - CIPWE",
  description:
    "Privacy policy for the CIPWE Chrome Extension and CLI tool. CIPWE does not collect, store, or transmit any personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="shell privacyPage" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <section className="glassCard" style={{ maxWidth: "48rem", margin: "0 auto" }}>
        <p className="eyebrow">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="lead">
          Last updated: 19 February 2026
        </p>

        <div className="privacyContent" style={{ lineHeight: 1.8, fontSize: "0.95rem" }}>
          <h2>Overview</h2>
          <p>
            CIPWE (&quot;Can AI Find Your Website?&quot;) is an open-source tool that audits web
            pages for AI visibility. This privacy policy covers both the{" "}
            <strong>CIPWE Chrome Extension</strong> and the <strong>CIPWE CLI tool</strong>.
          </p>
          <p>
            <strong>
              CIPWE does not collect, store, transmit, or sell any personal data.
            </strong>
          </p>

          <h2>What the Chrome Extension Does</h2>
          <p>When you click &quot;Audit This Page,&quot; the extension:</p>
          <ol>
            <li>
              Reads the HTML of the currently active tab to run 19 visibility checks (structured
              data, headings, metadata, etc.).
            </li>
            <li>
              Fetches three publicly accessible files from the same website:{" "}
              <code>/robots.txt</code>, <code>/sitemap.xml</code>, and <code>/llms.txt</code>.
            </li>
            <li>
              Calculates a score and displays the results entirely within the extension popup.
            </li>
          </ol>
          <p>
            All processing happens <strong>locally in your browser</strong>. No data is sent to any
            external server, analytics service, or third party.
          </p>

          <h2>Data Collection</h2>
          <p>CIPWE does <strong>not</strong> collect any of the following:</p>
          <ul>
            <li>Personally identifiable information (name, email, address, etc.)</li>
            <li>Browsing history or web activity</li>
            <li>Authentication credentials or cookies</li>
            <li>Financial or payment information</li>
            <li>Location data</li>
            <li>Health information</li>
            <li>Personal communications</li>
          </ul>

          <h2>Data Storage</h2>
          <p>
            CIPWE does not persist any data between sessions. Each audit runs fresh and results are
            only shown in the popup UI. Closing the popup discards all results.
          </p>

          <h2>Data Sharing</h2>
          <p>
            CIPWE does not share, sell, or transfer any data to third parties. There are no
            analytics, tracking pixels, or telemetry of any kind.
          </p>

          <h2>Permissions Explained</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", margin: "1rem 0" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>Permission</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>Why It&apos;s Needed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}><code>activeTab</code></td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>
                  Access the current tab&apos;s page content only when you click the extension icon.
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}><code>scripting</code></td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>
                  Inject a content script to extract page HTML, headings, and metadata for analysis.
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>Host permissions</td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>
                  Fetch <code>/robots.txt</code>, <code>/sitemap.xml</code>, and{" "}
                  <code>/llms.txt</code> from whatever site you&apos;re auditing.
                </td>
              </tr>
            </tbody>
          </table>

          <h2>Remote Code</h2>
          <p>
            CIPWE does not use any remote code. All JavaScript is bundled within the extension
            package. There are no external script tags, CDN imports, or dynamically evaluated code.
          </p>

          <h2>Open Source</h2>
          <p>
            CIPWE is fully open source under the MIT License. You can inspect every line of code at{" "}
            <a
              href="https://github.com/someshjoyguru/cipwe"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/someshjoyguru/cipwe
            </a>
            .
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, please open an issue on the{" "}
            <a
              href="https://github.com/someshjoyguru/cipwe/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>{" "}
            or contact the maintainer at{" "}
            <a href="https://github.com/someshjoyguru">github.com/someshjoyguru</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
