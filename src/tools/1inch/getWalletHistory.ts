import axios from "axios"
import { z } from "zod"

import { env } from "@/env.mjs"
import dayjs from "@/lib/dayjs"
import { convertBigIntToString, logSchema } from "@/lib/utils"

function formatResponse(data: any) {
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Invalid data format")
  }

  return data.items.map((item: any) => ({
    transactionTimeReadable: new Date(item.timeMs).toLocaleString(),
    transactionTimeRelative: dayjs(item.timeMs).fromNow(),
    address: item.address,
    type: item.type,
    rating: item.rating,
    direction: item.direction,
    details: {
      txHash: item.details.txHash,
      chainId: item.details.chainId,
      blockNumber: item.details.blockNumber,
      readableBlockTime: new Date(
        item.details.blockTimeSec * 1000
      ).toLocaleString(),
      blockTime: item.details.blockTimeSec,
      status: item.details.status,
      type: item.details.type,
      tokenActions: item.details.tokenActions.map((action: any) => ({
        chainId: action.chainId,
        address: action.address,
        standard: action.standard,
        fromAddress: action.fromAddress,
        toAddress: action.toAddress,
        amount: action.amount,
        direction: action.direction,
      })),
      fromAddress: item.details.fromAddress,
      toAddress: item.details.toAddress,
      orderInBlock: item.details.orderInBlock,
      nonce: item.details.nonce,
      feeInWei: item.details.feeInWei,
      nativeTokenPriceToUsd: item.details.nativeTokenPriceToUsd,
    },
    id: item.id,
    eventOrderInTransaction: item.eventOrderInTransaction,
  }))
}

export const getWalletHistory = {
  description:
    "Get the transaction history from the wallet, and return important readable formatted data",
  parameters: z.object({
    address: z
      .string()
      .describe(
        "Wallet address, e.g. '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"
      ),
    chainId: z.string().describe("Chain ID, e.g. '1' for Ethereum mainnet"),
    limit: z.number().optional().describe("Amount of events to return"),
    tokenAddress: z.string().optional().describe("Token address used at event"),
    toTimestampMs: z.string().optional().describe("To time at milliseconds"),
    fromTimestampMs: z
      .string()
      .optional()
      .describe("From time at milliseconds"),
  }),
  execute: async ({
    address,
    chainId,
    limit,
    tokenAddress,
    toTimestampMs,
    fromTimestampMs,
  }: {
    address: string
    chainId: string
    limit?: number
    tokenAddress?: string
    toTimestampMs?: string
    fromTimestampMs?: string
  }) => {
    const start = Date.now() // Start timing

    const url = `https://api.1inch.dev/history/v2.0/history/${address}/events`

    const config = {
      headers: {
        Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
      },
      params: {
        chainId,
        limit: limit ?? 10,
        tokenAddress,
        toTimestampMs,
        fromTimestampMs,
      },
      paramsSerializer: {
        indexes: null,
      },
    }

    try {
      const response = await axios.get(url, config)
      const end = Date.now() // End timing
      console.log(`getWalletHistory took ${end - start} ms`)
      // logSchema(response.data)
      const res = formatResponse(response.data)
      // console.log("res", res)
      return {
        history: res,
      }
    } catch (error) {
      console.error(error)
      throw new Error("Failed to fetch wallet history from 1inch API")
    }
  },
}
