import { parseFeed } from './feed/parse'
import { Storage } from './feed/storage'
import { toDiscordComponents } from './feed/discord'
import type { CloudflareBlogEntry } from './types'

export default {
	async fetch(req) {
		return new Response('ok')
	},
	async scheduled(event, env, ctx): Promise<void> {
		const storage = new Storage(env.DB)
		await storage.init()

		const config = [
			{
				id: 'cloudflare-blog',
				channel: env.DISCORD_WEBHOOK,
				feed: 'https://blog.cloudflare.com/rss',
				// Date to prevent us from posting the entire blog to the channel when we boot up for the first time
				startedAt: new Date('2026-11-16')
			}
		]

		for (const c of config) {
			try {
				const feed = await parseFeed(c.feed) as { items: CloudflareBlogEntry[] }

				const lastProcessed = await storage.lastFeedItem(c.id)

				// For safety, minus a day from the last processed date
				const lastProcessedSafe = new Date(lastProcessed?.created_at || c.startedAt)
				lastProcessedSafe.setDate(lastProcessedSafe.getDate() - 1)

				// Filter items by startedAt
				const newItems = feed.items.filter(item => new Date(item.pubDate) > lastProcessedSafe)

				for (const item of newItems) {
					const exists = await storage.hasFeedItem(c.id, item.guid)

					if (exists) continue

					const components = await toDiscordComponents(env, item)

					// Post them to the webhook
					const discordResponse = await fetch(c.channel + '?with_components=true', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(components) })

					if (!discordResponse.ok) {
						console.error('We had an error while trying to send to the channel:', await discordResponse.text())
						console.log(JSON.stringify(components, null, 1))
					} else {
						await storage.addFeedItem(c.id, item.guid)
					}
				}
			} catch (e) {
				console.error(e)
			}
		}
	},
} satisfies ExportedHandler<Env>
