import Link from "next/link";
import DocsSidebar from "@/components/docs-sidebar";
import { docs, docsShowcaseImages } from "@/lib/docs";

export default function DocsIndexPage() {
  return (
    <main className="shell docsLayout">
      <DocsSidebar />
      <section className="docsContent glassCard">
        <p className="eyebrow">Documentation</p>
        <h1>Everything you need to run CIPWE in production</h1>
        <p className="lead">
          Use this documentation to set up auditing, adopt score policies, integrate CI checks, and
          improve your AI answer visibility systematically.
        </p>

        <div className="docsIntroMeta" role="list" aria-label="documentation coverage">
          <span role="listitem">{docs.length} guides</span>
          <span role="listitem">Command-first workflows</span>
          <span role="listitem">CI-ready examples</span>
        </div>

        <div className="docsCards">
          {docs.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className="docCard">
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
            </Link>
          ))}
        </div>

        <section className="docSection">
          <h2>Product screenshots</h2>
          <p>
            Visual walkthrough of the command-first experience, output clarity, and documentation
            system.
          </p>
          <div className="docsGallery">
            {docsShowcaseImages.map((image) => (
              <figure key={image.src} className="docsShot">
                <img src={image.src} alt={image.alt} loading="lazy" />
                <figcaption>{image.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
