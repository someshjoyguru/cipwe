import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/extension", label: "Extension" },
  { href: "/changelog", label: "Changelog" },
  { href: "/roadmap", label: "Roadmap" }
];

export default function Navbar() {
  return (
    <header className="topbar shell">
      <Link href="/" className="brand" aria-label="CIPWE home">
        <span className="brandDot" />
        CIPWE
      </Link>
      <nav>
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <a className="navCta" href="#start-now">
        Use npx
      </a>
    </header>
  );
}
