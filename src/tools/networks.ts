import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearNetworkTools = {
  getNearStats: tool({
    description: `Get NEAR and NEAR protocol stats
Return:
{
   "id": ...,
   "total_supply": ...,
   "circulating_supply": ...,
   "avg_block_time": ...,
   "gas_price": ...,
   "nodes_online": ...,
   "near_price": ...,
   "near_btc_price": ...,
   "market_cap": ...,
   "volume": ...,
   "high_24h": ...,
   "high_all": ...,
   "low_24h": ...,
   "low_all": ...,
   "change_24": ...,
   "total_txns": ...,
   "tps": ...
}
    `,

    parameters: z.object({}),
    execute: async () => {
      const url = `https://api.nearblocks.io/v1/stats`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getDailyTransactionCount: tool({
    description: "Get network number of transactions by day",
    parameters: z.object({
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Limit the number of days to return"),
    }),
    execute: async ({ limit }) => {
      const url = "https://api.pikespeak.ai/network/daily-tx-count"
      const config = {
        headers: {
          "x-api-key": env.PIKESPEAK_API_KEY,
          accept: "*/*",
        },
      }
      const response = await axios.get(url, config)
      return response.data.slice(-limit)
    },
  }),

  getTotalTransactions: tool({
    description: "Get network total number of transactions",
    parameters: z.object({}),
    execute: async () => {
      const url = "https://api.pikespeak.ai/network/total-tx"
      const config = {
        headers: {
          "x-api-key": env.PIKESPEAK_API_KEY,
          accept: "*/*",
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getLastWeekTotalTransactions: tool({
    description: "Get network total number of transactions for the last week",
    parameters: z.object({}),
    execute: async () => {
      const url = "https://api.pikespeak.ai/network/last-week-total-tx"
      const config = {
        headers: {
          "x-api-key": env.PIKESPEAK_API_KEY,
          accept: "*/*",
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getTotalAccounts: tool({
    description: "Get network total number of accounts",
    parameters: z.object({}),
    execute: async () => {
      const url = "https://api.pikespeak.ai/network/total-account"
      const config = {
        headers: {
          "x-api-key": env.PIKESPEAK_API_KEY,
          accept: "*/*",
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getActiveAccounts: tool({
    description: "Get account transactions by day/week/month",
    parameters: z.object({
      period: z
        .enum(["day", "week", "month"])
        .describe("Time period for active accounts"),
      limit: z
        .number()
        .int()
        .positive()
        .describe("Limit the number of days/weeks/months to return"),
    }),
    execute: async ({
      period,
      limit,
    }: {
      period: "day" | "week" | "month"
      limit: number
    }) => {
      const url = "https://api.pikespeak.ai/network/active-accounts"
      const config = {
        headers: {
          "x-api-key": env.PIKESPEAK_API_KEY,
          accept: "*/*",
        },
        params: { period },
      }
      const response = await axios.get(url, config)
      return response.data.slice(-limit)
    },
  }),
}
