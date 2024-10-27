import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearDEXTools = {
  getTopDEXPairs: tool({
    description: "Get top DEX pairs by pagination",
    parameters: z.object({
      search: z.string().optional().describe("Search keyword"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
      sort: z.enum(["volume", "txns", "makers"]).optional().default("volume").describe("Sort field"),
      order: z.enum(["desc", "asc"]).optional().default("desc").describe("Sort order"),
    }),
    execute: async (params: {
      search?: string;
      page?: number;
      perPage?: number;
      sort?: "volume" | "txns" | "makers";
      order?: "desc" | "asc";
    }) => {
      const url = "https://api.nearblocks.io/v1/dex"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          ...params,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getTopDEXPairsCount: tool({
    description: "Get top DEX pairs count",
    parameters: z.object({
      search: z.string().optional().describe("Search keyword"),
    }),
    execute: async ({ search }: { search?: string }) => {
      const url = "https://api.nearblocks.io/v1/dex/count"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { search },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getDEXPairInfo: tool({
    description: "Get DEX pair info",
    parameters: z.object({
      pair: z.number().describe("Pair ID"),
    }),
    execute: async ({ pair }: { pair: number }) => {
      const url = `https://api.nearblocks.io/v1/dex/pairs/${pair}`
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

  getDEXPairTransactions: tool({
    description: "Get DEX pair transactions by pagination",
    parameters: z.object({
      pair: z.number().describe("Pair ID"),
      account: z.string().optional().describe("Maker account ID"),
      cursor: z.string().optional().describe("Next page cursor"),
      perPage: z.number().optional().default(25).describe("Items per page"),
    }),
    execute: async (params: {
      pair: number;
      account?: string;
      cursor?: string;
      perPage?: number;
    }) => {
      const url = `https://api.nearblocks.io/v1/dex/pairs/${params.pair}/txns`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          a: params.account,
          cursor: params.cursor,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getDEXPairTransactionsCount: tool({
    description: "Get DEX pair transactions count",
    parameters: z.object({
      pair: z.number().describe("Pair ID"),
      account: z.string().optional().describe("Maker account ID"),
    }),
    execute: async ({ pair, account }: { pair: number; account?: string }) => {
      const url = `https://api.nearblocks.io/v1/dex/pairs/${pair}/txns/count`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { a: account },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getDEXPairChartData: tool({
    description: "Get DEX pair chart data",
    parameters: z.object({
      pair: z.number().describe("Pair ID"),
      interval: z.enum(["1m", "1h", "1d"]).default("1m").describe("Time interval"),
      to: z.number().describe("End timestamp"),
      limit: z.number().describe("Number of rows"),
    }),
    execute: async (params: {
      pair: number;
      interval: "1m" | "1h" | "1d";
      to: number;
      limit: number;
    }) => {
      const url = `https://api.nearblocks.io/v1/dex/pairs/${params.pair}/charts`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          interval: params.interval,
          to: params.to,
          limit: params.limit,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),
}