"use server"

import { getPortfolioValue1Inch } from "@/tools/1inch/getPortfolioValue1Inch"
import { getProtocolDetailByAddress1Inch } from "@/tools/1inch/getProtocolDetailByAddress1Inch"
import { getTokenDetailByAddress1Inch } from "@/tools/1inch/getTokenDetailByAddress1Inch"
import { getWalletHistory1Inch } from "@/tools/1inch/getWalletHistory1Inch"
import { getAddressFromName } from "@/tools/getAddressFromName"
import { getChainId } from "@/tools/getChainId"
import { getLatestBlock } from "@/tools/getLatestBlock"
import { timestampToReadable } from "@/tools/timestampToReadable"
import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { generateText, streamText, tool } from "ai"
import { createStreamableValue, streamUI } from "ai/rsc"
import { z } from "zod"

import { env } from "@/env.mjs"
import { DEFAULT_MODEL } from "@/config/model"

export interface Message {
  role: "user" | "assistant"
  content: string
}

const openrouter = createGroq({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
})

export const submitMessage = async (
  messages: Message[],
  model: string = DEFAULT_MODEL
) => {
  "use server"

  const stream = createStreamableValue()

  ;(async () => {
    const { textStream, toolCalls, toolResults } = await streamText({
      //model: openrouter("google/gemini-pro-1.5-exp"),
      model: openrouter(model),
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
        getProtocolDetailByAddress1Inch,
        getTokenDetailByAddress1Inch,
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
