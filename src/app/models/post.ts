export interface PostSeries {
  name: string;
  part: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description: string;
  tags: string[];
  readingTime: number;
  html: string;
  ogImage?: string;
  series?: PostSeries;
}
