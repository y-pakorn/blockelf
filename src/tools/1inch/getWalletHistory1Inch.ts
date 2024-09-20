import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const getWalletHistory1Inch = {
  description:
    "Get the transaction history from the wallet, and return important readable formatted data",
  parameters: z.object({
    address: z
      .string()
      .describe(
        "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
      ),
    chainId: z.string().describe("Chain ID, e.g. '1' for Ethereum mainnet"),
    limit: z.number().optional().describe("Amount of events to return"),
    tokenAddress: z.string().optional().describe("Token address used at event"),
    toTimestampMs: z.string().optional().describe("To time at milliseconds"),
    fromTimestampMs: z
      .string()
      .optional()
      .describe("From time at milliseconds"),
  }),
  execute: async ({
    address,
    chainId,
    limit,
    tokenAddress,
    toTimestampMs,
    fromTimestampMs,
  }: {
    address: string
    chainId: string
    limit?: number
    tokenAddress?: string
    toTimestampMs?: string
    fromTimestampMs?: string
  }) => {
    const start = Date.now() // Start timing

    const url = `https://api.1inch.dev/history/v2.0/history/${address}/events`

    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
      params: {
        chainId,
        limit: limit ?? 10,
        tokenAddress,
        toTimestampMs,
        fromTimestampMs,
      },
      paramsSerializer: {
        indexes: null,
      },
    }

    try {
      const response = await axios.get(url, config)
      const end = Date.now() // End timing
      console.log(`getWalletHistory1Inch took ${end - start} ms`) // Log the time taken
      return response.data
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch wallet history from 1inch API")
    }
  },
}
