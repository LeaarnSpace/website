// Highlighted words ([data-highlight] inside [data-highlights]): the yellow block behind each word
// sweeps in from the left, one after another (Figma "Orange Highlight - Masked Reveal", expo out).
import { gsap, ScrollTrigger } from "./shared";

export function initHighlights() {
  document.querySelectorAll<HTMLElement>("[data-highlights]").forEach((group) => {
    const marks = group.querySelectorAll<HTMLElement>("[data-highlight]");
    gsap.set(marks, { "--reveal": 0 });
    ScrollTrigger.create({
      trigger: group,
      start: "top 75%",
      once: true,
      onEnter: () =>
        marks.forEach((m) =>
          gsap.to(m, { "--reveal": 1, duration: 0.65, delay: Number(m.dataset.highlightDelay ?? 0), ease: "expo.out" }),
        ),
    });
  });
}
