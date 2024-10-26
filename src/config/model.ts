import { Model } from "@/types"

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Very fast model with low latency, but lower accuracy.",
  },
] as const

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id
