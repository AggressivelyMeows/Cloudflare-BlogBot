import { extractQuote } from './extracter'
import type { CloudflareBlogEntry } from '../types'

const phrasesToRemove = [
  // Sometimes this shows up in the content and snippets.
  // We should hide it to keep the content clean etc
  'Add your teaser here. It should complement the headline, not repeat it. Teaser cannot be longer than 240 characters. The Blog Review Gem will suggest an excerpt.'
]

const cleanTextFromPhrases = (text: string) => {
  let clean = text
  for (const phrase of phrasesToRemove) {
    clean = clean.replace(phrase, '')
  }
  return clean
}

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-')

export const toDiscordComponents = async (env: Env, item: CloudflareBlogEntry) => {
  // Compose a new message from the blog entry
  const quote = await extractQuote(env, item['content:encoded'].replaceAll(phrasesToRemove[0], ''))

  return {
    "components": [
      {
        "accent_color": 0xff5f07,
        "components": [
          {
            "content": `## [${ item.title }](${ item.link })`,
            "type": 10
          },
          {
            "content": `by [${ item.creator }](https://blog.cloudflare.com/author/${ slugify(item.creator) }/)`,
            "type": 10
          },
          {
            "content": `${ cleanTextFromPhrases(item.contentSnippet) }`,
            "type": 10
          },
          {
            "content": `> \"${ quote }\"`,
            "type": 10
          },
          {
            "items": [
              {
                "description": null,
                "media": {
                  "url": item.enclosure.url
                },
                "spoiler": null
              }
            ],
            "type": 12
          },
          {
            "components": item.categories.slice(0, 5).map(c => ({
                disabled: null,
                label: c,
                style: 5,
                type: 2,
                url: `https://blog.cloudflare.com/tag/${ slugify(c) }`
              }))
            ,
            "type": 1
          }
        ],
        "spoiler": null,
        "type": 17
      },
      // {
      //   "components": [
      //     {
      //       "disabled": null,
      //       "emoji": {
      //         "id": null,
      //         "name": "🔗"
      //       },
      //       "label": "View the post on the Blog",
      //       "style": 5,
      //       "type": 2,
      //       "url": item.link
      //     },
      //     {
      //       "disabled": null,
      //       "emoji": {
      //         "id": null,
      //         "name": "👍"
      //       },
      //       "label": "I like this post!",
      //       "style": 5,
      //       "type": 2,
      //       "url": "https://tori.dog/feedback/postid/like"
      //     },
      //     {
      //       "disabled": null,
      //       "emoji": {
      //         "id": null,
      //         "name": "❤️"
      //       },
      //       "label": "I love this post!",
      //       "style": 5,
      //       "type": 2,
      //       "url": "https://tori.dog/feedback/postid/love"
      //     }
      //   ],
      //   "type": 1
      // }
    ],
    "flags": 32768 // V2_COMPONENTS flag, tells Discord to use new components
  }
}