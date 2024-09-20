export const AVAILABLE_MODELS = [
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Very fast model with low latency, but lower accuracy.",
  },
  // {
  //   id: "perplexity/llama-3.1-sonar-small-128k-online",
  //   name: "Perplexity Llama 3.1 Sonar 8b",
  //   description:
  //     "A small model with internet access, might increase information retrieval capabilities.",
  // },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "The most powerful model with the best accuracy.",
  },
] as const

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"]
export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id
