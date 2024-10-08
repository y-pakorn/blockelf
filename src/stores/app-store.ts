import { Message } from "@/types"
import { toast } from "sonner"
import { create } from "zustand"

import { DEFAULT_MODEL } from "@/config/model"
import { DEFAULT_TEMPERATURE } from "@/config/temperature"
import { AVAILABLE_TOOLS } from "@/config/tools"

interface AppStore {
  model: string
  setModel: (model: string) => void
  messages: Message[]
  setMessages: (messages: Message[]) => void
  temperature: number
  setTemperature: (temperature: number) => void
  systemPrompt: string | null
  setSystemPrompt: (systemPrompt: string) => Promise<void>
  getSystemPrompt: (force?: boolean) => Promise<void>
  isLoadingSystemPrompt: boolean
  selectedTools: string[]
  setSelectedTools: (tools: string[]) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  model: DEFAULT_MODEL,
  setModel: (model) => set({ model }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  temperature: DEFAULT_TEMPERATURE,
  setTemperature: (temperature) => set({ temperature }),
  systemPrompt: `
    You are a blockchain on-chain analyser with many tools integrated,
    return response to user's query as assistant role.
    YOU MUST use markdown to format the response.
    YOU MUST NEVER make up any information, you must only use the information provided by the tools.
    Display object in markdown's table format.
    If you came across any unix timestamp, you MUST convert it to human readable format using \`timestampToReadable\` tool.
    The data you gave out should be human readable and easy to understand.
    You should use as many tools as you need and can use same tool multiple times if needed.
    For example, if user ask about current token price, you can use \`getPrice\` tool multiple times to get the price of multiple tokens.
    If user ask about price in the past, you can use \`getHistoricalPrice\` tool to get the historical price of a token.
    For some tools that requires token address, you can use \`getTokenAddress\` tool first to get the token address.
    
    Example of how you should think step by step:
    1. User ask something
    2. You should see the tools and think which tools you can use to get the data you need
    3. If that tool requires input from other tools, you should use the other tools first to get the data you need
    4. After you get the data you need, you should use the tool to get the data
    5. Now that you have all the data, think about user's query and how to respond along with the data you got from the tools
    6. Return the response to user
        
  `,
  isLoadingSystemPrompt: false,
  setSystemPrompt: async (systemPrompt) => {},
  getSystemPrompt: async (force?: boolean) => {},
  selectedTools: AVAILABLE_TOOLS.map((tool) => tool.name),
  setSelectedTools: (tools) => set({ selectedTools: tools }),
}))
