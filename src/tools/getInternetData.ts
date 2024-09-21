import { generateText } from "ai"
import { z } from "zod"

import { openrouter } from "@/lib/ai_utils"

export const getInternetData = {
  description:
    "Fetch any data from the internet. Can use it whenever other tools are not helpful",
  parameters: z.object({
    query: z.string().describe("The query to search for"),
  }),
  execute: async ({ query }: { query: string }) => {
    const { text: response } = await generateText({
      model: openrouter("perplexity/llama-3.1-sonar-small-128k-online"),
      messages: [
        {
          role: "system",
          content: "Be precise and concise.",
        },
        {
          role: "user",
          content: query,
        },
      ],
    })

    return {
      data_from_internet: response,
    }
  },
}
