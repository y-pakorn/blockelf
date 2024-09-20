"use server"

import { getAddressFromName } from "@/tools/getAddressFromName"
import { getChainId } from "@/tools/getChainId"
import { getLatestBlock } from "@/tools/getLatestBlock"
import { getPortfolioValue1Inch } from "@/tools/getPortfolioValue1Inch"
import { getWalletHistory1Inch } from "@/tools/getWalletHistory1Inch"
import { timestampToReadable } from "@/tools/timestampToReadable"
import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { generateText, streamText, tool } from "ai"
import { createStreamableValue, streamUI } from "ai/rsc"
import { z } from "zod"

import { env } from "@/env.mjs"

export interface Message {
  role: "user" | "assistant"
  content: string
}

const openrouter = createGroq({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
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
        timestampToReadable,
        getLatestBlock,
        getAddressFromName,
        getWalletHistory1Inch,
        getChainId,
        getPortfolioValue1Inch,
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
