import Link from "next/link";

export default function Footer() {
  return (
    <footer className="shell footer">
      <p>© {new Date().getFullYear()} CIPWE • Make your site visible to AI.</p>
      <p>Check if ChatGPT, Perplexity &amp; Google AI can find your content.</p>
      <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.6 }}>
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}
