import config from '../../site.config.json';

/**
 * Single source of truth for anything that needs the absolute site origin —
 * canonical links, OG tags, the sitemap and the feed. Moving the blog to another
 * domain is a change to site.config.json and a DNS record, nothing else.
 */
export const SITE = config;
