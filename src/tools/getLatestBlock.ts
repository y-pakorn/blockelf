import _ from "lodash"
import { createPublicClient, http } from "viem"
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
  optimism,
  polygon,
  zksync,
} from "viem/chains"
import { z } from "zod"

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
}

export const getLatestBlock = {
  description:
    "Get the latest block from the blockchain. Default chain is Ethereum. Supported Chain name are Arbitrum, Aurora, Avalanche, Base, Binance, ZkSync, Ethereum, Fantom, Gnosis, Klaytn, Optimism, Polygon",
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

    return convertBigIntToString(block)
  },
}
