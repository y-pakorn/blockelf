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

export function logSchema(data: any, indent = 0) {
  const indentation = " ".repeat(indent)
  if (Array.isArray(data)) {
    console.log(`${indentation}Array of:`)
    if (data.length > 0) {
      logSchema(data[0], indent + 2)
    }
  } else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        console.log(`${indentation}${key}: ${typeof data[key]}`)
        logSchema(data[key], indent + 2)
      }
    }
  } else {
    console.log(`${indentation}${typeof data}`)
  }
}

export function isValidHttpUrl(s: string) {
  let url

  try {
    url = new URL(s)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:"
}

export async function dataUrlToFile(dataUrl: string, fileName: string) {
  const res: Response = await fetch(dataUrl)
  return await res.blob()
}
