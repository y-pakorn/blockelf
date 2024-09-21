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
  systemPrompt: string,
  model: string = DEFAULT_MODEL,
  temperature?: number
) => {
  "use server"

  const stream = createStreamableValue()

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
      }
      //const paraphrasedQuery = await generateText({
      //model: isRedpill ? onchainRedpill(model) : openrouter(model),
      //system: `You are a helper of another blockchain on-chain analyser AI. You will receive user query and you need to paraphrase that query to be
      //a better human-readable query that is more specific and should give more context to the AI.
      //Here is the tools that you can utilize:
      //${Object.entries(tools)
      //.map(
      //([toolName, tool]) =>
      //`${toolName}: ${(tool as { description: string }).description}`
      //)
      //.join("\n")}
      //===========================================
      //Please only return the paraphrased query, no other text or markdown.
      //Also be specific on the chains because we support multiple chains.
      //For example, if user ask about portfolio, and don't specify the chain, you should ask user to specify the chain.
      //Most of the time you won't need to ask users for more information, but if you think you need more information, then ask for it.
      //YOU MUST NOT answer the user's query, you just paraphrase it to another AI.
      //Your answer will be pass along to another AI, so If you don't follow the instruction, it will cause the AI to behave in unintended way.
      //`,
      //messages: messages,
      //})
      //console.log("paraphrasedQuery", paraphrasedQuery.text)

      //messages.pop()

      //messages.push({
      //role: "user",
      //content: paraphrasedQuery.text,
      //})
      const { textStream } = await streamText({
        model: isRedpill ? onchainRedpill(model) : openrouter(model),
        system: systemPrompt,
        messages: messages,
        toolChoice: "required",
        tools,
        maxSteps: 1000,
        maxToolRoundtrips: 1000,
        temperature,
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
    error: null,
  }
}
