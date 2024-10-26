"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/stores/app-store"
import { Cog, SearchCode } from "lucide-react"

import { ModeToggle } from "./mode-toggle"
import { Button, buttonVariants } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
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
    <nav className="my-2 flex flex-col items-center gap-8 px-2 py-4">
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
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Cog className="size-5" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Settings of the application</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <ModeToggle />
      </TooltipProvider>
    </nav>
  )
}
Navbar.displayName = "Navbar"

export { Navbar }
