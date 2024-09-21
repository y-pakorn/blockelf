import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
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
      return {
        tokenData: response.data,
      }
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch protocol details from 1inch API")
    }
  },
}
