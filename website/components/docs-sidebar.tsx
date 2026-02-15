import Link from "next/link";
import { docs } from "@/lib/docs";

type DocsSidebarProps = {
  activeSlug?: string;
};

export default function DocsSidebar({ activeSlug }: DocsSidebarProps) {
  return (
    <aside className="docsSidebar">
      <p className="docsSidebarTitle">Documentation</p>
      <ul>
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/docs/${doc.slug}`} className={activeSlug === doc.slug ? "active" : ""}>
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
