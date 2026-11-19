export type CloudflareBlogEntry = {
  creator: string
  title: string
  link: string
  pubDate: string
  'content:encoded': string
  'content:encodedSnippet': string
  enclosure: {
    url: string
  },
  'dc:creator': string
  content: string
  contentSnippet: string
  guid: string
  categories: string[]
  isoDate: string
}