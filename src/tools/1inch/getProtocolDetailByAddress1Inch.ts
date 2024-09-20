import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const getProtocolDetailByAddress1Inch = {
  description:
    "Get protocol details by address.  Supported Chain names are Ethereum, BNB Chain, Polygon, Arbitrum, Gnosis, Optimism, Base",
  parameters: z.object({
    addresses: z
      .array(z.string())
      .describe(
        "Array of wallet addresses, e.g. ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']"
      ),
    chainId: z.number().describe("Chain ID, e.g. '1' for Ethereum mainnet"),
    closed: z
      .boolean()
      .optional()
      .describe("Include closed positions, default is true"),
    closedThreshold: z
      .number()
      .optional()
      .describe("Threshold for closed positions, default is 1"),
  }),
  execute: async ({
    addresses,
    chainId,
    closed = true,
    closedThreshold = 1,
  }: {
    addresses: string[]
    chainId: number
    closed?: boolean
    closedThreshold?: number
  }) => {
    const start = Date.now() // Start timing

    const url = `https://api.1inch.dev/portfolio/portfolio/v4/overview/protocols/details`

    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
      params: {
        addresses: addresses.join(","),
        chain_id: chainId,
        closed,
        closed_threshold: closedThreshold,
      },
      paramsSerializer: {
        indexes: null,
      },
    }

    try {
      const response = await axios.get(url, config)
      const end = Date.now() // End timing
      console.log(`getProtocolDetailByAddress1Inch took ${end - start} ms`) // Log the time taken
      return response.data
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch protocol details from 1inch API")
    }
  },
}
