// Contact / Newsletter tiles ([data-icon-anim], Figma "Subscribe" variants): the tile shrinks,
// the lines in the icon clear, then write back in. Plays on scroll-in and on hover/focus.
import { gsap, ScrollTrigger } from "./shared";

export function initIconTiles() {
  document.querySelectorAll<HTMLElement>("[data-icon-anim]").forEach((option) => {
    const tile = option.querySelector<HTMLElement>("[data-tile]");
    if (!tile) return;
    const lines = tile.querySelectorAll<Element>("[data-icon-line], .icon--chat rect");
    gsap.set(lines, { transformOrigin: "0% 50%", transformBox: "fill-box" });

    const tl = gsap
      .timeline({ paused: true })
      .to(tile, { scale: 130 / 160, duration: 0.35, ease: "power2.inOut" })
      .to(lines, { scaleX: 0, duration: 0.2, ease: "power2.in", stagger: 0.05 }, 0)
      .to(lines, { scaleX: 1, duration: 0.35, ease: "power2.out", stagger: 0.12 }, 0.45)
      .to(tile, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.8);

    const play = () => !tl.isActive() && tl.restart();
    option.addEventListener("mouseenter", play);
    option.addEventListener("focus", play);
    ScrollTrigger.create({ trigger: option, start: "top 85%", once: true, onEnter: play });
  });
}
