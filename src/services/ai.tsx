"use server"

import { getPortfolioDetails } from "@/tools/1inch/getPortfolioDetails"
import { getPortfolioValue } from "@/tools/1inch/getPortfolioValue"
import { getProtocolsByWallet } from "@/tools/1inch/getProtocolsByWallet"
import { getTokenAddress } from "@/tools/1inch/getTokenAddress"
import { getTokensByWallet } from "@/tools/1inch/getTokensByWallet"
import { getWalletHistory } from "@/tools/1inch/getWalletHistory"
import { getPrice } from "@/tools/chainlink/getPrice"
import { getProofOfReserve } from "@/tools/chainlink/getProofOfReserve"
import { ensNameTools } from "@/tools/ens/name"
import { ensSubgraphTools } from "@/tools/ens/subgraph"
import { getChainId } from "@/tools/getChainId"
import { getLatestBlock } from "@/tools/getLatestBlock"
import { nearAccountTools } from "@/tools/near/accounts"
import { timestampToReadable } from "@/tools/timestampToReadable"
import { Message } from "@/types"
// import { Message } from "@/types"
import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"

import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/config/model"
import { onchainRedpill, openrouter } from "@/lib/ai_utils"

type StreamResponse = TextStreamResponse | StatusStreamResponse
type StatusStreamResponse = {
  type: "status"
  status: "start" | "end"
  label?: string
}
type TextStreamResponse = {
  type: "text"
  delta: string
}

export const submitMessage = async (
  messages: Message[],
  systemPrompt: string,
  model: string = DEFAULT_MODEL,
  temperature?: number
) => {
  "use server"

  const stream = createStreamableValue<StreamResponse>()

  ;(async () => {
    try {
      const isRedpill =
        AVAILABLE_MODELS.find((m) => m.id === model)?.isRedpill || false

      const tools = {
        timestampToReadable,
        getLatestBlock,
        getWalletHistory,
        getChainId,
        getPortfolioValue,
        getProtocolsByWallet,
        getTokensByWallet,
        getProofOfReserve,
        getPortfolioDetails,
        getPrice,
        getTokenAddress,
        ...ensSubgraphTools,
        ...ensNameTools,
        ...nearAccountTools,
      }

      const { fullStream } = await streamText({
        model: isRedpill ? onchainRedpill(model) : openrouter(model),
        system: systemPrompt,
        messages: messages,
        toolChoice: "required",
        tools,
        maxSteps: 1000,
        maxToolRoundtrips: 1000,
        temperature,
      })

      for await (const detail of fullStream) {
        if (detail.type === "text-delta") {
          stream.update({
            delta: detail.textDelta,
            type: "text",
          })
        }
        if (detail.type === "tool-call") {
          stream.update({
            type: "status",
            status: "start",
            label: `Calling ${detail.toolName}`,
          })
        }
        if (detail.type === "step-finish") {
          stream.update({
            type: "status",
            status: "end",
          })
        }
      }
    } catch (e) {
      throw e
    } finally {
      stream.done()
    }
  })()

  return {
    messages,
    stream: stream.value,
    error: null,
  }
}
