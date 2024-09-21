import { generateText } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
import { onchainRedpill } from "@/lib/ai_utils"
import { convertBigIntToString, logSchema } from "@/lib/utils"

export const getTokenAddress = {
  description:
    "Get the token on-chain details including address, decimals. Supported Chain names are Ethereum, BNB Chain, Polygon, Arbitrum, Gnosis, Optimism, Base",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Text to search for in token address, token symbol, or description Example: 1inch"
      ),
    chainId: z.number().describe("Chain ID, e.g. '1' for Ethereum mainnet"),
  }),
  execute: async ({ query, chainId }: { query: string; chainId: number }) => {
    const start = Date.now() // Start timing

    const url = `https://api.1inch.dev/token/v1.2/${chainId}/search`
    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
      params: {
        query,
        chain_id: chainId,
      },
      paramsSerializer: {
        indexes: null,
      },
    }

    try {
      const response = await axios.get(url, config)

      const end = Date.now() // End timing
      console.log(`getTokenAddress took ${end - start} ms`) // Log the time taken
      console.log(response.data)

      const { text: tokenAddress } = await generateText({
        // model: openrouter("gpt-3.5-turbo"),
        // model: redpill("gpt-3.5-turbo"),
        model: onchainRedpill("gpt-3.5-turbo"),
        // model: openrouter("google/gemini-flash-1.5"),
        prompt: `From the list of coin info, Only return ONE coin contract address
        Don't return anything else, just the address.
        Don't return many addresses, just one.
        =========== Context ==========
        ${JSON.stringify({
          tokenData: response.data,
        })}
        ==============================
        Example 1:
        =========== Input ============
        Coin to search: BTC
        =========== Output ============
        address: 0xdeb288F737066589598e9214E782fa5A8eD689e8
        =========== Input ============
        Coin to search: ${query}
        =========== Output ============
        address: 
        `,
      })
      return {
        tokenAddress,
      }
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch protocol details from 1inch API")
    }
  },
}
