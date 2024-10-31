import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearSearchTools = {
  search: tool({
    description:
      "Search txn by hash, block by height / hash, account by id, receipt by id, tokens by hex address",
    parameters: z.object({
      keyword: z
        .string()
        .describe(
          "txn hash / block height / account id / receipt id / hex address"
        ),
    }),
    execute: async ({ keyword }: { keyword: string }) => {
      const url = "https://api.nearblocks.io/v1/search"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { keyword },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  searchTransactions: tool({
    description: "Search transactions by hash",
    parameters: z.object({
      keyword: z.string().describe("Transaction hash"),
    }),
    execute: async ({ keyword }: { keyword: string }) => {
      const url = "https://api.nearblocks.io/v1/search/txns"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { keyword },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  searchBlocks: tool({
    description: "Search blocks by hash / height",
    parameters: z.object({
      keyword: z
        .union([z.string(), z.number()])
        .describe("Block height / hash"),
    }),
    execute: async ({ keyword }: { keyword: string | number }) => {
      const url = "https://api.nearblocks.io/v1/search/blocks"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { keyword },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  searchAccounts: tool({
    description: "Search accounts by id",
    parameters: z.object({
      keyword: z.string().describe("Account ID"),
    }),
    execute: async ({ keyword }: { keyword: string }) => {
      const url = "https://api.nearblocks.io/v1/search/accounts"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { keyword },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  searchReceipts: tool({
    description: "Search receipts by id",
    parameters: z.object({
      keyword: z.string().describe("Receipt ID"),
    }),
    execute: async ({ keyword }: { keyword: string }) => {
      const url = "https://api.nearblocks.io/v1/search/receipts"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { keyword },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  searchTokens: tool({
    description: "Search tokens by hex address",
    parameters: z.object({
      keyword: z.string().describe("Token hex address"),
    }),
    execute: async ({ keyword }: { keyword: string }) => {
      const url = "https://api.nearblocks.io/v1/search/tokens"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { keyword },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),
}

