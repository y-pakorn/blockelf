"use server"

import { createOpenAI as createGroq } from "@ai-sdk/openai"

import { env } from "@/env.mjs"

export const openrouter = createGroq({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
})
