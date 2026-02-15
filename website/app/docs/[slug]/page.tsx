import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsSidebar from "@/components/docs-sidebar";
import { docs, getDocBySlug } from "@/lib/docs";

type DocPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return { title: "Not found" };
  }

  return {
    title: `${doc.title} • CIPWE Docs`,
    description: doc.description
  };
}

export default async function DocDetailPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const estimatedReadMinutes = Math.max(3, Math.ceil(doc.sections.length * 1.6));

  return (
    <main className="shell docsLayout">
      <DocsSidebar activeSlug={doc.slug} />
      <article className="docsContent glassCard">
        <p className="eyebrow">CIPWE docs</p>
        <h1>{doc.title}</h1>
        <p className="lead">{doc.description}</p>

        <div className="docsIntroMeta" role="list" aria-label="page metadata">
          <span role="listitem">{doc.sections.length} sections</span>
          <span role="listitem">~{estimatedReadMinutes} min read</span>
          <span role="listitem">Practical examples included</span>
        </div>

        <section className="docSection">
          <h2>On this page</h2>
          <ul>
            {doc.sections.map((section) => (
              <li key={section.heading}>
                <a href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {doc.sections.map((section) => (
          <section
            key={section.heading}
            id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className="docSection"
          >
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            {section.code && (
              <pre>
                <code>{section.code}</code>
              </pre>
            )}
          </section>
        ))}
      </article>
    </main>
  );
}
