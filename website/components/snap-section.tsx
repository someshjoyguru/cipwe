"use client";

import { useEffect, useRef, ReactNode } from "react";

export default function SnapSection({
  children,
  className,
  id,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const hasSnapped = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Wait for scroll to settle, then glide into place
    const scheduleSnap = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (!hasSnapped.current) {
          hasSnapped.current = true;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 120);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasSnapped.current) {
          // Listen for scroll-end so we don't fight momentum
          window.addEventListener("scroll", scheduleSnap, { passive: true });
          scheduleSnap();
        }
        if (!entry.isIntersecting) {
          // Section left the viewport - reset so it can snap again next time
          hasSnapped.current = false;
          window.removeEventListener("scroll", scheduleSnap);
          if (timer.current) clearTimeout(timer.current);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleSnap);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <section ref={ref} className={className} id={id} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
