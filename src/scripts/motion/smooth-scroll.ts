// Lenis smooth scrolling, kept in sync with GSAP's ScrollTrigger.
import Lenis from "lenis";
import { gsap, ScrollTrigger, getLenis, setLenis } from "./shared";

export function initSmoothScroll() {
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  setLenis(lenis);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => getLenis()?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Pause page scrolling while the phone menu is open (event sent by Nav.astro)
  document.addEventListener("nav:toggle", (e) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start()));

  // In-page links (#section) scroll smoothly instead of jumping
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href");
      if (!target || target === "#") return;
      const el = document.querySelector<HTMLElement>(target);
      if (!el) return;
      e.preventDefault();
      // The gap above the target comes from its scroll-margin-top (global.css)
      lenis.scrollTo(el);
    });
  });
}
