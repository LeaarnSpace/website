import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TRANSITION_KEY = "ls-transition";

// Figma CSS easings -> GSAP easings
const EASES: Record<string, string> = {
  linear: "none",
  ease: "power1.inOut",
  "ease-in": "power2.in",
  "ease-out": "power2.out",
  "ease-in-out": "power2.inOut",
  "step-end": "steps(1)",
  "cubic-bezier(0.22, 1, 0.36, 1)": "expo.out",
  "cubic-bezier(0.5, 0, 0.5, 1)": "sine.inOut",
};
const toEase = (css?: string) => (css && EASES[css]) || "power2.out";

let lenis: Lenis | null = null;

/* ------------------------------------------------------------------ */
/* Smooth scrolling                                                    */
/* ------------------------------------------------------------------ */
function initSmoothScroll() {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Pause page scrolling while the phone menu is open
  document.addEventListener("nav:toggle", (e) => ((e as CustomEvent<boolean>).detail ? lenis?.stop() : lenis?.start()));

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href");
      if (!target || target === "#") return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      lenis?.scrollTo(el as HTMLElement, { offset: -24 });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Scale-to-fit stages (diagrams laid out at Figma size)               */
/* ------------------------------------------------------------------ */
function initFit() {
  const fits = Array.from(document.querySelectorAll<HTMLElement>("[data-fit]"));
  let lastWidth = 0;
  const update = () => {
    fits.forEach((fit) => {
      const stage = fit.firstElementChild as HTMLElement;
      // A stage may switch to a stacked layout on small screens (static positioning in CSS)
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

/* ------------------------------------------------------------------ */
/* Layers. Panels marked data-layer hold still while the next panel    */
/* slides up over them:                                                */
/*   "pin"   – just holds still                                        */
/*   "float" – also sinks back and darkens (needs a .layer__shade)     */
/* ------------------------------------------------------------------ */
function initLayers() {
  const layers = gsap.utils.toArray<HTMLElement>(".layer");
  layers.forEach((layer, i) => {
    layer.style.zIndex = String(i + 1);
    const mode = layer.dataset.layer;
    const next = layers[i + 1];
    if (!next || !mode) return;

    if (mode === "pin") {
      ScrollTrigger.create({
        trigger: layer,
        start: () => (layer.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
        end: () => `+=${Math.min(next.offsetHeight, window.innerHeight)}`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
      return;
    }

    const shade = layer.querySelector<HTMLElement>(".layer__shade");

    // Pin when the bottom of the layer reaches the bottom of the screen (or its top hits the
    // top, for short layers) and hold it while the next layer covers the viewport.
    const startAt = () => (layer.offsetHeight > window.innerHeight ? "bottom bottom" : "top top");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: layer,
        start: startAt,
        end: () => `+=${window.innerHeight}`,
        pin: true,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: () => {
          // Shrink toward the middle of what is on screen, not the middle of the whole section
          const visibleMid = Math.max(layer.offsetHeight - window.innerHeight / 2, window.innerHeight / 2);
          gsap.set(layer, { transformOrigin: `50% ${visibleMid}px` });
        },
      },
    });
    tl.to(layer, { scale: 0.92, borderRadius: "var(--radius-layer)", ease: "none" }, 0);
    if (shade) tl.to(shade, { opacity: 0.55, ease: "none" }, 0);
  });
}

/* ------------------------------------------------------------------ */
/* Headlines slide up line by line                                     */
/* ------------------------------------------------------------------ */
type SplitState = { played: boolean };
const splitState = new WeakMap<HTMLElement, SplitState>();

function splitLines(el: HTMLElement) {
  const text = el.dataset.text ?? el.textContent?.trim().replace(/\s+/g, " ") ?? "";
  el.dataset.text = text;
  el.setAttribute("aria-label", text);

  // Lay out the words, then group them by the line they land on
  el.innerHTML = text
    .split(" ")
    .map((w) => `<span class="split-word" style="display:inline-block">${w}</span>`)
    .join(" ");
  const words = Array.from(el.querySelectorAll<HTMLElement>(".split-word"));
  const lines: string[][] = [];
  let lastTop: number | null = null;
  words.forEach((w) => {
    const top = w.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 2) lines.push([]);
    lines[lines.length - 1].push(w.textContent ?? "");
    lastTop = top;
  });

  el.innerHTML = lines
    .map(
      (line) =>
        `<span class="split-line" aria-hidden="true"><span class="split-line__inner">${line.join(" ")}</span></span>`,
    )
    .join("");
  el.classList.add("is-split");
  return Array.from(el.querySelectorAll<HTMLElement>(".split-line__inner"));
}

function revealLines(el: HTMLElement, delay = 0) {
  const state = splitState.get(el);
  if (!state || state.played) return;
  state.played = true;
  gsap.fromTo(
    el.querySelectorAll(".split-line__inner"),
    { yPercent: 110, rotate: 2 },
    { yPercent: 0, rotate: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, delay },
  );
}

function initLines(): HTMLElement[] {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-lines]"));
  const immediate: HTMLElement[] = [];
  els.forEach((el) => {
    const inner = splitLines(el);
    splitState.set(el, { played: false });
    gsap.set(inner, { yPercent: 110 });
    if (el.hasAttribute("data-lines-immediate")) {
      immediate.push(el);
    } else {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => revealLines(el) });
    }
  });

  // Line breaks change with width: re-split, keeping whatever has already been revealed
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    els.forEach((el) => {
      const inner = splitLines(el);
      gsap.set(inner, { yPercent: splitState.get(el)?.played ? 0 : 110 });
    });
  });
  return immediate;
}

/* ------------------------------------------------------------------ */
/* Line-drawn illustrations (timings from the Figma motion data)       */
/* ------------------------------------------------------------------ */
function buildIllustration(el: HTMLElement) {
  const tl = gsap.timeline({ paused: true });
  el.querySelectorAll<HTMLElement>(".illus__piece[data-kind]").forEach((piece) => {
    const start = Number(piece.dataset.start);
    const duration = Math.max(0.05, Number(piece.dataset.end) - start);
    const ease = toEase(piece.dataset.ease);
    if (piece.dataset.kind === "draw") {
      const strokes = piece.querySelectorAll<SVGGeometryElement>("path, line, polyline, rect, circle, ellipse");
      strokes.forEach((s) => s.setAttribute("pathLength", "1"));
      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(piece, { autoAlpha: 0 });
      tl.set(piece, { autoAlpha: 1 }, start).to(strokes, { strokeDashoffset: 0, duration, ease }, start);
    } else {
      gsap.set(piece, { autoAlpha: 0 });
      tl.to(piece, { autoAlpha: 1, duration, ease }, start);
    }
  });
  return tl;
}

function initIllustrations() {
  const hero: gsap.core.Timeline[] = [];
  document.querySelectorAll<HTMLElement>("[data-illustration]").forEach((el) => {
    const tl = buildIllustration(el);
    if (el.closest(".hero")) hero.push(tl);
    else ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => tl.play() });
  });
  return hero;
}

/* ------------------------------------------------------------------ */
/* Our Approach diagram                                                */
/* ------------------------------------------------------------------ */
function initApproach() {
  // There is a desktop diagram and a compact phone one; only one is visible at a time
  document.querySelectorAll<HTMLElement>("[data-approach]").forEach((stage) => {
    const q = gsap.utils.selector(stage);
    const tl = gsap.timeline({ paused: true });
    const compact = stage.offsetWidth > 0 && stage.offsetWidth < 600;
    const rise = compact ? 80 : 200;

    // Cards rise in the order of the cycle: research, build, execute, measure
    const order: [string, number][] = [["research", 0], ["build", 0.25], ["execute", 0.5], ["measure", 0.75]];
    order.forEach(([key, at]) => {
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

    // Arrows loop like the Figma "Arrow animation" component: hidden for 1.3s, then sweep in from the tail over 0.7s
    q("[data-arrow]").forEach((arrow) => {
      gsap.set(arrow, { clipPath: "inset(0 100% 0 0)" });
      const loop = gsap
        .timeline({ repeat: -1, paused: true })
        .set(arrow, { clipPath: "inset(0 100% 0 0)" })
        .to(arrow, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "expo.out" }, 1.3);
      tl.add(() => void loop.play(), 0);
    });

    // Desktop notes: dot appears, line drops, copy slides out from behind its mask
    [["build", 1.73, 2.1], ["measure", 1.83, 2.45]].forEach(([key, at, textAt]) => {
      const note = q(`[data-note="${key}"]`)[0];
      if (!note) return;
      const dot = note.querySelector(".note__dot");
      const line = note.querySelector(".note__line");
      const text = note.querySelector(".note__text");
      gsap.set(dot, { autoAlpha: 0 });
      gsap.set(line, { scaleY: 0 });
      gsap.set(text, { x: -599, autoAlpha: 0 });
      tl.to(dot, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, at as number)
        .to(line, { scaleY: 1, duration: 0.5, ease: "power2.out" }, at as number)
        .set(text, { autoAlpha: 1 }, textAt as number)
        .to(text, { x: 0, duration: 1.2, ease: "expo.out" }, textAt as number);
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

/* ------------------------------------------------------------------ */
/* Our work cards: start stacked in a pile at the centre, fan out to   */
/* their Figma positions as the section comes into view, then float    */
/* gently (Figma "our work animation").                                */
/* ------------------------------------------------------------------ */
function floatCard(card: HTMLElement, i: number) {
  const paths: [number, number][][] = [
    [[5, -14], [-4, 8], [3, -10]],
    [[-6, 12], [5, -8], [-3, 10]],
    [[4, -12], [-5, 10], [3, -6]],
  ];
  const points = paths[i % paths.length];
  // The Figma float distances are for the 263px desktop cards; scale them down for the small phone cards
  const k = Math.min(1, card.offsetHeight / 263);
  gsap.to(card, {
    keyframes: [...points, [0, 0]].map(([x, y]) => ({ x: x * k, y: y * k, duration: gsap.utils.random(1.6, 2.4), ease: "sine.inOut" })),
    repeat: -1,
  });
}

function initWorkCards() {
  const cards = gsap.utils.toArray<HTMLElement>("[data-float]");
  if (!cards.length) return;
  const stage = cards[0].closest<HTMLElement>(".work__stage")!;
  const logotype = stage.querySelector(".work__logotype");

  // Offsets that pull every card onto the middle one, slightly fanned like a hand of cards
  const centre = cards[Math.floor(cards.length / 2)];
  const tilt = [-7, 2, 8];
  cards.forEach((card, i) => {
    gsap.set(card, {
      x: centre.offsetLeft - card.offsetLeft,
      y: centre.offsetTop - card.offsetTop + (30 + i * 6) * Math.min(1, card.offsetHeight / 263),
      rotation: tilt[i % tilt.length],
    });
  });
  gsap.set(logotype, { autoAlpha: 0, scale: 0.94 });

  const tl = gsap.timeline({ paused: true });
  tl.to(logotype, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0.15);
  cards.forEach((card, i) => {
    tl.to(
      card,
      { x: 0, y: 0, rotation: 0, duration: 1.3, ease: "back.out(1.3)", onComplete: () => floatCard(card, i) },
      0.1 + Math.abs(i - cards.indexOf(centre)) * 0.08,
    );
  });
  ScrollTrigger.create({ trigger: stage, start: "top 75%", once: true, onEnter: () => tl.play() });
}

/* ------------------------------------------------------------------ */
/* Contact / Newsletter tiles (Figma "Subscribe" variants): the tile   */
/* shrinks, the lines in the icon clear, then write back in.           */
/* ------------------------------------------------------------------ */
function initIconTiles() {
  document.querySelectorAll<HTMLElement>("[data-icon-anim]").forEach((option) => {
    const tile = option.querySelector<HTMLElement>("[data-tile]")!;
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

/* ------------------------------------------------------------------ */
/* Footer: "Stay close to us" drifts up slower than the page, so it    */
/* looks like it sits underneath the panel lifting off it; the navy    */
/* footer card rises from the bottom, starting larger than its final   */
/* size and settling into a card as it comes into view.                */
/* ------------------------------------------------------------------ */
function initFooter() {
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

/* ------------------------------------------------------------------ */
/* Panels marked data-zoom-in come up as a smaller card, with the      */
/* section behind showing round the edges, and grow to full width      */
/* ------------------------------------------------------------------ */
function initZoomIn() {
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

/* ------------------------------------------------------------------ */
/* Blog carousel                                                       */
/* ------------------------------------------------------------------ */
function initCarousel() {
  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach((c) => {
    const track = c.querySelector<HTMLElement>("[data-track]")!;
    const prev = c.querySelector<HTMLButtonElement>("[data-prev]")!;
    const next = c.querySelector<HTMLButtonElement>("[data-next]")!;
    const fill = c.querySelector<HTMLElement>("[data-progress]")!;
    const step = () => (track.firstElementChild as HTMLElement).offsetWidth + 40;

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

/* ------------------------------------------------------------------ */
/* Page transitions                                                    */
/* ------------------------------------------------------------------ */
function isInternalPageLink(a: HTMLAnchorElement, e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname && url.hash) return false;
  return true;
}

function initPageTransitions(onArrived: () => void) {
  const curtain = document.querySelector<HTMLElement>("[data-curtain]");
  if (!curtain) return onArrived();
  const logo = curtain.querySelector(".logo");

  // Arriving from another page: lift the curtain away
  if (root.classList.contains("is-arriving")) {
    try { sessionStorage.removeItem(TRANSITION_KEY); } catch {}
    gsap.timeline({ onComplete: () => root.classList.remove("is-arriving") })
      .set(curtain, { yPercent: 0, y: 0, borderRadius: 0 })
      .to(logo, { scale: 0.9, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.1)
      .to(curtain, { yPercent: -105, borderRadius: "0 0 var(--radius-layer) var(--radius-layer)", duration: 0.9, ease: "expo.inOut" }, 0.15)
      .add(onArrived, 0.55);
  } else {
    onArrived();
  }

  // Leaving: curtain slides up over the page like another layer, then navigate
  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest?.("a");
    if (!a || !isInternalPageLink(a, e)) return;
    e.preventDefault();
    lenis?.stop();
    try { sessionStorage.setItem(TRANSITION_KEY, "1"); } catch {}
    gsap.timeline({ onComplete: () => void (location.href = a.href) })
      .fromTo(curtain, { yPercent: 105, borderRadius: "var(--radius-layer) var(--radius-layer) 0 0" }, { yPercent: 0, borderRadius: 0, duration: 0.75, ease: "expo.inOut" })
      .fromTo(logo, { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0.45);
  });

  // Back/forward cache restores the page with the curtain still down
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    gsap.set(curtain, { yPercent: 105 });
    lenis?.start();
  });
}

/* ------------------------------------------------------------------ */

function init() {
  if (reduceMotion) {
    root.classList.remove("js-motion", "is-arriving");
    try { sessionStorage.removeItem(TRANSITION_KEY); } catch {}
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
  initCarousel();

  // Line breaks and letter widths depend on the web fonts, so split text once they have loaded.
  // Layers are pinned last, after the content inside them has its final size.
  const fontsReady = document.fonts.ready.then(() => {
    const heroLines = initLines();
    initLayers();
    initFooter();
    initZoomIn();
    ScrollTrigger.refresh();
    return heroLines;
  });

  initPageTransitions(() => {
    fontsReady.then((heroLines) => heroLines.forEach((el, i) => revealLines(el, 0.15 + i * 0.25)));
    heroIllustrations.forEach((tl) => tl.play());
  });
}

init();
