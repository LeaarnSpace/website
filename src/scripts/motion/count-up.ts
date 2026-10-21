// Numbers marked [data-count-to] count up from 1 when scrolled into view (The Problem: "62%.").
// Timing from Figma: starts after data-count-delay, then ~32ms per step.
import { gsap, ScrollTrigger } from "./shared";

const STEP_SECONDS = 2.35 * 0.01373; // one Figma frame-step on its 2.35s timeline

export function initCountUp() {
  document.querySelectorAll<HTMLElement>("[data-count-to]").forEach((el) => {
    const to = Number(el.dataset.countTo);
    const suffix = el.dataset.countSuffix ?? "";
    const delay = Number(el.dataset.countDelay ?? 0);
    const render = (n: number) => (el.textContent = `${String(Math.round(n)).padStart(2, "0")}${suffix}`);
    const state = { n: 1 };
    render(1);
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(state, {
          n: to,
          duration: (to - 1) * STEP_SECONDS,
          delay,
          ease: "none",
          onUpdate: () => render(state.n),
        }),
    });
  });
}

/**
 * [data-scroll-count] shows how many of the page's [data-count-step] rows have scrolled past the
 * middle of the screen (The Problem: the sticky "5 / 5" fills up as each unmeasured question passes).
 */
export function initScrollCount() {
  document.querySelectorAll<HTMLElement>("[data-scroll-count]").forEach((counter) => {
    const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-count-step]"));
    let passed = 0;
    const render = () => (counter.textContent = String(passed));
    render();
    steps.forEach((step) =>
      ScrollTrigger.create({
        trigger: step,
        start: "center 60%",
        onEnter: () => {
          passed++;
          render();
          gsap.fromTo(counter, { yPercent: 12 }, { yPercent: 0, duration: 0.4, ease: "back.out(3)" });
        },
        onLeaveBack: () => {
          passed--;
          render();
        },
      }),
    );
  });
}
