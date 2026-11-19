// Photos are local images (from the Markdown files) or URLs (from the back office). Astro's <Image> downloads and
// resizes URLs at build time too, but needs to be told to read their size: spread this into <Image>.
export const imageSource = (src: ImageMetadata | string) =>
  typeof src === "string" ? ({ src, inferSize: true } as const) : ({ src } as const);
