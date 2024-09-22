"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/stores/app-store"
import { Cog, HomeIcon, Loader2, Search, SearchCode } from "lucide-react"

import { cn } from "@/lib/utils"

import { ModeToggle } from "./mode-toggle"
import { Button, buttonVariants } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

const Navbar = ({ className }: { className?: string }) => {
  const { setMessages, setSystemPrompt, systemPrompt, isLoadingSystemPrompt } =
    useAppStore()
  const pathname = usePathname()

  const [tempSystemPrompt, setTempSystemPrompt] = useState<string>("")
  useEffect(() => {
    if (systemPrompt) {
      setTempSystemPrompt(systemPrompt)
    }
  }, [systemPrompt])

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
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">System Prompt</h2>
              <Textarea
                value={tempSystemPrompt}
                onChange={(e) => setTempSystemPrompt(e.target.value)}
                className="h-72 w-full"
              />
              <div className="flex justify-end">
                {
                  //<Button
                  //onClick={() => {
                  //setSystemPrompt(tempSystemPrompt)
                  //}}
                  //disabled={isLoadingSystemPrompt}
                  //>
                  //{isLoadingSystemPrompt && (
                  //<Loader2 className="mr-2 size-4 animate-spin" />
                  //)}
                  //Save
                  //</Button>
                }
                <Button
                  variant="outline"
                  onClick={() => {
                    if (systemPrompt) {
                      setTempSystemPrompt(systemPrompt)
                    }
                  }}
                  disabled={isLoadingSystemPrompt}
                >
                  Reset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ModeToggle />
      </TooltipProvider>
    </nav>
  )
}
Navbar.displayName = "Navbar"

export { Navbar }
