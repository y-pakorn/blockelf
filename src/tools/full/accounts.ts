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

  getContractInfo: tool({
    description: "Get contract info for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      rpc: z.string().optional().describe("RPC URL to use"),
    }),
    execute: async ({ account, rpc }: { account: string; rpc?: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/contract`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { rpc },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getContractDeployments: tool({
    description: "Get contract deployment records (first & last) for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
    }),
    execute: async ({ account }: { account: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/contract/deployments`
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

  getParsedContractInfo: tool({
    description: "Get parsed contract info for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      rpc: z.string().optional().describe("RPC URL to use"),
    }),
    execute: async ({ account, rpc }: { account: string; rpc?: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/contract/parse`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { rpc },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getLatestActionArgs: tool({
    description: "Get latest action args for a contract method",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      method: z.string().describe("The contract method"),
    }),
    execute: async ({ account, method }: { account: string; method: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/contract/${method}`
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

  getAccountInventory: tool({
    description: "Get account FT/NFT token inventory",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
    }),
    execute: async ({ account }: { account: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/inventory`
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

  getPossibleTokenContracts: tool({
    description: "Get possible FT/NFT token contracts for an account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
    }),
    execute: async ({ account }: { account: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/tokens`
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

  getAccessKeys: tool({
    description: "Get access keys for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, page, perPage, order }: { account: string; page?: number; perPage?: number; order?: "desc" | "asc" }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/keys`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { page, per_page: perPage, order },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedAccessKeysCount: tool({
    description: "Get estimated access keys count for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
    }),
    execute: async ({ account }: { account: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/keys/count`
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

  getAccountTransactions: tool({
    description: "Get account transactions by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/txns`
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

  getEstimatedAccountTransactionsCount: tool({
    description: "Get estimated account transactions count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/txns/count`
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

  getAccountTransactionsWithoutReceipts: tool({
    description: "Get account transactions without receipts by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/txns-only`
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

  getEstimatedAccountTransactionsWithoutReceiptsCount: tool({
    description: "Get estimated account transactions without receipts count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/txns-only/count`
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

  getAccountReceipts: tool({
    description: "Get account receipts by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/receipts`
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

  getEstimatedAccountReceiptsCount: tool({
    description: "Get estimated account receipts count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/receipts/count`
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

  getAccountTokenTransactions: tool({
    description: "Get account token transactions by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      involved: z.string().optional().describe("Involved account ID"),
      contract: z.string().optional().describe("Contract account ID"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/ft-txns`
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

  getEstimatedAccountTokenTransactionsCount: tool({
    description: "Get estimated account token transactions count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      involved: z.string().optional().describe("Involved account ID"),
      contract: z.string().optional().describe("Contract account ID"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/ft-txns/count`
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

  getAccountNFTTransactions: tool({
    description: "Get account NFT transactions by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      involved: z.string().optional().describe("Involved account ID"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/nft-txns`
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

  getEstimatedAccountNFTTransactionsCount: tool({
    description: "Get estimated account NFT transactions count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      involved: z.string().optional().describe("Involved account ID"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/nft-txns/count`
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

  getAccountStakeTransactions: tool({
    description: "Get account stake transactions by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().describe("Sort order"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/stake-txns`
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

  getEstimatedAccountStakeTransactionsCount: tool({
    description: "Get estimated account stake transactions count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      from: z.string().optional().describe("Sender account ID"),
      to: z.string().optional().describe("Receiver account ID"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/stake-txns/count`
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

  getAccountBalanceChangeActivities: tool({
    description: "Get account balance change activities by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
      cursor: z.string().optional().describe("Next page cursor"),
      perPage: z.number().optional().describe("Items per page"),
    }),
    execute: async ({ account, ...params }: { account: string; [key: string]: any }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/activities`
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

  getEstimatedAccountBalanceChangeActivitiesCount: tool({
    description: "Get estimated account balance change activities count",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID"),
    }),
    execute: async ({ account }: { account: string }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}/activities/count`
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
}
