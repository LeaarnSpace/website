// Page panels (.layer) are stacked in document order so each one overlaps the one before it.
export function stackLayers() {
  document.querySelectorAll<HTMLElement>(".layer").forEach((layer, i) => {
    layer.style.zIndex = String(i + 1);
  });
}
