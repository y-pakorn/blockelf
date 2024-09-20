"use server"

import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { generateText, streamText, tool } from "ai"
import { createStreamableValue, streamUI } from "ai/rsc"
import _ from "lodash"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { z } from "zod"

import { env } from "@/env.mjs"

export interface Message {
  role: "user" | "assistant"
  content: string
}

const convertBigIntToString = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString()
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString)
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertBigIntToString(value),
      ])
    )
  }

  return obj
}

const openrouter = createGroq({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
})

const ethereum = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-pokt.nodies.app"),
})

export const submitMessage = async (messages: Message[]) => {
  "use server"

  const stream = createStreamableValue()

  ;(async () => {
    const { textStream, toolCalls, toolResults } = await streamText({
      //model: openrouter("google/gemini-pro-1.5-exp"),
      model: openrouter("google/gemini-flash-1.5"),
      system:
        "You are a ethereum blockchain on-chain analyser, return response to user's query as assistant role. Use must markdown to format the response. Display object in markdown's table format.",
      messages,
      toolChoice: "required",
      tools: {
        timestampToReadable: {
          description: "Convert timestamp to readable date",
          parameters: z.object({
            timestamp: z
              .number()
              .describe("The timestamp in seconds since epoch"),
          }),
          execute: async ({ timestamp }) => {
            return new Date(timestamp * 1000).toUTCString()
          },
        },
        getLatestBlock: {
          description: "Get the latest block from the blockchain",
          parameters: z.object({
            blockNumber: z
              .number()
              .optional()
              .describe(
                "The block number, e.g. 123456, if not provided, will get the latest block"
              ),
          }),
          execute: async ({ blockNumber }) => {
            const now = _.now()
            const block = await ethereum.getBlock({
              blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
            })
            console.log("getBlock took", _.now() - now, "ms")
            return convertBigIntToString(block)
          },
        },
        getAddressFromName: {
          description: "Get the address from the name",
          parameters: z.object({
            name: z.string().describe("The ens name, e.g. 'vitalik.eth'"),
          }),
          execute: async ({ name }) => {
            const now = _.now()
            const address = await ethereum.getEnsAddress({
              name,
            })
            console.log("getEnsAddress took", _.now() - now, "ms")
            return address
          },
        },
      },
      maxSteps: 1000,
      maxToolRoundtrips: 1000,
    })

    for await (const text of textStream) {
      stream.update(text)
    }

    stream.done()
  })()

  return {
    messages,
    newMessage: stream.value,
  }
}
