import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
  },
  server: {
    OPENROUTER_API_KEY: z.string().min(1),
    ONEINCH_API_KEY: z.string().min(1),
    ENS_API_KEY: z.string().min(1),
    REDPILL_API_KEY: z.string().min(1),
    NEARBLOCKS_API_KEY: z.string().min(1),
    PIKESPEAK_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    ONEINCH_API_KEY: process.env.ONEINCH_API_KEY,
    ENS_API_KEY: process.env.ENS_API_KEY,
    REDPILL_API_KEY: process.env.REDPILL_API_KEY,
    NEARBLOCKS_API_KEY: process.env.NEARBLOCKS_API_KEY,
    PIKESPEAK_API_KEY: process.env.PIKESPEAK_API_KEY,
  },
})
