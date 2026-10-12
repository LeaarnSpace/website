// Page transitions: a cobalt curtain slides up over the page when leaving, and lifts away on
// the next page. The "is-arriving" class is set before paint by an inline script in Base.astro.
import { gsap, root, getLenis } from "./shared";

export const TRANSITION_KEY = "ls-transition";

const storage = {
  set: () => {
    try {
      sessionStorage.setItem(TRANSITION_KEY, "1");
    } catch {
      /* storage blocked: transition still plays, just not the arrival half */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(TRANSITION_KEY);
    } catch {
      /* storage blocked */
    }
  },
};

function isInternalPageLink(a: HTMLAnchorElement, e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname && url.hash) return false;
  return true;
}

/** Clears a pending arrival (used when motion is reduced) */
export const clearTransition = () => {
  root.classList.remove("is-arriving");
  storage.clear();
};

export function initPageTransitions(onArrived: () => void) {
  const curtain = document.querySelector<HTMLElement>("[data-curtain]");
  if (!curtain) return onArrived();
  const logo = curtain.querySelector(".logo");

  // Arriving from another page: lift the curtain away
  if (root.classList.contains("is-arriving")) {
    storage.clear();
    gsap
      .timeline({ onComplete: () => root.classList.remove("is-arriving") })
      .set(curtain, { yPercent: 0, y: 0, borderRadius: 0 })
      .to(logo, { scale: 0.9, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.1)
      .to(
        curtain,
        {
          yPercent: -105,
          borderRadius: "0 0 var(--radius-layer) var(--radius-layer)",
          duration: 0.9,
          ease: "expo.inOut",
        },
        0.15,
      )
      .add(onArrived, 0.55);
  } else {
    onArrived();
  }

  // Leaving: the curtain slides up over the page like another layer, then navigate
  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest?.("a");
    if (!a || !isInternalPageLink(a, e)) return;
    e.preventDefault();
    getLenis()?.stop();
    storage.set();
    gsap
      .timeline({ onComplete: () => void (location.href = a.href) })
      .fromTo(
        curtain,
        { yPercent: 105, borderRadius: "var(--radius-layer) var(--radius-layer) 0 0" },
        { yPercent: 0, borderRadius: 0, duration: 0.75, ease: "expo.inOut" },
      )
      .fromTo(logo, { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0.45);
  });

  // Back/forward cache restores the page with the curtain still down
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    gsap.set(curtain, { yPercent: 105 });
    getLenis()?.start();
  });
}
