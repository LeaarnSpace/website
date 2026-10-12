// Headlines marked [data-lines] slide up line by line. [data-lines-immediate] ones play on page
// load (the hero); the rest play as they scroll into view.
import { gsap, ScrollTrigger } from "./shared";

const played = new WeakMap<HTMLElement, boolean>();

function splitLines(el: HTMLElement) {
  const text = el.dataset.text ?? el.textContent?.trim().replace(/\s+/g, " ") ?? "";
  el.dataset.text = text;
  el.setAttribute("aria-label", text);

  // Lay out the words, then group them by the line they land on
  el.innerHTML = text
    .split(" ")
    .map((w) => `<span class="split-word" style="display:inline-block">${w}</span>`)
    .join(" ");
  const lines: string[][] = [];
  let lastTop: number | null = null;
  el.querySelectorAll<HTMLElement>(".split-word").forEach((w) => {
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

export function revealLines(el: HTMLElement, delay = 0) {
  if (!played.has(el) || played.get(el)) return;
  played.set(el, true);
  gsap.fromTo(
    el.querySelectorAll(".split-line__inner"),
    { yPercent: 110, rotate: 2 },
    { yPercent: 0, rotate: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, delay },
  );
}

/** Splits every headline; returns the ones that should play on page load */
export function initLines(): HTMLElement[] {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-lines]"));
  const immediate: HTMLElement[] = [];
  els.forEach((el) => {
    gsap.set(splitLines(el), { yPercent: 110 });
    played.set(el, false);
    if (el.hasAttribute("data-lines-immediate")) immediate.push(el);
    else ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => revealLines(el) });
  });

  // Line breaks change with width: re-split, keeping whatever has already been revealed
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    els.forEach((el) => gsap.set(splitLines(el), { yPercent: played.get(el) ? 0 : 110 }));
  });
  return immediate;
}
