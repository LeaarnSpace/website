// Things every motion module needs: GSAP with ScrollTrigger registered, the smooth-scroll
// instance, and the mapping from Figma's CSS easings to GSAP easings.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const root = document.documentElement;
export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Set by the smooth-scroll module; null when motion is reduced */
let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export const setLenis = (instance: Lenis) => void (lenis = instance);

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
export const toEase = (css?: string) => (css && EASES[css]) || "power2.out";
