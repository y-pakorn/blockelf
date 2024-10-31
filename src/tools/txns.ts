import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearTxnTools = {
  getTxnsByPagination: tool({
    description: `Get latest transactions by pagination and filter, return list of full transaction data with actions, and function call arguments.
Return:
{
   "id": ...,
   "transaction_hash": ...,
   "included_in_block_hash": ...,
   "block_timestamp": ...,
   "signer_account_id": ...,
   "receiver_account_id": ...,
   "block": {
     "block_height": ...
   },
   "actions": {
       "action": ...,
       "method": ...,
       "args": ... 
    }[],
   "actions_agg": {
     "deposit": ...
   },
   "outcomes": {
     "status": ...
   },
   "outcomes_agg": {
     "transaction_fee": ...
   }
}[]

Return Transaction Data Definition:

There might be multiple actions in a transaction

If and only if actions.action is "FUNCTION_CALL", actions.method exists and is the function name.

If actions.action is "FUNCTION_CALL", method is the function name.

If actions.action is "TRANSFER", actions_agg.deposit is the amount, receiver_account_id is the receiver, signer_account_id is the sender for the NEAR token transfer.

If actions.action is "FUNCTION_CALL", and actions.method is "ft_transfer", then actions.args.receiver_id is the receiver, actions.args.amount is the amount, receiver_account_id is the token contract account ID, signer_account_id is the sender for the fungible token transfer.
`,
    parameters: z.object({
      block: z
        .string()
        .optional()
        .describe(
          "Block hash. Use if you want to get transaction in a specific block."
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

  //getTxnInfoWithReceiptsAndOutcomes: tool({
  //description: "Get transaction info with receipts and execution outcomes",
  //parameters: z.object({
  //hash: z.string().describe("Transaction hash"),
  //}),
  //execute: async ({ hash }: { hash: string }) => {
  //const url = `https://api.nearblocks.io/v1/txns/${hash}/full`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),
}
