import { z } from "zod"

const SUPPORTED_CHAINS = {
  Arbitrum: { chainId: 42161, iconName: "arbitrum" },
  Aurora: { chainId: 1313161554, iconName: "aurora" },
  Avalanche: { chainId: 43114, iconName: "avalanche" },
  Base: { chainId: 8453, iconName: "base" },
  Binance: { chainId: 56, iconName: "binance" },
  ZkSync: { chainId: 324, iconName: "zksync-era" },
  Ethereum: { chainId: 1, iconName: "ethereum" },
  Fantom: { chainId: 250, iconName: "fantom" },
  Gnosis: { chainId: 100, iconName: "gnosis" },
  Klaytn: { chainId: 8217, iconName: "klaytn" },
  Optimism: { chainId: 10, iconName: "optimism" },
  Polygon: { chainId: 137, iconName: "polygon" },
}

export const getChainId = {
  description:
    "Get the chain ID from the chain name. Supported Chain name are Arbitrum, Aurora, Avalanche, Base, Binance, ZkSync, Ethereum, Fantom, Gnosis, Klaytn, Optimism, Polygon",
  parameters: z.object({
    chainName: z
      .string()
      .describe("Chain name or informal name, e.g. 'Ethereum'"),
  }),
  execute: async ({ chainName }: { chainName: string }) => {
    const start = Date.now() // Start timing
    const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS]
    if (!chain) {
      throw new Error(`Chain name '${chainName}' not supported`)
    }
    const end = Date.now() // End timing
    console.log(`getChainId took ${end - start} ms`) // Log the time taken

    return {
      chain_id: chain.chainId,
      chain_name: chainName,
    }
  },
}
