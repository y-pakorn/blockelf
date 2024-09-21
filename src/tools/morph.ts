import { tool } from "ai"
import axios from "axios"
import _ from "lodash"
import { z } from "zod"

export const morphTools = {
  getMorphStats: tool({
    description:
      "Get morph chain overall stats. Including but not limited to: gas fees, block time, total addresses, total blocks, etc.",
    parameters: z.object({}),
    execute: async () => {
      const resp = await axios.get(
        "https://explorer-api-holesky.morphl2.io/api/v2/stats"
      )
      return resp.data
    },
  }),
  getMorphAccountTransactions: tool({
    description: "Get morph account's transactions.",
    parameters: z.object({
      address: z
        .string()
        .describe(
          "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
        ),
      limit: z
        .number()
        .lte(20)
        .optional()
        .default(10)
        .describe("Number of transactions to return. Default is 10, max 20."),
      skip: z
        .number()
        .optional()
        .default(0)
        .describe("Number of transactions to skip."),
    }),
    execute: async ({ address, limit, skip }) => {
      const resp =
        await axios.get(`https://explorer-api-holesky.morphl2.io/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from
`)
      const paginatedData = resp.data.items
        .slice(skip, skip + limit)
        .map((item: any) => _.omit(item, ["raw_input"]))
      return {
        transactions: paginatedData,
      }
    },
  }),
  getMorphAccountTokens: tool({
    description: "Get morph account's tokens.",
    parameters: z.object({
      address: z
        .string()
        .describe(
          "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
        ),
      limit: z
        .number()
        .lte(20)
        .optional()
        .default(10)
        .describe("Number of transactions to return. Default is 10, max 20."),
      skip: z
        .number()
        .optional()
        .default(0)
        .describe("Number of transactions to skip."),
    }),
    execute: async ({ address, skip, limit }) => {
      const resp = await axios.get(
        `https://explorer-api-holesky.morphl2.io/api/v2/addresses/${address}/tokens?type=ERC-20%2CERC-721%2CERC-1155`
      )
      const paginatedData = resp.data.items.slice(skip, skip + limit)
      return {
        tokens: paginatedData,
      }
    },
  }),
  getMorphAccountNFTs: tool({
    description: "Get morph account's NFTs",
    parameters: z.object({
      address: z
        .string()
        .describe(
          "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
        ),
      limit: z
        .number()
        .lte(20)
        .optional()
        .default(10)
        .describe("Number of transactions to return. Default is 10, max 20."),
      skip: z
        .number()
        .optional()
        .default(0)
        .describe("Number of transactions to skip."),
    }),
    execute: async ({ address, skip, limit }) => {
      const resp = await axios.get(
        `https://explorer-api-holesky.morphl2.io/api/v2/addresses/0x77B46A19e1bDE4AB5B31268472dDdF01E8a8cd60/nft?type=ERC-721%2CERC-404%2CERC-1155`
      )
      const paginatedData = resp.data.items.slice(skip, skip + limit)
      return {
        nfts: paginatedData,
      }
    },
  }),
}
