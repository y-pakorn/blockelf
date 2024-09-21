"use server"

import { getPortfolioDetails } from "@/tools/1inch/getPortfolioDetails"
import { getPortfolioValue } from "@/tools/1inch/getPortfolioValue"
import { getProtocolsByWallet } from "@/tools/1inch/getProtocolsByWallet"
import { getTokensByWallet } from "@/tools/1inch/getTokensByWallet"
import { getWalletHistory } from "@/tools/1inch/getWalletHistory"
import { getProofOfReserve } from "@/tools/chainlink/getProofOfReserve"
import { ensNameTools } from "@/tools/ens/name"
import { ensSubgraphTools } from "@/tools/ens/subgraph"
import { getChainId } from "@/tools/getChainId"
import { getLatestBlock } from "@/tools/getLatestBlock"
import { timestampToReadable } from "@/tools/timestampToReadable"
// import { Message } from "@/types"
import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"

import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/config/model"
import { onchainRedpill, openrouter } from "@/lib/ai_utils"

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
      const isRedpill =
        AVAILABLE_MODELS.find((m) => m.id === model)?.isRedpill || false
      const { textStream } = await streamText({
        model: isRedpill ? onchainRedpill(model) : openrouter(model),
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
          getWalletHistory,
          getChainId,
          getPortfolioValue,
          getProtocolsByWallet,
          getTokensByWallet,
          getProofOfReserve,
          getPortfolioDetails,
          ...ensSubgraphTools,
          ...ensNameTools,
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
