import { generateObject, generateText, tool } from "ai"
import { z } from "zod"

import { openrouter } from "@/lib/ai_utils"

export const internetTools = {
  searchInternet: tool({
    description:
      "Search the internet by query, similar to Google search but will return direct result data. Used for text-based search. Normally used for searching updates, news, or general information.",
    parameters: z.object({
      query: z.string().describe("Search query, be precise and clear."),
    }),
    execute: async ({ query }) => {
      const { text } = await generateText({
        model: openrouter("perplexity/llama-3.1-sonar-small-128k-online"),
        prompt: `
Find the information about ${query} on the internet.

Return the information as a form of data object.

Do not engage in any assistant-like conversation.
        `,
      })

      return {
        answer: text,
      }
    },
  }),
}
