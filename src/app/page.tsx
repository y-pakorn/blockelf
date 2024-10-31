import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"
import { Navbar } from "@/components/navbar"

import { Chat } from "./chat"

export const maxDuration = 60

export default function Home() {
  return (
    <main className="container flex flex-1 flex-col gap-4 py-4">
      <Chat />
    </main>
  )
}
