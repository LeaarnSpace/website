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
  // effects are set up after that, when content has its final size. document.fonts.ready alone
  // isn't enough on iPad Safari: it can resolve before the Google Fonts stylesheet has registered
  // the faces, so the text was split in the fallback font and then reflowed when Manrope arrived.
  // Asking for the weights we use makes the wait real; it never waits more than 3 seconds.
  const fontsLoaded = Promise.all(
    ["400", "500", "600", "700"].map((w) => document.fonts.load(`${w} 16px Manrope`).catch(() => null)),
  ).then(() => document.fonts.ready);
  const fontsReady = Promise.race([fontsLoaded, new Promise((r) => setTimeout(r, 3000))]).then(() => {
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
  }, fontsReady);
}

init();
