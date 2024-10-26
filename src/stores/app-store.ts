import { Message } from "@/types"
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
}

export const useAppStore = create<AppStore>((set, get) => ({
  model: DEFAULT_MODEL,
  setModel: (model) => set({ model }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  temperature: DEFAULT_TEMPERATURE,
  setTemperature: (temperature) => set({ temperature }),
}))
