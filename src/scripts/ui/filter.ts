// Client-side filtering for lists. Markup contract:
//   [data-filter-root]                  wraps everything
//     [data-filter-value="…"]           filter buttons ("all" shows everything)
//     input[data-filter-search]         optional free-text search
//     [data-filter-item]                each item, with data-filter-tag="…" and data-filter-text="…"
//     [data-filter-empty]               optional "nothing matches" message
//   data-page-size="4" on the root      optional: show this many matches, then a
//     [data-filter-more] button         "Load more" button that reveals the next batch
export function initFilters() {
  document.querySelectorAll<HTMLElement>("[data-filter-root]").forEach((root) => {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-filter-value]"));
    const search = root.querySelector<HTMLInputElement>("input[data-filter-search]");
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-filter-item]"));
    const empty = root.querySelector<HTMLElement>("[data-filter-empty]");
    const more = root.querySelector<HTMLButtonElement>("[data-filter-more]");
    const pageSize = Number(root.dataset.pageSize ?? Infinity);
    let active = "all";
    let limit = pageSize;

    const apply = () => {
      const q = (search?.value ?? "").trim().toLowerCase();
      let matches = 0;
      items.forEach((item) => {
        const tagOk = active === "all" || item.dataset.filterTag === active;
        const textOk = !q || (item.dataset.filterText ?? item.textContent ?? "").toLowerCase().includes(q);
        const match = tagOk && textOk;
        if (match) matches++;
        item.hidden = !match || matches > limit;
      });
      if (empty) empty.hidden = matches > 0;
      if (more) more.hidden = matches <= limit;
    };

    more?.addEventListener("click", () => {
      limit += pageSize;
      apply();
    });

    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        active = b.dataset.filterValue ?? "all";
        limit = pageSize;
        buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        apply();
      }),
    );
    search?.addEventListener("input", () => {
      limit = pageSize;
      apply();
    });
    apply();
  });
}
