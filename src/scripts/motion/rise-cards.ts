// Card rows marked [data-rise-cards] (NumberedCards.astro): each [data-rise-card] rises up from
// below the row's clipped edge with a slight overshoot, in the Figma "Belief Cards" order and timing.
import { gsap, ScrollTrigger } from "./shared";

/** [delay, duration] per card, from the Figma motion data (5s timeline) */
const TIMING: [number, number][] = [
  [0, 1.0],
  [0.26, 0.94],
  [0.65, 0.97],
  [1.0, 0.61],
];
/** Figma eases these with cubic-bezier(0, 0, 0.08, 1.24): fast start, small overshoot */
const EASE = "back.out(1.6)";

export function initRiseCards() {
  document.querySelectorAll<HTMLElement>("[data-rise-cards]").forEach((row) => {
    const cards = row.querySelectorAll<HTMLElement>("[data-rise-card]");
    // Optional per-page timing: data-rise-timing="delay,duration;delay,duration;…"
    const timing: [number, number][] = row.dataset.riseTiming
      ? row.dataset.riseTiming.split(";").map((pair) => pair.split(",").map(Number) as [number, number])
      : TIMING;
    const tl = gsap.timeline({ paused: true });
    cards.forEach((card, i) => {
      const [delay, duration] = timing[i % timing.length];
      gsap.set(card, { y: () => card.offsetHeight + 4 });
      tl.to(card, { y: 0, duration, ease: EASE }, delay);
    });
    ScrollTrigger.create({ trigger: row, start: "top 80%", once: true, onEnter: () => tl.play() });
  });
}
