"use server"

import { kv } from "@vercel/kv"

export const getSystemPrompt = async () => {
  return kv.get<string>("system_prompt")
}

export const setSystemPrompt = async (prompt: string) => {
  return kv.set("system_prompt", prompt)
}
