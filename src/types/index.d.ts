import { LucideIcon } from "lucide-react"

export type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
}

export type Message = {
  role: "user" | "assistant"
  content: string
}

export type Model = {
  id: string
  name: string
  description: string
}
