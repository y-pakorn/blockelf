import { Message } from "@/types"
import { create } from "zustand"

import { DEFAULT_MODEL } from "@/config/model"

interface AppStore {
  model: string
  setModel: (model: string) => void
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export const useAppStore = create<AppStore>((set) => ({
  model: DEFAULT_MODEL,
  setModel: (model) => set({ model }),
  messages: [],
  setMessages: (messages) => set({ messages }),
}))
