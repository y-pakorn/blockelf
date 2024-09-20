import { createPublicClient, http, parseAbi } from "viem"
import { mainnet } from "viem/chains"
import { z } from "zod"

import { convertBigIntToString } from "@/lib/utils"

type ChainlinkFeeds = {
  [chain: string]: {
    [reserveType: string]: string
  }
}

// Placeholder for Chainlink feed contract addresses
const chainlinkFeeds: ChainlinkFeeds = {
  Ethereum: {
    ARKB: "0x80f8D7b4fB192De43Ed6aE0DD4A42A60f43641b0",
  },
}

export const getLatestAnswer = {
  description:
    "Get price/proof of reserve data from contract address received from getProofOfReserveAddress tool",
  parameters: z.object({
    address: z.string().describe("The address of the contract"),
  }),
  execute: async ({
    chainName,
    reserveType,
  }: {
    chainName: string
    reserveType: string
  }) => {
    const start = Date.now() // Start timing

    const feedAddress =
      chainlinkFeeds[chainName as keyof typeof chainlinkFeeds]?.[reserveType]
    if (!feedAddress) {
      throw new Error(
        `Chain name '${chainName}' or reserve type '${reserveType}' not supported or feed address not found`
      )
    }

    const client = createPublicClient({
      chain: mainnet, // Adjust this to dynamically support other chains if needed
      transport: http("https://eth-pokt.nodies.app"),
    })

    // Replace with actual method to get proof of reserve from the contract
    const proofOfReserve = await client.readContract({
      address: feedAddress as `0x${string}`,
      abi: parseAbi(["function latestAnswer() view returns (uint256)"]),
      functionName: "latestAnswer",
      args: [],
    })

    const end = Date.now() // End timing
    console.log(`getProofOfReserve took ${end - start} ms`) // Log the time taken

    return convertBigIntToString(proofOfReserve)
  },
}
