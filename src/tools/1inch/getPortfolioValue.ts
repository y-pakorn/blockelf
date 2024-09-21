import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
import { convertBigIntToString, logSchema } from "@/lib/utils"

// const SUPPORTED_CHAINS = {
//   Ethereum: { chainId: 1, iconName: "ethereum" },
//   "BNB Chain": { chainId: 56, iconName: "bsc" },
//   Polygon: { chainId: 137, iconName: "polygon" },
//   Arbitrum: { chainId: 42161, iconName: "arbitrum" },
//   Gnosis: { chainId: 100, iconName: "gnosis" },
//   Optimism: { chainId: 10, iconName: "optimism" },
//   Base: { chainId: 8453, iconName: "base" },
// }

export const getPortfolioValue = {
  description:
    "Get just only the current value of the portfolio, grouped by chains and addresses. Supported Chain names are Ethereum, BNB Chain, Polygon, Arbitrum, Gnosis, Optimism, Base",
  parameters: z.object({
    addresses: z
      .array(z.string())
      .describe(
        "Array of wallet addresses, e.g. ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']"
      ),
    chainId: z.number().describe("Chain ID, e.g. '1' for Ethereum mainnet"),
  }),
  execute: async ({
    addresses,
    chainId,
  }: {
    addresses: string[]
    chainId?: number
  }) => {
    const start = Date.now() // Start timing

    const url = `https://api.1inch.dev/portfolio/portfolio/v4/general/current_value`

    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
      params: {
        addresses: addresses.join(","),
        chain_id: chainId,
      },
      paramsSerializer: {
        indexes: null,
      },
    }

    try {
      const response = await axios.get(url, config)
      const end = Date.now() // End timing
      console.log(`getPortfolioValue took ${end - start} ms`) // Log the time taken
      // logSchema(response.data)
      return {
        portfolioValue: convertBigIntToString(response.data.result),
      }
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch portfolio value from 1inch API")
    }
  },
}
