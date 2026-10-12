// Horizontal carousels ([data-carousel]): previous/next buttons and the progress bar.
// Works with motion reduced too.
export function initCarousel() {
  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach((c) => {
    const track = c.querySelector<HTMLElement>("[data-track]");
    const prev = c.querySelector<HTMLButtonElement>("[data-prev]");
    const next = c.querySelector<HTMLButtonElement>("[data-next]");
    const fill = c.querySelector<HTMLElement>("[data-progress]");
    if (!track || !prev || !next || !fill) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = () => (track.firstElementChild as HTMLElement).offsetWidth + gap;

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 1;
      fill.style.width = `${Math.max(p, 0.04) * 100}%`;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
}
