import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearNFTTools = {
  getTopNFTs: tool({
    description: "Get top NFTs by pagination",
    parameters: z.object({
      search: z.string().optional().describe("Search keyword"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
      order: z.enum(["desc", "asc"]).optional().default("desc").describe("Sort order"),
    }),
    execute: async (params: {
      search?: string;
      page?: number;
      perPage?: number;
      order?: "desc" | "asc";
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
      return response.data
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
    description: "Get NFT transactions by pagination",
    parameters: z.object({
      cursor: z.string().optional().describe("Next page cursor"),
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(25).describe("Items per page"),
    }),
    execute: async (params: {
      cursor?: string;
      page?: number;
      perPage?: number;
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
    description: "Get NFT info",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
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
      return response.data
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
      contract: string;
      cursor?: string;
      page?: number;
      perPage?: number;
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
      contract: string;
      page?: number;
      perPage?: number;
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
      contract: string;
      token?: string;
      page?: number;
      perPage?: number;
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
    execute: async ({ contract, token }: { contract: string; token?: string }) => {
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
    description: "Get NFT token info",
    parameters: z.object({
      contract: z.string().describe("Contract ID"),
      token: z.string().describe("Token ID"),
    }),
    execute: async ({ contract, token }: { contract: string; token: string }) => {
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
      contract: string;
      token: string;
      cursor?: string;
      page?: number;
      perPage?: number;
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
    execute: async ({ contract, token }: { contract: string; token: string }) => {
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