import { tool } from "ai"
import { z } from "zod"

export const timestampToReadable = tool({
  description:
    "Convert unix timestamp in a certain time period to readable date text",
  parameters: z.object({
    timestamp: z
      .number()
      .describe(
        "The timestamp either in seconds or milliseconds, ex. 1620000000 or 1620000000000"
      ),
    isMs: z
      .boolean()
      .default(false)
      .describe(
        "Whether the timestamp is in milliseconds, default is false (seconds)"
      ),
  }),
  execute: async ({ timestamp, isMs }) => {
    console.log("timestampToReadable", timestamp, isMs)
    return new Date(timestamp * (isMs ? 1 : 1000)).toLocaleString()
  },
})
