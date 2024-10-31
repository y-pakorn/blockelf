import { possibleDataUrlToBlobUrl } from "@/services/blob"
import { tool } from "ai"
import axios from "axios"
import { BigNumber } from "bignumber.js"
import _ from "lodash"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearNFTTools = {
  getNFTPrice: tool({
    description: "Get NFT collection floor price, average price, and volume",
    parameters: z.object({
      contract: z.string().describe("Contract ID, e.g. 'mintbase.near'"),
    }),
    execute: async ({ contract }) => {
      if (contract.includes("mintbase")) {
        const mintbasePrice = await axios.post(
          "https://graph.mintbase.xyz/",
          {
            query:
              '\nquery v2_omnisite_getCombinedStoredData($id: String! ,$limit: Int, $offset: Int)  @cached(ttl: 120) {\n    \n    nft_contracts(where: {id: {_eq: $id}}) {\n      name\n      created_at\n      owner_id\n      is_mintbase\n    }\n\n    \n  mb_store_minters(limit: $limit, offset: $offset, where: {nft_contract_id: {_eq: $id}}) {\n      nft_contract_id\n      minter_id\n      nft_contracts {\n        owner_id\n      }\n  }\n\n    \n    uniqueThings: nft_tokens_aggregate( where: {nft_contracts: {id: {_eq: $id}}}) {\n      aggregate {\n        count\n      }\n    }\n\n    \n      uniqueOwners: nft_tokens_aggregate(distinct_on: owner, where: {nft_contracts: {id: {_eq: $id}}}) {\n        aggregate {\n          count\n        }\n      }\n    \n    \n    floorPrice: nft_listings(order_by: [{price: asc}, {created_at: desc}], where: {unlisted_at: {_is_null: true}, invalidated_at: {_is_null: true}, accepted_at: {_is_null: true}, nft_contract_id: {_eq: $id}}, limit: 10) {\n      price\n      created_at\n      nft_contract_id\n      currency\n    }\n\n    \n    averagePrice: nft_offers_aggregate(where:{ nft_contracts: { id: {_eq: $id}}, currency: {_eq: "near"}}) {\n      aggregate {\n        avg {\n          offer_price\n        }\n      }\n    }\n\n    \n  mb_store_minters_aggregate(where: {nft_contract_id: {_eq: $id}}) {\n    aggregate {\n      count\n    }\n  }\n\n    \nstoreEarned: nft_earnings_aggregate(where: {nft_contract_id: {_eq: $id}, _and: {approval_id: {_is_null: false}}, currency: {_eq: "near"}}) {\n  aggregate {\n    sum {\n      amount\n    }\n  }\n}\n\n  }\n',
            variables: {
              id: "yuplandshop.mintbase1.near",
            },
          },
          {
            headers: {
              "mb-api-key": "anon",
              "Content-Type": "application/json",
            },
          }
        )

        return {
          averagePrice: new BigNumber(
            mintbasePrice.data.data.averagePrice.aggregate.avg.offer_price ||
              "0"
          )
            .shiftedBy(-24)
            .toNumber(),
          floorPrice: new BigNumber(
            mintbasePrice.data.data.floorPrice[0]?.price || "0"
          )
            .shiftedBy(-24)
            .toNumber(),
          volume: new BigNumber(
            mintbasePrice.data.data.storeEarned.aggregate.sum.amount || "0"
          )
            .shiftedBy(-24)
            .toNumber(),
        }
      }
      const parasPrice = await axios.get(
        `https://api-v2-mainnet.paras.id/collections?collection_id=${contract}`
      )
      const result = parasPrice.data.results?.[0]

      return {
        averagePrice: new BigNumber(result?.avg_price || 0)
          .shiftedBy(-24)
          .toNumber(),
        floorPrice: new BigNumber(result?.floor_price || 0)
          .shiftedBy(-24)
          .toNumber(),
        volume: new BigNumber(result?.volume || 0).shiftedBy(-24).toNumber(),
        averagePriceUSD: new BigNumber(result?.avg_price_usd || 0).toNumber(),
        floorPriceUSD: new BigNumber(result?.floor_price_usd || 0).toNumber(),
        volumeUSD: new BigNumber(result?.volume_usd || 0).toNumber(),
      }
    },
  }),
  getTopNFTs: tool({
    description: `Get top NFTs by pagination
Return:
{
   "contract": ..., // Contract ID, e.g. "mintbase.near"
   "name": ...,
   "symbol": ...,
   "icon": ...,
   "base_uri": ...,
   "reference": ...,
   "tokens": ...,
   "holders": ...,
   "transfers_day": ... // Number of transfers in the last 24 hours
}[]
`,
    parameters: z.object({
      search: z.string().optional().describe("Search keyword"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
      order: z
        .enum(["desc", "asc"])
        .optional()
        .default("desc")
        .describe("Sort order, must be 'desc' or 'asc'"),
    }),
    execute: async (params: {
      search?: string
      page?: number
      perPage?: number
      order?: "desc" | "asc"
    }) => {
      const url = "https://api.nearblocks.io/v1/nfts"
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
      const blobed = await Promise.all(
        response.data.tokens.map(async (token: any) => ({
          ...token,
          icon: possibleDataUrlToBlobUrl(token.icon),
        }))
      )

      return {
        tokens: blobed,
      }
    },
  }),

  getTopNFTsCount: tool({
    description: "Get top NFTs count",
    parameters: z.object({
      search: z.string().optional().describe("Search keyword"),
    }),
    execute: async ({ search }: { search?: string }) => {
      const url = "https://api.nearblocks.io/v1/nfts/count"
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

  getNFTTransactions: tool({
    description:
      "Get NFT transactions by pagination, return specifically latest NFT transactions",
    parameters: z.object({
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(25).describe("Items per page"),
    }),
    execute: async (params: {
      cursor?: string
      page?: number
      perPage?: number
    }) => {
      const url = "https://api.nearblocks.io/v1/nfts/txns"
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

  getEstimatedNFTTransactionsCount: tool({
    description: "Get estimated NFT transactions count",
    parameters: z.object({}),
    execute: async () => {
      const url = "https://api.nearblocks.io/v1/nfts/txns/count"
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

  getNFTInfo: tool({
    description: `Get NFT info for a specific nft contract
Return:
{
   "contract": ..., // Contract ID, e.g. "mintbase.near"
   "name": ...,
   "symbol": ...,
   "icon": ...,
   "base_uri": ...,
   "reference": ...,
   "tokens": ...,
   "holders": ...,
   "transfers_day": ... // Number of transfers in the last 24 hours
}`,
    parameters: z.object({
      contract: z.string().describe("Contract ID, 'mintbase.near' for example"),
    }),
    execute: async ({ contract }: { contract: string }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${contract}`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
      }
      const response = await axios.get(url, config)
      const nft = response.data?.contracts?.[0]
      return nft
        ? {
            ...nft,
            icon: possibleDataUrlToBlobUrl(nft.icon),
          }
        : {
            message: "NFT not found",
          }
    },
  }),

  getNFTContractTransactions: tool({
    description: "Get NFT contract transactions by pagination",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async (params: {
      contract: string
      cursor?: string
      page?: number
      perPage?: number
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${params.contract}/txns`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          cursor: params.cursor,
          page: params.page,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedNFTContractTransactionsCount: tool({
    description: "Get estimated NFT contract transactions count",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
    }),
    execute: async ({ contract }: { contract: string }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${contract}/txns/count`
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

  getNFTHolders: tool({
    description: "Get NFT holders by pagination",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async (params: {
      contract: string
      page?: number
      perPage?: number
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${params.contract}/holders`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          page: params.page,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedNFTHoldersCount: tool({
    description: "Get estimated NFT holders count",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
    }),
    execute: async ({ contract }: { contract: string }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${contract}/holders/count`
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

  getNFTTokens: tool({
    description: "Get NFT tokens list by pagination",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      token: z.string().optional().describe("Token ID"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async (params: {
      contract: string
      token?: string
      page?: number
      perPage?: number
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${params.contract}/tokens`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          token: params.token,
          page: params.page,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedNFTTokensCount: tool({
    description: "Get estimated NFT tokens count",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      token: z.string().optional().describe("Token ID"),
    }),
    execute: async ({
      contract,
      token,
    }: {
      contract: string
      token?: string
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${contract}/tokens/count`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: { token },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getNFTTokenInfo: tool({
    description: "Get NFT token info for a specific token",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      token: z.string().describe("Token ID"),
    }),
    execute: async ({
      contract,
      token,
    }: {
      contract: string
      token: string
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${contract}/tokens/${token}`
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

  getNFTTokenTransactions: tool({
    description: "Get NFT token transactions by pagination",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      token: z.string().describe("Token ID"),
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async (params: {
      contract: string
      token: string
      cursor?: string
      page?: number
      perPage?: number
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${params.contract}/tokens/${params.token}/txns`
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          cursor: params.cursor,
          page: params.page,
          per_page: params.perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getEstimatedNFTTokenTransactionsCount: tool({
    description: "Get estimated NFT token transactions count",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      token: z.string().describe("Token ID"),
    }),
    execute: async ({
      contract,
      token,
    }: {
      contract: string
      token: string
    }) => {
      const url = `https://api.nearblocks.io/v1/nfts/${contract}/tokens/${token}/txns/count`
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
