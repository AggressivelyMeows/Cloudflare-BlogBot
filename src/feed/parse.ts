import Parser from 'rss-parser'

export const parseFeed = async (url: string) => {
	const parser = new Parser()
	return parser.parseURL(url)
}