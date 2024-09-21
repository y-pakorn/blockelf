import { tool } from "ai"
import { z } from "zod"

export const readableDateToTimestamp = tool({
  description: "Convert readable date text to unix timestamp",
  parameters: z.object({
    date: z
      .string()
      .describe("The readable date text, ex. '2023-10-01T00:00:00Z'"),
  }),
  execute: async ({ date }) => {
    console.log("readableDateToTimestamp", date)
    return new Date(date).getTime()
  },
})
