// Diagrams laid out at their Figma size ([data-fit="<design width>"]) are scaled down to fit
// narrower screens. A stage whose CSS switches to its own phone layout is left alone.
import { ScrollTrigger } from "./shared";

export function initFit() {
  const fits = Array.from(document.querySelectorAll<HTMLElement>("[data-fit]"));
  let lastWidth = 0;
  const update = () => {
    fits.forEach((fit) => {
      const stage = fit.firstElementChild as HTMLElement;
      const stacked = getComputedStyle(stage).width !== `${fit.dataset.fit}px`;
      if (stacked) {
        stage.style.transform = "";
        fit.style.height = "";
        return;
      }
      const scale = Math.min(1, fit.clientWidth / Number(fit.dataset.fit));
      stage.style.transform = `scale(${scale})`;
      fit.style.height = `${stage.offsetHeight * scale}px`;
    });
  };
  update();
  new ResizeObserver(() => {
    if (document.body.clientWidth === lastWidth) return;
    lastWidth = document.body.clientWidth;
    update();
    ScrollTrigger.refresh();
  }).observe(document.body);
}
