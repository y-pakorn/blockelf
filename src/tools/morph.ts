import { tool } from "ai"
import axios from "axios"
import _ from "lodash"
import { Address, createClient, getContract, http, parseAbi } from "viem"
import { morphHolesky } from "viem/chains"
import { z } from "zod"

import { convertBigIntToString } from "@/lib/utils"

const morphClient = createClient({
  chain: morphHolesky,
  transport: http(),
})

const querier = getContract({
  address: "0x6Bf3eA9b54E97197775aE180dD5280412CBb18cb",
  abi: parseAbi([
    "function getBlockNumber() public view returns (uint256)",
    "function getBlockTimestamp() public view returns (uint256)",
    "function getBalance(address account) public view returns (uint256)",
    "function getERC20Balance(address token, address account) public view returns (uint256)",
    "function getERC721Balance(address token, address account) public view returns (uint256)",
    "function getERC721Owner(address token, uint256 id) public view returns (address)",
    "function getERC1155Balance(address token, address account, uint256 id) public view returns (uint256)",
  ]),
  client: morphClient,
})

export const morphTools = {
  getMorphTokenBalance: tool({
    description: "Get token balance of a token in a walllet on morph chain.",
    parameters: z.object({
      address: z
        .string()
        .describe(
          "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
        ),
      tokenAddress: z
        .string()
        .describe(
          "Token address, e.g. '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'"
        ),
    }),
    execute: async ({ address, tokenAddress }) => {
      const balance = await querier.read.getERC20Balance([
        tokenAddress as Address,
        address as Address,
      ])
      return convertBigIntToString({
        balance,
      })
    },
  }),
  getMorphNFTBalance: tool({
    description: "Get NFT balance of a token in a walllet on morph chain.",
    parameters: z.object({
      address: z
        .string()
        .describe(
          "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
        ),
      tokenAddress: z
        .string()
        .describe(
          "Token address, e.g. '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'"
        ),
    }),
    execute: async ({ address, tokenAddress }) => {
      const balance = await querier.read.getERC721Balance([
        tokenAddress as Address,
        address as Address,
      ])
      return convertBigIntToString({
        balance,
      })
    },
  }),
  getMorphLatestBlockNumber: tool({
    description: "Get the latest block number on morph chain.",
    parameters: z.object({}),
    execute: async () => {
      const blockNumber = await querier.read.getBlockNumber()
      return convertBigIntToString({
        blockNumber,
      })
    },
  }),
  getMorphLatestBlockTimestamp: tool({
    description: "Get the latest block timestamp on morph chain.",
    parameters: z.object({}),
    execute: async () => {
      const blockTimestamp = await querier.read.getBlockTimestamp()
      return {
        blockTimestamp: Number(blockTimestamp),
        blockTimestampReadable: new Date(
          Number(blockTimestamp) * 1000
        ).toLocaleString(),
      }
    },
  }),
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
        `https://explorer-api-holesky.morphl2.io/api/v2/addresses/${address}/nft?type=ERC-721%2CERC-404%2CERC-1155`
      )
      const paginatedData = resp.data.items.slice(skip, skip + limit)
      return {
        nfts: paginatedData,
      }
    },
  }),
}
