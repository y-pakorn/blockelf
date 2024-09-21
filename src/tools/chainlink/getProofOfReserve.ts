import { generateText } from "ai"
import { createPublicClient, http, parseAbi } from "viem"
import { mainnet } from "viem/chains"
import { z } from "zod"

import { openrouter } from "@/lib/ai_utils"

const proofOfReserveInfo = {
  Ethereum: {
    ARKB: {
      address: "0x80f8D7b4fB192De43Ed6aE0DD4A42A60f43641b0",
      assetName: "ARK 21Shares BTC ETF",
      reserveType: "Off-chain",
      dataSource: "Coinbase Prime",
      reporting: "Custodian API",
      unit: "BTC",
    },
    CETH: {
      address: "0xa7d76167900493Acf2650Dc001fb2Bc5256579B0",
      assetName: "21Shares Core Ethereum ETF",
      reserveType: "Cross-chain",
      dataSource: "Cross-chain / Ethereum Network",
      reporting: "Custodian API",
      unit: "ETH",
    },
    CacheGold: {
      address: "0x5586bF404C7A22A4a4077401272cE5945f80189C",
      assetName: "Gold in grams (g)",
      reserveType: "Off-chain",
      dataSource: "GramChain",
      reporting: "Custodian API",
      unit: "g",
    },
    EURR: {
      address: "0x652Ac4468688f277fB84b26940e736a20A87Ac2d",
      assetName: "Euro (EUR)",
      reserveType: "Off-chain",
      dataSource: "The Network Firm",
      reporting: "Third-party",
      unit: "EUR",
    },
    HBTC: {
      address: "0x0A8cD0115B1EE87EbA5b8E06A9a15ED93e230f7a",
      assetName: "BTC",
      reserveType: "Cross-chain",
      dataSource: "Cross-chain",
      reporting: "Wallet Address Manager",
      unit: "BTC",
    },
    STBT: {
      address: "0xad4A9bED9a5E2c1c9a6E43D35Db53c83873dd901",
      assetName: "US Treasury Bills and Repurchase Agreements (Repo)",
      reserveType: "Off-chain",
      dataSource: "Harris & Trotter",
      reporting: "Third-party",
      unit: "USD",
    },
    SwellETH: {
      address: "0x60cbE8D88EF519cF3C62414D76f50818D211fea1",
      assetName: "Staked ETH",
      reserveType: "Cross-chain",
      dataSource: "Beacon Chain / Cross-chain",
      reporting: "Wallet Address Manager",
      unit: "ETH",
    },
    SwellRestakedETH: {
      address: "0x0c89c488e763AC2d69cB058CCAC7A8B283EE3DbA",
      assetName: "Restaked ETH",
      reserveType: "Cross-chain",
      dataSource: "Beacon Chain / Cross-chain",
      reporting: "Wallet Address Manager",
      unit: "ETH",
    },
    TUSD: {
      address: "0xBE456fd14720C3aCCc30A2013Bffd782c9Cb75D5",
      assetName: "US Dollar (USD) total reserves",
      reserveType: "Off-chain",
      dataSource: "MooreHK",
      reporting: "Third-party",
      unit: "USD",
    },
    WBTC: {
      address: "0xa81FE04086865e63E12dD3776978E49DEEa2ea4e",
      assetName: "Bitcoin (BTC)",
      reserveType: "Cross-chain",
      dataSource: "Cross-chain",
      reporting: "Wallet address",
      unit: "BTC",
    },
  },
}

const client = createPublicClient({
  chain: mainnet, // Adjust this to dynamically support other chains if needed
  transport: http("https://eth-pokt.nodies.app"),
})

export const getProofOfReserve = {
  description:
    "Get the proof of reserve from asset name (e.g. ARKB, ARK BTC ETF, ARK 21Shares)",
  parameters: z.object({
    assetInfo: z
      .string()
      .describe(
        "The asset info, e.g. 'ARK 21Shares BTC ETF', 'ARKB', 'ARK BTC"
      ),
  }),
  execute: async ({ assetInfo }: { assetInfo: string }) => {
    const start = Date.now() // Start timing
    const { text: address } = await generateText({
      model: openrouter("gpt-3.5-turbo"),
      // model: openrouter("google/gemini-flash-1.5"),
      prompt: `From the asset info, Only return the proof of reserve contract address
      Don't return anything else, just the address
      =========== Context ==========
      ${JSON.stringify(proofOfReserveInfo)}
      ==============================
      Example 1:
      =========== Input ============
      assetInfo: ARKB
      =========== Output ============
      address: 0x80f8D7b4fB192De43Ed6aE0DD4A42A60f43641b0
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

    const result = {
      assetInfo: assetInfo,
      proofOfReserve: parseInt(answer.toString()) / 1e18,
      unit: Object.values(proofOfReserveInfo.Ethereum).find(
        (info) => info.address === address
      )?.unit,
    }
    // const result = `${assetInfo} Proof of reserve : ${parseInt(answer.toString()) / 1e18}`
    console.log("result", result)
    const end = Date.now() // End timing
    console.log(`getProofOfReserveAddress took ${end - start} ms`) // Log the time taken
    return result
  },
}
