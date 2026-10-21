import type { ImageMetadata } from "astro";

export interface TeamMember {
  name: string;
  role: string;
  photo: ImageMetadata;
}

// The "People doing the work" section on Who We Are stays hidden while this list is empty.
// Add one entry per person, with their photo in src/assets/images/team/, e.g.
//   { name: "Ada Obi", role: "Educational consultant", photo: adaPhoto },
export const team: TeamMember[] = [];
