// "Our work" cards ([data-float]): start stacked in a pile, fan out to their Figma positions once
// the wordmark has shown, then float gently (Figma "our work animation").
import { gsap, ScrollTrigger } from "./shared";

/** Figma float paths in px, for the 263px-tall desktop cards */
const FLOAT_PATHS: [number, number][][] = [
  [
    [5, -14],
    [-4, 8],
    [3, -10],
  ],
  [
    [-6, 12],
    [5, -8],
    [-3, 10],
  ],
  [
    [4, -12],
    [-5, 10],
    [3, -6],
  ],
];
const DESKTOP_CARD_HEIGHT = 263;
const TILT = [-7, 2, 8];

/** Scales Figma distances down for the smaller phone cards */
const sizeFactor = (card: HTMLElement) => Math.min(1, card.offsetHeight / DESKTOP_CARD_HEIGHT);

function floatCard(card: HTMLElement, i: number) {
  const k = sizeFactor(card);
  gsap.to(card, {
    keyframes: [...FLOAT_PATHS[i % FLOAT_PATHS.length], [0, 0]].map(([x, y]) => ({
      x: x * k,
      y: y * k,
      duration: gsap.utils.random(1.6, 2.4),
      ease: "sine.inOut",
    })),
    repeat: -1,
  });
}

export function initWorkCards() {
  const cards = gsap.utils.toArray<HTMLElement>("[data-float]");
  if (!cards.length) return;
  const stage = cards[0].closest<HTMLElement>(".work__stage")!;
  const logotype = stage.querySelector(".work__logotype");

  // Pull every card onto the middle one, slightly fanned like a hand of cards
  const centre = cards[Math.floor(cards.length / 2)];
  cards.forEach((card, i) => {
    gsap.set(card, {
      x: centre.offsetLeft - card.offsetLeft,
      y: centre.offsetTop - card.offsetTop + (30 + i * 6) * sizeFactor(card),
      rotation: TILT[i % TILT.length],
    });
  });
  gsap.set(logotype, { autoAlpha: 0, scale: 0.94 });

  // The wordmark shows first; the cards hold in their pile for a beat, then spread out slowly
  const tl = gsap.timeline({ paused: true });
  tl.to(logotype, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0);
  cards.forEach((card, i) => {
    tl.to(
      card,
      { x: 0, y: 0, rotation: 0, duration: 1.8, ease: "power3.inOut", onComplete: () => floatCard(card, i) },
      1.6 + Math.abs(i - cards.indexOf(centre)) * 0.12,
    );
  });
  ScrollTrigger.create({ trigger: stage, start: "top 75%", once: true, onEnter: () => tl.play() });
}
