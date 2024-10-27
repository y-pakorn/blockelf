import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearTxnTools = {
  getTxnsByPagination: tool({
    description: "Get transactions by pagination",
    parameters: z.object({
      block: z.string().optional().describe("Block hash"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .default("desc")
        .describe("Sort order, must be 'desc' or 'asc'"),
    }),
    execute: async (params: {
      block?: string
      from?: string
      to?: string
      action?: string
      method?: string
      afterDate?: string
      beforeDate?: string
      cursor?: string
      page?: number
      perPage?: number
      order?: "desc" | "asc"
    }) => {
      const url = "https://api.nearblocks.io/v1/txns"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          ...params,
          after_date: params.afterDate,
          before_date: params.beforeDate,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedTotalTxnsCount: tool({
    description: "Get estimated total transactions count",
    parameters: z.object({
      block: z.string().optional().describe("Block hash"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async (params: {
      block?: string
      from?: string
      to?: string
      action?: string
      method?: string
      afterDate?: string
      beforeDate?: string
    }) => {
      const url = "https://api.nearblocks.io/v1/txns/count"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          ...params,
          after_date: params.afterDate,
          before_date: params.beforeDate,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getLatestTxns: tool({
    description: "Get the latest transactions",
    parameters: z.object({
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Number of transactions to return"),
    }),
    execute: async ({ limit }: { limit?: number }) => {
      const url = "https://api.nearblocks.io/v1/txns/latest"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { limit },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getTxnInfo: tool({
    description: "Get transaction info",
    parameters: z.object({
      hash: z.string().describe("Transaction hash"),
    }),
    execute: async ({ hash }: { hash: string }) => {
      const url = `https://api.nearblocks.io/v1/txns/${hash}`
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

  getTxnInfoWithReceiptsAndOutcomes: tool({
    description: "Get transaction info with receipts and execution outcomes",
    parameters: z.object({
      hash: z.string().describe("Transaction hash"),
    }),
    execute: async ({ hash }: { hash: string }) => {
      const url = `https://api.nearblocks.io/v1/txns/${hash}/full`
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

