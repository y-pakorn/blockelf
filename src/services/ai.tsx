"use server"

import { getPortfolioDetails } from "@/tools/1inch/getPortfolioDetails"
import { getPortfolioValue } from "@/tools/1inch/getPortfolioValue"
import { getProtocolsByWallet } from "@/tools/1inch/getProtocolsByWallet"
import { getTokensByWallet } from "@/tools/1inch/getTokensByWallet"
import { getWalletHistory } from "@/tools/1inch/getWalletHistory"
import { getProofOfReserve } from "@/tools/chainlink/getProofOfReserve"
import { getAddressFromName } from "@/tools/ens/getAddressFromName"
import { ensSubgraphTools } from "@/tools/ens/subgraph"
import { getChainId } from "@/tools/getChainId"
import { getLatestBlock } from "@/tools/getLatestBlock"
import { timestampToReadable } from "@/tools/timestampToReadable"
// import { Message } from "@/types"
import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"

import { env } from "@/env.mjs"
import { DEFAULT_MODEL } from "@/config/model"
import { onchainRedpill, openrouter, redpill } from "@/lib/ai_utils"

export interface Message {
  role: "user" | "assistant"
  content: string
}

export const submitMessage = async (
  messages: Message[],
  model: string = DEFAULT_MODEL
) => {
  "use server"

  const stream = createStreamableValue()

  ;(async () => {
    try {
      const { textStream } = await streamText({
        //model: openrouter("google/gemini-pro-1.5-exp"),
        model: openrouter(model),
        system: `You are a ethereum blockchain on-chain analyser, 
          return response to user's query as assistant role. 
          Use must markdown to format the response. 
          Display object in markdown's table format.
          If you came across any unix timestamp, you MUST convert it to human readable format using \`timestampToReadable\` tool.
        `,
        messages,
        toolChoice: "required",
        tools: {
          timestampToReadable,
          getLatestBlock,
          getAddressFromName,
          getWalletHistory,
          getChainId,
          getPortfolioValue,
          getProtocolsByWallet,
          getTokensByWallet,
          getProofOfReserve,
          getPortfolioDetails,
          ...ensSubgraphTools,
        },
        maxSteps: 1000,
        maxToolRoundtrips: 1000,
      })

      for await (const text of textStream) {
        stream.update(text)
      }
    } catch (e) {
      throw e
    } finally {
      stream.done()
    }
  })()

  return {
    messages,
    newMessage: stream.value,
  }
}
