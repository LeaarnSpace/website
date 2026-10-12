// Footer zone: "Stay close to us" drifts up slower than the page (so it looks like it sits
// underneath the panel lifting off it), and the navy footer card rises from the bottom,
// starting larger than its final size and settling into a card.
import { gsap } from "./shared";

export function initFooter() {
  const zone = document.querySelector<HTMLElement>("[data-footer]");
  if (!zone) return;
  const cv = zone.querySelector<HTMLElement>("[data-footer-cv]");
  const card = zone.querySelector<HTMLElement>("[data-footer-card]");

  if (cv) {
    gsap.fromTo(
      cv,
      { yPercent: -45 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: zone, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true },
      },
    );
  }
  if (card) {
    gsap.fromTo(
      card,
      { yPercent: 40, scale: 1.2 },
      {
        yPercent: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: card.parentElement,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  }
}
