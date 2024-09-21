"use server"

import { createOpenAI as createGroq } from "@ai-sdk/openai"

import { env } from "@/env.mjs"

export const openrouter = createGroq({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
})

export const redpill = createGroq({
  baseURL: "https://api.red-pill.ai/v1",
  apiKey: env.REDPILL_API_KEY,
})

export const onchainRedpill = createGroq({
  baseURL:
    "https://wapo-testnet.phala.network/ipfs/QmPfBK6JQGBKaFvq8sWfxtE6HyWhucH8rYzpsvdWbDenGR?key=19f55f816b4ee8f6&path=",
  apiKey: env.REDPILL_API_KEY,
})
