import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell narrow">
      <section className="glassCard notFound">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link href="/" className="btnPrimary">
          Back to home
        </Link>
      </section>
    </main>
  );
}
