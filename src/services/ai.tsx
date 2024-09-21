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
        system: `You are a blockchain on-chain analyser, return response to user's query as assistant role. 

          First, you must think about the user's query and plan step by step of how you will answer the query and what information you additionally need to answer the query.
          If the question is not clear, you need to ask user for more information.
          Look for the tools that you can use to answer the query first, and then plan how you will use those tools to answer the query.
          You can use the tools many times to get the information you need to answer the query.

          Use must markdown to format the response. 
          The data you gave out should be human readable and easy to understand in markdown format. 
          Display object in markdown's table format.

          Example 1:
          User: What is the price of ETH?
          You (Thinking): I need to use getPrice tool to get the price of ETH.
          You (Thinking): I will use getPrice tool with the token name ETH.
          You (Thinking): Then I will display the price in markdown format that fits the data the most.

          Example 2:
          User: What is going on with vitalik.eth lately?
          You (Thinking): I need to use getWalletHistory tool to get the wallet history of vitalik.eth.
          You (Thinking): The getWalletHistory tool requires the wallet address, so I need to use ensNameToAddress tool to get the wallet address of vitalik.eth.
          You (Thinking): Then I will display the wallet history in markdown format that fits the data the most.
        `,
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
