import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearFTTools = {
  getTopTokensCount: tool({
    description: "Get top tokens count",
    parameters: z.object({
      search: z.string().optional().describe("Search keyword"),
    }),
    execute: async ({ search }: { search?: string }) => {
      const url = "https://api.nearblocks.io/v1/fts/count"
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

  getTokenTransactions: tool({
    description: "Get token transactions by pagination",
    parameters: z.object({
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async ({
      cursor,
      page,
      perPage,
    }: {
      cursor?: string
      page?: number
      perPage?: number
    }) => {
      const url = "https://api.nearblocks.io/v1/fts/txns"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          cursor,
          page,
          per_page: perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedTokenTransactionsCount: tool({
    description: "Get estimated token transactions count",
    parameters: z.object({}),
    execute: async () => {
      const url = "https://api.nearblocks.io/v1/fts/txns/count"
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

  getTokenInfo: tool({
    description: "Get token info",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
    }),
    execute: async ({ contract }: { contract: string }) => {
      const url = `https://api.nearblocks.io/v1/fts/${contract}`
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

  getTokenContractTransactions: tool({
    description: "Get token contract transactions by pagination",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      account: z.string().optional().describe("Affected account ID"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async ({
      contract,
      account,
      cursor,
      page,
      perPage,
    }: {
      contract: string
      account?: string
      cursor?: string
      page?: number
      perPage?: number
    }) => {
      const url = `https://api.nearblocks.io/v1/fts/${contract}/txns`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          account,
          cursor,
          page,
          per_page: perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedTokenContractTransactionsCount: tool({
    description: "Get estimated token contract transactions count",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      account: z.string().optional().describe("Affected account ID"),
    }),
    execute: async ({
      contract,
      account,
    }: {
      contract: string
      account?: string
    }) => {
      const url = `https://api.nearblocks.io/v1/fts/${contract}/txns/count`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { account },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getTokenHolders: tool({
    description: "Get token holders by pagination",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async ({
      contract,
      page,
      perPage,
    }: {
      contract: string
      page?: number
      perPage?: number
    }) => {
      const url = `https://api.nearblocks.io/v1/fts/${contract}/holders`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          page,
          per_page: perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedTokenHoldersCount: tool({
    description: "Get estimated token holders count",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
    }),
    execute: async ({ contract }: { contract: string }) => {
      const url = `https://api.nearblocks.io/v1/fts/${contract}/holders/count`
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
}

