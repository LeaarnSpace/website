// Contents lists ([data-toc]): highlights the link for the section currently in view.
export function initToc() {
  document.querySelectorAll<HTMLElement>("[data-toc]").forEach((toc) => {
    const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const sections = links
      .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
      .filter((s): s is HTMLElement => Boolean(s));
    const setActive = (id: string) => links.forEach((a) => a.toggleAttribute("aria-current", a.hash.slice(1) === id));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A section counts as "current" while it crosses the upper third of the screen
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
  });
}
