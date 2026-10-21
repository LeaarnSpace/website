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

/** Longest the curtain waits for the new page to finish setting up before lifting anyway */
const MAX_WAIT_MS = 1500;

/**
 * @param onArrived called as the curtain lifts (plays the page's entrance animations)
 * @param ready resolves once the page's heavier setup is done; the curtain stays down until then so
 *   that work never stalls the lift mid-animation (most noticeable on iPads)
 */
export function initPageTransitions(onArrived: () => void, ready: Promise<unknown>) {
  const curtain = document.querySelector<HTMLElement>("[data-curtain]");
  if (!curtain) return onArrived();
  const logo = curtain.querySelector(".logo");

  // Arriving from another page: lift the curtain away
  if (root.classList.contains("is-arriving")) {
    storage.clear();
    const wait = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
    Promise.race([ready, wait]).then(() => requestAnimationFrame(() => liftCurtain()));
  } else {
    onArrived();
  }

  function liftCurtain() {
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
  }

  // Leaving: the curtain slides up over the page like another layer, then navigate
  let leaving = false;
  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest?.("a");
    if (!a || !isInternalPageLink(a, e)) return;
    e.preventDefault();
    // A second tap while the curtain is already moving must not restart it
    if (leaving) return;
    leaving = true;
    getLenis()?.stop();
    storage.set();
    gsap
      .timeline({ onComplete: () => void (location.href = a.href) })
      .fromTo(
        curtain,
        // y: 0 clears the stylesheet's translateY(105%), which GSAP would otherwise read as a pixel
        // offset and add on top, leaving the curtain a full screen too low (it never appeared)
        { y: 0, yPercent: 105, borderRadius: "var(--radius-layer) var(--radius-layer) 0 0" },
        { y: 0, yPercent: 0, borderRadius: 0, duration: 0.75, ease: "expo.inOut" },
      )
      .fromTo(logo, { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0.45);
  });

  // Back/forward cache restores the page with the curtain still down
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    gsap.set(curtain, { y: 0, yPercent: 105 });
    getLenis()?.start();
  });
}
