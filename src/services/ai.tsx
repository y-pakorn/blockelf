"use server"

import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"
import _ from "lodash"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

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
        "You are a ethereum blockchain on-chain analyser, return response to user's query as assistant role. Use markdown to format the response. Prioritize displaying JSON object in table format.",
      messages,
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
