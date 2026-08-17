export interface PostSeries {
  name: string;
  part: number;
}

/** A top-level section of the blog. Closed set, defined in site.config.json. */
export interface Category {
  slug: string;
  label: string;
  description: string;
}

/** Everything about a post except its rendered body. Small enough to ship in the main bundle. */
export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description: string;
  /** At least one, every value a known category slug. Enforced at build time. */
  categories: string[];
  tags: string[];
  readingTime: number;
  ogImage?: string;
  series?: PostSeries;
}

/** A post with its rendered HTML, loaded on demand from its own chunk. */
export interface Post extends PostMeta {
  html: string;
}
