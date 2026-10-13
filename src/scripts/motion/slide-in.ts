// Elements marked [data-slide] move in from data-slide-y px (positive = from below) when their
// section scrolls into view, after data-slide-delay seconds (Figma: ease-out, 0.5s).
import { gsap, ScrollTrigger } from "./shared";

export function initSlideIn() {
  document.querySelectorAll<HTMLElement>("[data-slide]").forEach((el) => {
    const y = Number(el.dataset.slideY ?? 20);
    const delay = Number(el.dataset.slideDelay ?? 0);
    gsap.set(el, { y, autoAlpha: 0 });
    ScrollTrigger.create({
      // Group by section so staggered delays line up with each other
      trigger: el.closest("section") ?? el,
      start: "top 70%",
      once: true,
      onEnter: () => gsap.to(el, { y: 0, autoAlpha: 1, duration: 0.5, delay, ease: "power2.out" }),
    });
  });
}
