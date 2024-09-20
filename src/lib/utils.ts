import { createOpenAI as createGroq } from "@ai-sdk/openai"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env.mjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertBigIntToString = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString()
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString)
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertBigIntToString(value),
      ])
    )
  }

  return obj
}
