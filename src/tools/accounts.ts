import { tool } from "ai"
import axios from "axios"
import _ from "lodash"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearAccountTools = {
  getAccountPortfolioWealth: tool({
    description:
      "Get account portfolio wealth, Return token balance with value in USD + defi holding for Ref-finance and Burrow",
    parameters: z.object({
      accountId: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
    }),
    execute: async ({ accountId }) => {
      const url = `https://api.pikespeak.ai/account/wealth/${accountId}`
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

  getAccountInfo: tool({
    description: `Get the account information from the NEAR blockchain
Return:
{
  amount, // The amount of NEAR token in the account
  block_hashm // created block hash
  block_height, // created block height
  code_hash, // code hash of the account
  locked, // locked amount of the account
  storage_paid_at, // storage paid at
  storage_usage, // storage usage of the account
  account_id, // account ID, e.g. 'alice.near'
  created: {
    transaction_hash, // account creation transaction hash
    block_timestamp, // account creation block timestamp
  },
  deleted: {
    transaction_hash, // account deletion transaction hash
    block_timestamp, // account deletion block timestamp
  }
}[]
    `,
    parameters: z.object({
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
    }),
    execute: async ({ account }) => {
      const url = `https://api.nearblocks.io/v1/account/${account}`
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

  getContractInfo: tool({
    description: "Get contract info for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
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
      return {
        contract: response.data.contract.map((c: any) => ({
          ...c,
          code_base64: "Omitted, too long.",
        })),
      }
    },
  }),

  getContractDeployments: tool({
    description:
      "Get contract deployment records (first & last) for a NEAR account",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),

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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),

      method: z.string().describe("The contract method"),
    }),
    execute: async ({
      account,
      method,
    }: {
      account: string
      method: string
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),

      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .describe("Sort order, must be 'desc' or 'asc"),
    }),
    execute: async ({
      account,
      page,
      perPage,
      order,
    }: {
      account: string
      page?: number
      perPage?: number
      order?: "desc" | "asc"
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      from: z
        .string()
        .optional()
        .describe("Sender account ID, e.g. 'bob.near'"),
      to: z
        .string()
        .optional()
        .describe("Receiver account ID, e.g. 'charlie.near'"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .describe("Sort order, must be 'desc' or 'asc"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      from: z
        .string()
        .optional()
        .describe("Sender account ID, e.g. 'bob.near'"),
      to: z
        .string()
        .optional()
        .describe("Receiver account ID, e.g. 'charlie.near'"),
      action: z.string().optional().describe("Action kind"),
      method: z.string().optional().describe("Function call method"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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

  //getAccountTransactionsWithoutReceipts: tool({
  //description: "Get account transactions without receipts by pagination",
  //parameters: z.object({
  //account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
  //from: z
  //.string()
  //.optional()
  //.describe("Sender account ID, e.g. 'bob.near'"),
  //to: z
  //.string()
  //.optional()
  //.describe("Receiver account ID, e.g. 'charlie.near'"),
  //afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //cursor: z.string().optional().describe("Next page cursor"),
  //perPage: z.number().optional().describe("Items per page"),
  //order: z
  //.enum(["desc", "asc"])
  //.optional()
  //.describe("Sort order, must be 'desc' or 'asc"),
  //}),
  //execute: async ({
  //account,
  //...params
  //}: {
  //account: string
  //[key: string]: any
  //}) => {
  //const url = `https://api.nearblocks.io/v1/account/${account}/txns-only`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //...params,
  //after_date: params.afterDate,
  //before_date: params.beforeDate,
  //per_page: params.perPage,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),

  //getEstimatedAccountTransactionsWithoutReceiptsCount: tool({
  //description: "Get estimated account transactions without receipts count",
  //parameters: z.object({
  //account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
  //from: z
  //.string()
  //.optional()
  //.describe("Sender account ID, e.g. 'bob.near'"),
  //to: z
  //.string()
  //.optional()
  //.describe("Receiver account ID, e.g. 'charlie.near'"),
  //afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //}),
  //execute: async ({
  //account,
  //...params
  //}: {
  //account: string
  //[key: string]: any
  //}) => {
  //const url = `https://api.nearblocks.io/v1/account/${account}/txns-only/count`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //...params,
  //after_date: params.afterDate,
  //before_date: params.beforeDate,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),

  //getAccountReceipts: tool({
  //description: "Get account receipts by pagination",
  //parameters: z.object({
  //account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
  //from: z
  //.string()
  //.optional()
  //.describe("Sender account ID, e.g. 'bob.near'"),
  //to: z
  //.string()
  //.optional()
  //.describe("Receiver account ID, e.g. 'charlie.near'"),
  //action: z.string().optional().describe("Action kind"),
  //method: z.string().optional().describe("Function call method"),
  //afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //cursor: z.string().optional().describe("Next page cursor"),
  //perPage: z.number().optional().describe("Items per page"),
  //order: z
  //.enum(["desc", "asc"])
  //.optional()
  //.describe("Sort order, must be 'desc' or 'asc"),
  //}),
  //execute: async ({
  //account,
  //...params
  //}: {
  //account: string
  //[key: string]: any
  //}) => {
  //const url = `https://api.nearblocks.io/v1/account/${account}/receipts`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //...params,
  //after_date: params.afterDate,
  //before_date: params.beforeDate,
  //per_page: params.perPage,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),

  //getEstimatedAccountReceiptsCount: tool({
  //description: "Get estimated account receipts count",
  //parameters: z.object({
  //account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
  //from: z
  //.string()
  //.optional()
  //.describe("Sender account ID, e.g. 'bob.near'"),
  //to: z
  //.string()
  //.optional()
  //.describe("Receiver account ID, e.g. 'charlie.near'"),
  //action: z.string().optional().describe("Action kind"),
  //method: z.string().optional().describe("Function call method"),
  //afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
  //}),
  //execute: async ({
  //account,
  //...params
  //}: {
  //account: string
  //[key: string]: any
  //}) => {
  //const url = `https://api.nearblocks.io/v1/account/${account}/receipts/count`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //...params,
  //after_date: params.afterDate,
  //before_date: params.beforeDate,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),

  getAccountTokenTransactions: tool({
    description: "Get account token transactions by pagination",
    parameters: z.object({
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      involved: z
        .string()
        .optional()
        .describe("Involved account ID, e.g. 'v2.ref-finance.near'"),
      contract: z
        .string()
        .optional()
        .describe("Contract account ID, e.g. 'wrap.near'"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .describe("Sort order, must be 'desc' or 'asc"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      involved: z
        .string()
        .optional()
        .describe("Involved account ID, e.g. 'v2.ref-finance.near'"),
      contract: z
        .string()
        .optional()
        .describe("Contract account ID, e.g. 'wrap.near'"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      involved: z
        .string()
        .optional()
        .describe("Involved account ID, e.g. 'v2.ref-finance.near'"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .describe("Sort order, must be 'desc' or 'asc"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      involved: z
        .string()
        .optional()
        .describe("Involved account ID, e.g. 'v2.ref-finance.near'"),
      event: z.string().optional().describe("Event kind"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      from: z
        .string()
        .optional()
        .describe("Sender account ID, e.g. 'bob.near'"),
      to: z
        .string()
        .optional()
        .describe("Receiver account ID, e.g. 'charlie.near'"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().describe("Page number"),
      perPage: z.number().optional().describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .describe("Sort order, must be 'desc' or 'asc"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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
      account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
      from: z
        .string()
        .optional()
        .describe("Sender account ID, e.g. 'bob.near'"),
      to: z
        .string()
        .optional()
        .describe("Receiver account ID, e.g. 'charlie.near'"),
      afterDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
      beforeDate: z.string().optional().describe("Date in YYYY-MM-DD format"),
    }),
    execute: async ({
      account,
      ...params
    }: {
      account: string
      [key: string]: any
    }) => {
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

  //getAccountBalanceChangeActivities: tool({
  //description: "Get account balance change activities by pagination",
  //parameters: z.object({
  //account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
  //cursor: z.string().optional().describe("Next page cursor"),
  //perPage: z.number().optional().describe("Items per page"),
  //}),
  //execute: async ({
  //account,
  //...params
  //}: {
  //account: string
  //[key: string]: any
  //}) => {
  //const url = `https://api.nearblocks.io/v1/account/${account}/activities`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //...params,
  //per_page: params.perPage,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),

  //getEstimatedAccountBalanceChangeActivitiesCount: tool({
  //description: "Get estimated account balance change activities count",
  //parameters: z.object({
  //account: z.string().describe("The NEAR account ID, e.g. 'alice.near'"),
  //}),
  //execute: async ({ account }: { account: string }) => {
  //const url = `https://api.nearblocks.io/v1/account/${account}/activities/count`
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
