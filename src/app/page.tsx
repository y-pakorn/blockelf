import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

import { Chat } from "./chat"

export default function Home() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4">
      <Chat />
    </main>
  )
}
