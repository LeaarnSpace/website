// Line-drawn illustrations ([data-illustration], rendered by Illustration.astro). Each piece
// draws on or fades in with the timing taken from the Figma motion data.
import { gsap, ScrollTrigger, toEase } from "./shared";

function buildTimeline(el: HTMLElement) {
  const tl = gsap.timeline({ paused: true });
  el.querySelectorAll<HTMLElement>(".illus__piece[data-kind]").forEach((piece) => {
    const start = Number(piece.dataset.start);
    const duration = Math.max(0.05, Number(piece.dataset.end) - start);
    const ease = toEase(piece.dataset.ease);
    gsap.set(piece, { autoAlpha: 0 });
    if (piece.dataset.kind === "draw") {
      const strokes = piece.querySelectorAll<SVGGeometryElement>("path, line, polyline, rect, circle, ellipse");
      strokes.forEach((s) => s.setAttribute("pathLength", "1"));
      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      tl.set(piece, { autoAlpha: 1 }, start).to(strokes, { strokeDashoffset: 0, duration, ease }, start);
    } else {
      tl.to(piece, { autoAlpha: 1, duration, ease }, start);
    }
  });
  return tl;
}

/**
 * Hero illustrations are returned so they can play once the page has arrived; the others play
 * when scrolled into view, at the speed set by data-speed (default 1).
 */
export function initIllustrations(): gsap.core.Timeline[] {
  const hero: gsap.core.Timeline[] = [];
  document.querySelectorAll<HTMLElement>("[data-illustration]").forEach((el) => {
    const tl = buildTimeline(el);
    if (el.closest(".hero")) hero.push(tl);
    else {
      const speed = Number(el.dataset.speed ?? 1);
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => tl.timeScale(speed).play() });
    }
  });
  return hero;
}
