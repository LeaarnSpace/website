// Panels marked [data-zoom-in] come up as a slightly smaller card, with the section behind
// showing round the edges, and grow to full width as they reach the top.
import { gsap } from "./shared";

export function initZoomIn() {
  document.querySelectorAll<HTMLElement>("[data-zoom-in]").forEach((panel) => {
    gsap.fromTo(
      panel,
      { scale: 0.88 },
      {
        scale: 1,
        ease: "none",
        transformOrigin: "50% 0%",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "top 15%", scrub: true, invalidateOnRefresh: true },
      },
    );
  });
}
