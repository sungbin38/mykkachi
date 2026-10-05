"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// DESIGN_VARIANCE 7 / MOTION_INTENSITY 5 / VISUAL_DENSITY 3.
// One-time reveals establish reading order; native scrolling stays in control.
export function PublicMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !document.querySelector(".site-header")) return;
    const running = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const animation = entry.target.animate([
          { opacity: 0.35, transform: "translateY(22px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 620, easing: "cubic-bezier(.16,1,.3,1)" });
        running.add(animation);
        animation.onfinish = () => running.delete(animation);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    const stop = () => { observer.disconnect(); running.forEach(a => a.cancel()); running.clear(); };
    preference.addEventListener("change", stop);
    return () => { stop(); preference.removeEventListener("change", stop); };
  }, [pathname]);
  return null;
}
