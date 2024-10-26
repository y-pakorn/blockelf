"use client"

import { createContext, ReactNode } from "react"

const AppContext = createContext({})
const AppProvider = ({ children }: { children: ReactNode }) => {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>
}
AppProvider.displayName = "AppProvider"

export { AppProvider, AppContext }
