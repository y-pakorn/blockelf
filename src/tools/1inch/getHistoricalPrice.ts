import { generateText } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
import { onchainRedpill } from "@/lib/ai_utils"

import { getTokenAddress } from "./getTokenAddress"

export const getHistoricalPrice = {
  description: `Get historical price data in USDT for any token and date by specifying period.`,
  parameters: z.object({
    token0: z
      .string()
      .describe(
        "Text to search for in base token address, token symbol, or description Example: 1inch"
      ),
    period: z
      .string()
      .describe("Period. Supported periods: 24H, 1W, 1M, 1Y, AllTime"),
    chainId: z.number().describe("Chain ID, e.g. 1 for Ethereum mainnet"),
  }),
  execute: async ({
    token0,
    token1,
    period,
    chainId = 1,
  }: {
    token0: string
    token1: string
    period: string
    chainId: number
  }) => {
    const start = Date.now() // Start timing

    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
    }

    try {
      const { tokenAddress: token0Address } = await getTokenAddress.execute({
        query: token0,
        chainId,
      })

      const token1Address = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

      const url = `https://api.1inch.dev/charts/v1.0/chart/line/${token0Address}/${token1Address}/${period}/${chainId}`

      const response = await axios.get(url, config)
      const end = Date.now() // End timing
      console.log(`getHistoricalPrice took ${end - start} ms`) // Log the time taken
      console.log(response.data)
      return {
        historicalPriceData: response.data.data.map((item: any) => ({
          timestamp: item.time,
          date: new Date(item.time * 1000).toLocaleString(),
          price: item.value,
        })),
      }
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch historical price data from 1inch API")
    }
  },
}
