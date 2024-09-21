import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
import { logSchema } from "@/lib/utils"

export const nearAccountTools = {
  getAccountInfo: tool({
    description: "Get the account information from the NEAR blockchain",
    parameters: z.object({
      accountId: z
        .string()
        .describe("The NEAR account ID, e.g. 'example.near'"),
    }),
    execute: async ({ accountId }: { accountId: string }) => {
      const start = Date.now() // Start timing

      const url = `https://api.nearblocks.io/v1/account/${accountId}`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
      }

      try {
        const response = await axios.get(url, config)
        const end = Date.now() // End timing
        console.log(`getAccountInfo took ${end - start} ms`)
        const result = {
          accountInfo: {
            account: response.data.account.map((account: any) => ({
              amount: account.amount / 1e24,
              locked: account.locked / 1e24,
              code_hash: account.code_hash,
              storage_usage: account.storage_usage,
              storage_paid_at: account.storage_paid_at,
              block_height: account.block_height,
              block_hash: account.block_hash,
              account_id: account.account_id,
              created: {
                transaction_hash: account.created.transaction_hash,
                block_timestamp: account.created.block_timestamp,
                date: new Date(
                  account.created.block_timestamp / 1e6
                ).toLocaleString(),
              },
              deleted: {
                transaction_hash: account.deleted.transaction_hash,
                block_timestamp: account.deleted.block_timestamp,
                date: account.deleted.block_timestamp
                  ? new Date(
                      account.deleted.block_timestamp / 1e6
                    ).toLocaleString()
                  : null,
              },
            })),
          },
        }
        return result
      } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch account information from NEAR API")
      }
    },
  }),
  getInteractedContracts: tool({
    description:
      "Get the interacted contracts for an account from the NEAR blockchain",
    parameters: z.object({
      accountId: z
        .string()
        .describe("The NEAR account ID, e.g. 'example.near'"),
    }),
    execute: async ({ accountId }: { accountId: string }) => {
      const start = Date.now() // Start timing

      const url = `https://api.nearblocks.io/v1/account/${accountId}/contract`
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.NEAR_API_KEY}`,
          accept: "*/*",
        },
      }

      try {
        const response = await axios.get(url, config)
        const end = Date.now() // End timing
        console.log(`getInteractedContracts took ${end - start} ms`)
        return {
          contracts: response.data.contract,
        }
      } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch interacted contracts from NEAR API")
      }
    },
  }),
  getTransactionHistory: tool({
    description: "Get the transaction history from the NEAR blockchain",
    parameters: z.object({
      accountId: z
        .string()
        .describe("The NEAR account ID, e.g. 'example.near'"),
      page: z
        .number()
        .optional()
        .describe("Page number for pagination default is 1"),
      perPage: z
        .number()
        .optional()
        .describe("Number of items per page default is 10"),
      order: z
        .string()
        .optional()
        .describe(
          "Order of transactions, e.g. 'desc', 'asc' default is 'desc'"
        ),
    }),
    execute: async ({
      accountId,
      page = 1,
      perPage = 10,
      order = "desc",
    }: {
      accountId: string
      page?: number
      perPage?: number
      order?: string
    }) => {
      const start = Date.now() // Start timing

      const url = `https://api.nearblocks.io/v1/account/${accountId}/txns`
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.NEAR_API_KEY}`,
          accept: "*/*",
        },
        params: {
          page,
          per_page: perPage,
          order,
        },
      }

      try {
        const response = await axios.get(url, config)
        const end = Date.now() // End timing
        console.log(`getTransactionHistory took ${end - start} ms`)
        return {
          transactions: response.data.txns.map((txn: any) => ({
            id: txn.id,
            receipt_id: txn.receipt_id,
            predecessor_account_id: txn.predecessor_account_id,
            receiver_account_id: txn.receiver_account_id,
            receipt_kind: txn.receipt_kind,
            receipt_block: {
              block_hash: txn.receipt_block.block_hash,
              block_height: txn.receipt_block.block_height,
              block_timestamp: txn.receipt_block.block_timestamp,
              readable_block_timestamp: new Date(
                txn.receipt_block.block_timestamp / 1e6
              ).toLocaleString(),
            },
            receipt_outcome: txn.receipt_outcome,
            transaction_hash: txn.transaction_hash,
            included_in_block_hash: txn.included_in_block_hash,
            block_timestamp: txn.block_timestamp,
            readable_block_timestamp: new Date(
              txn.block_timestamp / 1e6
            ).toLocaleString(),
            block: txn.block,
            receipt_conversion_tokens_burnt:
              txn.receipt_conversion_tokens_burnt,
            actions: txn.actions,
            actions_agg: txn.actions_agg,
            outcomes: txn.outcomes,
            outcomes_agg: txn.outcomes_agg,
            transaction_fee: txn.transaction_fee,
          })),
        }
      } catch (error) {
        console.error(error)
        throw new Error("Failed to fetch transaction history from NEAR API")
      }
    },
  }),
  getBalanceChangeActivities: tool({
    description:
      "Get the account balance change activities from the NEAR blockchain",
    parameters: z.object({
      accountId: z
        .string()
        .describe("The NEAR account ID, e.g. 'example.near'"),
      perPage: z.number().optional().describe("Number of items per page"),
    }),
    execute: async ({
      accountId,
      perPage = 25,
    }: {
      accountId: string
      perPage?: number
    }) => {
      const start = Date.now() // Start timing

      const url = `https://api.nearblocks.io/v1/account/${accountId}/activities`
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.NEAR_API_KEY}`,
          accept: "*/*",
        },
        params: {
          per_page: perPage,
        },
      }

      try {
        const response = await axios.get(url, config)
        const end = Date.now() // End timing
        console.log(`getBalanceChangeActivities took ${end - start} ms`)
        return {
          activities: response.data.activities,
        }
      } catch (error) {
        console.error(error)
        throw new Error(
          "Failed to fetch balance change activities from NEAR API"
        )
      }
    },
  }),
}
