import { z } from "zod"

export const timestampToReadable = {
  description: "Convert timestamp to readable date text",
  parameters: z.object({
    timestamp: z.number().describe("The timestamp in seconds since epoch"),
  }),
  execute: async ({ timestamp }: { timestamp: number }) => {
    return new Date(timestamp * 1000).toUTCString()
  },
}
