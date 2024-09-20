"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/stores/app-store"
import { HomeIcon, Search, SearchCode } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button, buttonVariants } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

const Navbar = ({ className }: { className?: string }) => {
  const { setMessages } = useAppStore()
  const pathname = usePathname()

  return (
    <nav className="my-2 flex flex-col items-center gap-8 p-4">
      <Link href="/" onClick={() => setMessages([])}>
        <Image
          src="/logo.svg"
          alt="BlockElf logo"
          width={32}
          height={32}
          className="mb-8"
        />
      </Link>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/"
              onClick={() => setMessages([])}
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
              })}
            >
              <SearchCode className="size-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Search</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </nav>
  )
}
Navbar.displayName = "Navbar"

export { Navbar }
