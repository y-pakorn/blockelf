import { tool } from "ai"
import _ from "lodash"
import { Address, createPublicClient, Hex, http } from "viem"
import {
  arbitrum,
  aurora,
  avalanche,
  base,
  bsc,
  fantom,
  gnosis,
  klaytn,
  mainnet,
  morphHolesky,
  optimism,
  polygon,
  zksync,
} from "viem/chains"
import { z } from "zod"

import dayjs from "@/lib/dayjs"
import { convertBigIntToString } from "@/lib/utils"

const chainConfigs = {
  Arbitrum: arbitrum,
  Aurora: aurora,
  Avalanche: avalanche,
  Base: base,
  Binance: bsc,
  ZkSync: zksync,
  Ethereum: mainnet,
  Fantom: fantom,
  Gnosis: gnosis,
  Klaytn: klaytn,
  Optimism: optimism,
  Polygon: polygon,
  Morph: morphHolesky,
}

export const rpcTools = {
  getBlock: tool({
    description:
      "Get the block or latest from the blockchain. Default chain is Ethereum. Supported Chain name are Arbitrum, Aurora, Avalanche, Base, Binance, ZkSync, Ethereum, Fantom, Gnosis, Klaytn, Optimism, Polygon, Morph",
    parameters: z.object({
      chainName: z.string().describe("The chain name, e.g. 'Ethereum'"),
      blockNumber: z
        .number()
        .optional()
        .describe(
          "The block number, e.g. 123456, if not provided, will get the latest block"
        ),
    }),
    execute: async ({
      chainName,
      blockNumber,
    }: {
      chainName: string
      blockNumber?: number
    }) => {
      const chainConfig = chainConfigs[chainName as keyof typeof chainConfigs]
      if (!chainConfig) {
        throw new Error(`Chain name '${chainName}' not supported`)
      }

      const client = createPublicClient({
        chain: chainConfig,
        transport: http(chainConfig.rpcUrls.default.http[0]),
      })

      const start = Date.now() // Start timing
      const block = await client.getBlock({
        blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
      })
      const end = Date.now() // End timing
      console.log(`getLatestBlock took ${end - start} ms`) // Log the time taken

      return convertBigIntToString({
        ...block,
        timestampReadable: new Date(
          Number(block.timestamp) * 1000
        ).toLocaleString(),
        timestampRelative: dayjs(Number(block.timestamp) * 1000).fromNow(),
        withdrawlCount: block.withdrawals?.length,
        transactionCount: block.transactions?.length,
        transactions: undefined,
        withdrawals: undefined,
      })
    },
  }),
  getBalance: tool({
    description: "Get the balance of an address",
    parameters: z.object({
      chainName: z.string().describe("The chain name, e.g. 'Ethereum'"),
      address: z.string().describe("The address to query"),
    }),
    execute: async ({
      chainName,
      address,
    }: {
      chainName: string
      address: string
    }) => {
      const chainConfig = chainConfigs[chainName as keyof typeof chainConfigs]
      if (!chainConfig) {
        throw new Error(`Chain name '${chainName}' not supported`)
      }

      const client = createPublicClient({
        chain: chainConfig,
        transport: http(chainConfig.rpcUrls.default.http[0]),
      })

      const start = Date.now() // Start timing
      const balance = await client.getBalance({ address: address as Address })
      const end = Date.now() // End timing
      console.log(`getBalance took ${end - start} ms`) // Log the time taken

      return convertBigIntToString({
        balance,
      })
    },
  }),
  getTransaction: tool({
    description: "Get the transaction by hash",
    parameters: z.object({
      chainName: z.string().describe("The chain name, e.g. 'Ethereum'"),
      hash: z.string().describe("The transaction hash"),
    }),
    execute: async ({
      chainName,
      hash,
    }: {
      chainName: string
      hash: string
    }) => {
      const chainConfig = chainConfigs[chainName as keyof typeof chainConfigs]
      if (!chainConfig) {
        throw new Error(`Chain name '${chainName}' not supported`)
      }

      const client = createPublicClient({
        chain: chainConfig,
        transport: http(chainConfig.rpcUrls.default.http[0]),
      })

      const start = Date.now() // Start timing
      const transaction = await client.getTransaction({ hash: hash as Hex })
      const end = Date.now() // End timing
      console.log(`getTransaction took ${end - start} ms`) // Log the time taken

      return convertBigIntToString(transaction)
    },
  }),
}
