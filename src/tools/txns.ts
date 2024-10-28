import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearTxnTools = {
  getTxnsByPagination: tool({
    description:
      "Get latest transactions by pagination and filter, return list of full transaction data",
    parameters: z.object({
      block: z
        .string()
        .optional()
        .describe(
          "Block hash. If you want to get transaction in a specific block, you can specify the block hash in `block` parameter."
        ),
      from: z
        .string()
        .optional()
        .describe("Sender account ID, e.g. `alice.near`"),
      to: z
        .string()
        .optional()
        .describe("Receiver account ID, e.g. `bob.near`"),
      action: z
        .string()
        .optional()
        .describe(
          "Action kind: 'ADD_KEY' | 'CREATE_ACCOUNT' | 'DELETE_ACCOUNT' | 'DELETE_KEY' | 'DEPLOY_CONTRACT' | 'FUNCTION_CALL' | 'STAKE' | 'TRANSFER' | 'DELEGATE_ACTION'"
        ),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z
        .number()
        .max(25)
        .optional()
        .default(25)
        .describe("Items per page, default 25, max 100"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .default("desc")
        .describe("Sort order, must be 'desc' or 'asc'"),
    }),
    execute: async ({ afterDate, beforeDate, perPage, ...params }) => {
      const url = "https://api.nearblocks.io/v1/txns"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          after_date: afterDate,
          before_date: beforeDate,
          per_page: perPage,
          ...params,
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
