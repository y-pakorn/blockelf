import { getSystemPrompt, setSystemPrompt } from "@/services/prompt"
import { Message } from "@/types"
import { toast } from "sonner"
import { create } from "zustand"

import { DEFAULT_MODEL } from "@/config/model"
import { DEFAULT_TEMPERATURE } from "@/config/temperature"

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
}

export const useAppStore = create<AppStore>((set, get) => ({
  model: DEFAULT_MODEL,
  setModel: (model) => set({ model }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  temperature: DEFAULT_TEMPERATURE,
  setTemperature: (temperature) => set({ temperature }),
  systemPrompt: null,
  isLoadingSystemPrompt: false,
  setSystemPrompt: async (systemPrompt) => {
    set({ isLoadingSystemPrompt: true })
    await setSystemPrompt(systemPrompt)
    set({ systemPrompt, isLoadingSystemPrompt: false })
    toast.success("System prompt updated")
  },
  getSystemPrompt: async (force?: boolean) => {
    if (!force && get().systemPrompt) return
    set({ isLoadingSystemPrompt: true })
    const systemPrompt = await getSystemPrompt()
    set({ systemPrompt, isLoadingSystemPrompt: false })
  },
}))
