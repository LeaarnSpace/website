// "Our Approach" diagram: cards rise and draw their borders in cycle order, the arrows sweep in
// once, then the notes slide out. There is a desktop stage and a compact phone one.
import { gsap, ScrollTrigger } from "./shared";

/** [card, start time] in the order of the cycle */
const CARD_ORDER: [string, number][] = [
  ["research", 0],
  ["build", 0.25],
  ["execute", 0.5],
  ["measure", 0.75],
];
/** [note, dot/line start, text start] for the desktop notes */
const NOTE_TIMING: [string, number, number][] = [
  ["build", 1.73, 2.1],
  ["measure", 1.83, 2.45],
];

export function initApproach() {
  document.querySelectorAll<HTMLElement>("[data-approach]").forEach((stage) => {
    const q = gsap.utils.selector(stage);
    const tl = gsap.timeline({ paused: true });
    const compact = stage.offsetWidth > 0 && stage.offsetWidth < 600;
    const rise = compact ? 80 : 200;

    CARD_ORDER.forEach(([key, at]) => {
      const card = q(`[data-card="${key}"]`)[0];
      if (!card) return;
      const rect = card.querySelector("rect");
      const label = card.querySelector(".card__label");
      gsap.set(card, { y: rise, autoAlpha: 0 });
      gsap.set(rect, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(label, { y: rise / 4, autoAlpha: 0 });
      tl.to(card, { y: 0, duration: 1, ease: "expo.out" }, at)
        .to(card, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, at)
        .to(rect, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, at)
        .to(label, { y: 0, autoAlpha: 1, duration: 0.85, ease: "power2.inOut" }, at + 0.9);
    });

    // Arrows sweep in from the tail once (Figma "Arrow animation" timing), then stay put
    q("[data-arrow]").forEach((arrow) => {
      gsap.set(arrow, { clipPath: "inset(0 100% 0 0)" });
      tl.to(arrow, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "expo.out" }, 1.3);
    });

    // Desktop notes: dot appears, line drops, copy slides out from behind its mask
    NOTE_TIMING.forEach(([key, at, textAt]) => {
      const note = q(`[data-note="${key}"]`)[0];
      if (!note) return;
      const dot = note.querySelector(".note__dot");
      const line = note.querySelector(".note__line");
      const text = note.querySelector(".note__text");
      gsap.set(dot, { autoAlpha: 0 });
      gsap.set(line, { scaleY: 0 });
      gsap.set(text, { x: -599, autoAlpha: 0 });
      tl.to(dot, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, at)
        .to(line, { scaleY: 1, duration: 0.5, ease: "power2.out" }, at)
        .set(text, { autoAlpha: 1 }, textAt)
        .to(text, { x: 0, duration: 1.2, ease: "expo.out" }, textAt);
    });

    // Phone notes sit under the diagram and slide out of their masks one after another
    const phoneNotes = stage.closest(".approach__mobile")?.querySelectorAll("[data-note-text]") ?? [];
    if (phoneNotes.length) {
      gsap.set(phoneNotes, { xPercent: -100, autoAlpha: 0 });
      tl.to(phoneNotes, { xPercent: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.15 }, 1.8);
    }

    ScrollTrigger.create({ trigger: stage, start: "top 70%", once: true, onEnter: () => tl.play() });
  });
}
