import { generateText } from "ai"
import { createPublicClient, http, parseAbi } from "viem"
import { mainnet } from "viem/chains"
import { z } from "zod"

import { onchainRedpill, openrouter, redpill } from "@/lib/ai_utils"

const priceInfo = {
  Ethereum: {
    "ETH-USD": {
      address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      assetName: "Ethereum",
      base: "ETH",
      quote: "USD",
      decimals: 8,
    },
    "stETH-USD": {
      address: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
      assetName: "Lido Staked ETH",
      base: "ETH",
      quote: "USD",
      decimals: 8,
    },
    "wstETH-USD": {
      address: "0x164b276057258d81941e97B0a900D4C7B358bCe0",
      assetName: "Wrapped Lido Staked ETH",
      base: "ETH",
      quote: "USD",
      decimals: 8,
    },
    "USDC-USD": {
      address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      assetName: "Circle USD",
      base: "USDC",
      quote: "USD",
      decimals: 8,
    },
    "USDT-USD": {
      address: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
      assetName: "Tether USD",
      base: "USDT",
      quote: "USD",
      decimals: 8,
    },
    "BTC-USD": {
      address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      assetName: "Bitcoin",
      base: "BTC",
      quote: "USD",
      decimals: 8,
    },
    "BTC-ETH": {
      address: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
      assetName: "Bitcoin",
      base: "BTC",
      quote: "ETH",
      decimals: 8,
    },
    "SOL-USD": {
      address: "0x4ffC43a60e009B551865A93d232E33Fce9f01507",
      assetName: "Solana",
      base: "SOL",
      quote: "USD",
      decimals: 8,
    },
  },
}

const client = createPublicClient({
  chain: mainnet, // Adjust this to dynamically support other chains if needed
  transport: http("https://eth-pokt.nodies.app"),
})

export const getPrice = {
  description:
    "Get the price from asset name (e.g. ETH, stETH, Lido staked eth, btc, bitcoin)",
  parameters: z.object({
    assetInfo: z.string().describe("The asset name, e.g. 'ETH', 'Ether', 'btc"),
  }),
  execute: async ({ assetInfo }: { assetInfo: string }) => {
    const start = Date.now() // Start timing
    const { text: address } = await generateText({
      // model: openrouter("gpt-3.5-turbo"),
      // model: redpill("gpt-3.5-turbo"),
      model: onchainRedpill("gpt-3.5-turbo"),
      // model: openrouter("google/gemini-flash-1.5"),
      prompt: `From the asset info, Only return the price contract address
      Don't return anything else, just the address. Default quote is USD unless specified
      =========== Context ==========
      ${JSON.stringify(priceInfo)}
      ==============================
      Example 1:
      =========== Input ============
      assetInfo: Bitcoin to eth
      =========== Output ============
      address: 0xdeb288F737066589598e9214E782fa5A8eD689e8
      =========== Input ============
      assetInfo: ${assetInfo}
      =========== Output ============
      address: 
      `,
    })

    console.log("llm res", address)

    // Replace with actual method to get proof of reserve from the contract
    const answer = await client.readContract({
      address: address as `0x${string}`,
      abi: parseAbi(["function latestAnswer() view returns (uint256)"]),
      functionName: "latestAnswer",
      args: [],
    })

    const decimals = Object.values(priceInfo.Ethereum).find(
      (info) => info.address === address
    )?.decimals
    const result = {
      assetInfo: assetInfo,
      price: decimals
        ? parseInt(answer.toString()) / 10 ** decimals
        : parseInt(answer.toString()) / 1e8,
      assetName: Object.values(priceInfo.Ethereum).find(
        (info) => info.address === address
      )?.assetName,
      base: Object.values(priceInfo.Ethereum).find(
        (info) => info.address === address
      )?.base,
      quote: Object.values(priceInfo.Ethereum).find(
        (info) => info.address === address
      )?.quote,
    }

    console.log("result", result)
    const end = Date.now() // End timing
    console.log(`getPrice took ${end - start} ms`) // Log the time taken
    return {
      priceData: result,
    }
  },
}
