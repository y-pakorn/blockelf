import { tool } from "ai"
import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"

export const nearBlockTools = {
  getBlocks: tool({
    description:
      "Get latest blocks by pagination, return list of block data, including block hash, block height, block timestamp, and number of transactions in the block. This method does not return the transactions in the block.",
    parameters: z.object({
      page: z.number().optional().default(1).describe("Page number"),
      perPage: z.number().optional().default(50).describe("Items per page"),
    }),
    execute: async ({ page, perPage }: { page?: number; perPage?: number }) => {
      const url = "https://api.nearblocks.io/v1/blocks"
      const config = {
        headers: {
          Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
          accept: "*/*",
        },
        params: {
          page,
          per_page: perPage,
        },
      }
      const response = await axios.get(url, config)
      return response.data
    },
  }),

  getBlockInfo: tool({
    description: "Get block info",
    parameters: z.object({
      hash: z.string().describe("Block hash, unique identifier of the block"),
    }),
    execute: async ({ hash }: { hash: string }) => {
      const url = `https://api.nearblocks.io/v1/blocks/${hash}`
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

  getEstimatedTotalBlocksCount: tool({
    description: "Get estimated total blocks count",
    parameters: z.object({}),
    execute: async ({ from, to }: { from?: string; to?: string }) => {
      const url = "https://api.nearblocks.io/v1/blocks/count"
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

  //getBlockChunks: tool({
  //description: "Get block chunks by pagination",
  //parameters: z.object({
  //hash: z.string().describe("Block hash"),
  //page: z.number().optional().default(1).describe("Page number"),
  //perPage: z.number().optional().default(50).describe("Items per page"),
  //}),
  //execute: async ({
  //hash,
  //page,
  //perPage,
  //}: {
  //hash: string
  //page?: number
  //perPage?: number
  //}) => {
  //const url = `https://api.nearblocks.io/v1/blocks/${hash}/chunks`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //page,
  //per_page: perPage,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),

  //getBlockTransactions: tool({
  //description: "Get block transactions by pagination",
  //parameters: z.object({
  //hash: z.string().describe("Block hash"),
  //page: z.number().optional().default(1).describe("Page number"),
  //perPage: z.number().optional().default(50).describe("Items per page"),
  //}),
  //execute: async ({
  //hash,
  //page,
  //perPage,
  //}: {
  //hash: string
  //page?: number
  //perPage?: number
  //}) => {
  //const url = `https://api.nearblocks.io/v1/blocks/${hash}/txns`
  //const config = {
  //headers: {
  //Authorization: `Bearer ${env.NEARBLOCKS_API_KEY}`,
  //accept: "*/*",
  //},
  //params: {
  //page,
  //per_page: perPage,
  //},
  //}
  //const response = await axios.get(url, config)
  //return response.data
  //},
  //}),
}
