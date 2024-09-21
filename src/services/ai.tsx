"use server"

import { getHistoricalPrice } from "@/tools/1inch/getHistoricalPrice"
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
import { readableDateToTimestamp } from "@/tools/readableDateToTimestamp"
import { timestampToReadable } from "@/tools/timestampToReadable"
import { useAnalysisEngine } from "@/tools/useAnalysisEngine"
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
        // utils
        timestampToReadable,
        readableDateToTimestamp,
        getLatestBlock,
        getChainId,
        useAnalysisEngine,
        // 1inch
        getWalletHistory,
        getPortfolioValue,
        getProtocolsByWallet,
        getTokensByWallet,
        getPortfolioDetails,
        getHistoricalPrice,
        getTokenAddress,
        // chainLink
        getPrice,
        getProofOfReserve,
        // ens
        ...ensSubgraphTools,
        ...ensNameTools,
        // near
        ...nearAccountTools,
      }

      const { fullStream } = await streamText({
        model: isRedpill ? onchainRedpill(model) : openrouter(model),
        system: systemPrompt,
        // system: `
        // You are a blockchain on-chain analyser with many tools integrated,
        // return response to user's query as assistant role.
        // YOU MUST use markdown to format the response.
        // YOU MUST NEVER make up any information, you must only use the information provided by the tools.
        // Display object in markdown's table format.
        // If you came across any unix timestamp, you MUST convert it to human readable format using \`timestampToReadable\` tool.
        // The data you gave out should be human readable and easy to understand.
        // You should use as many tools as you need and can use same tool multiple times if needed.
        // For example, if user ask about current token price, you can use \`getPrice\` tool multiple times to get the price of multiple tokens.
        // If user ask about price in the past, you can use \`getHistoricalPrice\` tool to get the historical price of a token.
        // For some tools that requires token address, you can use \`getTokenAddress\` tool first to get the token address.

        // Example of how you should think step by step:
        // 1. User ask something
        // 2. You should see the tools and think which tools you can use to get the data you need
        // 3. If that tool requires input from other tools, you should use the other tools first to get the data you need
        // 4. After you get the data you need, you should use the tool to get the data
        // 5. Now that you have all the data, think about user's query and how to respond along with the data you got from the tools
        // 6. Return the response to user
        // `,
        _internal: {
          currentDate: () => {
            return new Date()
          },
        },
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
