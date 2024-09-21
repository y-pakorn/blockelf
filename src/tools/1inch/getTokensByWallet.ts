import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
import { convertBigIntToString, logSchema } from "@/lib/utils"

export const getTokensByWallet = {
  description:
    "Get portfolio token details by address. Supported Chain names are Ethereum, BNB Chain, Polygon, Arbitrum, Gnosis, Optimism, Base",
  parameters: z.object({
    addresses: z
      .array(z.string())
      .describe(
        "Array of wallet addresses, e.g. ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']"
      ),
    chainId: z.number().describe("Chain ID, e.g. '1' for Ethereum mainnet"),
    timerange: z.string().optional().describe("Timerange, e.g. '1year'"),
    closed: z
      .boolean()
      .optional()
      .describe("Include closed positions, default is true"),
    closedThreshold: z
      .number()
      .optional()
      .describe("Threshold for closed positions, default is 1"),
    useCache: z
      .boolean()
      .optional()
      .describe("Get response from cache, default is false"),
  }),
  execute: async ({
    addresses,
    chainId,
    timerange = "1year",
    closed = true,
    closedThreshold = 1,
    useCache = false,
  }: {
    addresses: string[]
    chainId: number
    timerange?: string
    closed?: boolean
    closedThreshold?: number
    useCache?: boolean
  }) => {
    const start = Date.now() // Start timing

    const url = `https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/details`

    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
      params: {
        addresses: addresses.join(","),
        chain_id: chainId,
        timerange,
        closed,
        closed_threshold: closedThreshold,
        use_cache: useCache,
      },
      paramsSerializer: {
        indexes: null,
      },
    }

    try {
      const response = await axios.get(url, config)
      const end = Date.now() // End timing
      console.log(`getTokensByWallet took ${end - start} ms`) // Log the time taken
      logSchema(response.data)
      return convertBigIntToString(response.data.result)
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch token details from 1inch API")
    }
  },
}
