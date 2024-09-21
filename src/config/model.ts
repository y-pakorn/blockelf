import { Model } from "@/types"

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Very fast model with low latency, but lower accuracy.",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description:
      "A powerful model with the good accuracy, slightly slower than Gemini Flash.",
    isRedpill: true,
  },
  {
    id: "claude-3-5-sonnet-20240620",
    name: "Claude 3.5 Sonnet",
    description:
      "Top of the line model with the best accuracy, on the slower side.",
    isRedpill: true,
  },
] as const

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id
