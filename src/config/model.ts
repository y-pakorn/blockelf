import { Model } from "@/types"

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Very fast model with low latency, but lower accuracy.",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "A small model with lower latency and lower cost.",
  },
] as const

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id
