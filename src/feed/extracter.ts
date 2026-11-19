export const extractQuote = async (env: Env, text: string) => {
  const response = await env.AI.run('@cf/cloudflare/clairic', {
    model: 'clairic',
    state: text,
    fields: {
      quote: { type: 'text', instructions: 'Highlight the most attractive fragment from a marketing perspective. Highlighted quote must be at minimum 5 words that are the most impactful from the whole content.' },
    }
  }) as { answers: { quote: { value: string } } }

  return response.answers.quote.value
}