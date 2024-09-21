"use client"

import { createContext, ReactNode, useEffect } from "react"
import { useAppStore } from "@/stores/app-store"

const AppContext = createContext({})
const AppProvider = ({ children }: { children: ReactNode }) => {
  const { getSystemPrompt } = useAppStore()

  useEffect(() => {
    getSystemPrompt()
  }, [])
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>
}
AppProvider.displayName = "AppProvider"

export { AppProvider, AppContext }
