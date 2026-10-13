// Entry point for all site motion. Each effect lives in its own module and only acts on pages
// that contain its markup, so this file is safe to load on every page.
import { ScrollTrigger, root, reduceMotion } from "./shared";
import { initSmoothScroll } from "./smooth-scroll";
import { initFit } from "./fit";
import { stackLayers } from "./layers";
import { initLines, revealLines } from "./lines";
import { initIllustrations } from "./illustrations";
import { initApproach } from "./approach";
import { initWorkCards } from "./work-cards";
import { initIconTiles } from "./icon-tiles";
import { initRiseCards } from "./rise-cards";
import { initCountUp, initScrollCount } from "./count-up";
import { initSlideIn } from "./slide-in";
import { initHighlights } from "./highlight";
import { initFooter } from "./footer";
import { initZoomIn } from "./zoom-in";
import { initCarousel } from "./carousel";
import { initPageTransitions, clearTransition } from "./page-transitions";

function init() {
  // Reduced motion: show everything in place, keep only what's needed for layout and controls
  if (reduceMotion) {
    root.classList.remove("js-motion");
    clearTransition();
    initFit();
    initCarousel();
    return;
  }

  initSmoothScroll();
  initFit();
  const heroIllustrations = initIllustrations();
  initApproach();
  initWorkCards();
  initIconTiles();
  initRiseCards();
  initCountUp();
  initSlideIn();
  initHighlights();
  initCarousel();

  // Line breaks depend on the web fonts, so split text once they have loaded; scroll-linked
  // effects are set up after that, when content has its final size.
  const fontsReady = document.fonts.ready.then(() => {
    const heroLines = initLines();
    stackLayers();
    initFooter();
    initZoomIn();
    initScrollCount();
    ScrollTrigger.refresh();
    return heroLines;
  });

  initPageTransitions(() => {
    fontsReady.then((heroLines) => heroLines.forEach((el, i) => revealLines(el, 0.15 + i * 0.25)));
    heroIllustrations.forEach((tl) => tl.play());
  });
}

init();
