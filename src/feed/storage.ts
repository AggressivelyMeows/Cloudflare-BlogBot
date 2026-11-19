type StoredFeedItem = {
  id: string
  feed: string
  created_at: string
}

export class Storage {
  constructor(private db: D1Database) {}

  async init() {
    const feedItemsColumns = {
      id: 'TEXT',
      feed: 'TEXT',
      created_at: 'TEXT'
    }

    const feedItemsCols = Object.entries(feedItemsColumns).map(([k,v]) => `${k} ${v}`).join(', ')

    await this.db.prepare(
      `CREATE TABLE IF NOT EXISTS feed_items (${feedItemsCols})`
    ).run()
  }

  async lastFeedItem(feed: string): Promise<StoredFeedItem> {
    return await this.db.prepare(
      'SELECT * FROM feed_items WHERE feed = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(feed).first() as StoredFeedItem
  }

  async hasFeedItem(feed: string, id: string) {
    const row = await this.db.prepare(
      'SELECT 1 FROM feed_items WHERE feed = ? AND id = ?'
    ).bind(feed, id).first()
    return !!row
  }

  async addFeedItem(feed: string, id: string) {
    await this.db.prepare(
      'INSERT INTO feed_items (id, feed, created_at) VALUES (?, ?, ?)'
    ).bind(id, feed, new Date().toISOString()).run()
  }
}