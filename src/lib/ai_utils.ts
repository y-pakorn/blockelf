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
    "https://wapo-testnet.phala.network/ipfs/QmfPirCbhHc5nDqBh5oSjc9hVP8NbFGx6Z3t3bKJ3SywQd",
  // "https://wapo-testnet.phala.network/ipfs/QmSvRgWgxnhno3kQKN9oWDqYsUD62jXKnYmMxt8oNCoLsp",

  apiKey: env.REDPILL_API_KEY,
})
