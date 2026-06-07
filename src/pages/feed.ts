// Re-export the same RSS feed at /feed for URL compatibility.
// Both /feed and /feed.xml serve identical content.
export { GET } from './feed.xml.ts'
