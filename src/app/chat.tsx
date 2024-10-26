"use client"

import { Fragment, useCallback, useState } from "react"
import { submitMessage } from "@/services/ai"
import { useAppStore } from "@/stores/app-store"
import { Message } from "@/types"
import { readStreamableValue } from "ai/rsc"
import _ from "lodash"
import {
  ArrowRight,
  Bot,
  Check,
  IterationCw,
  Loader2,
  MessageCircleMore,
  Pencil,
  Pill,
  UserRound,
} from "lucide-react"

import { AVAILABLE_MODELS } from "@/config/model"
import { AVAILABLE_TEMPERATURES } from "@/config/temperature"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Markdown } from "@/components/markdown"

const Chat = () => {
  const {
    messages: conversation,
    model,
    setMessages: setConversation,
    setModel,
    temperature,
    setTemperature,
  } = useAppStore()

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const [statuses, setStatuses] = useState<
    {
      label?: string
      isThinking: boolean
    }[]
  >([])

  const continueConversation = useCallback(
    async (input: string, conversation: Message[]) => {
      const text = input.trim()
      if (!text) return

      setIsTyping(true)
      setStatuses([
        {
          isThinking: true,
        },
      ])

      try {
        setConversation([
          ...conversation,
          {
            role: "user",
            content: input.trim(),
          },
          {
            role: "assistant",
            content: "",
          },
        ])

        const { messages, stream } = await submitMessage(
          [...conversation, { role: "user", content: input.trim() }],
          model,
          temperature
        )

        let textContent = ""

        for await (const detail of readStreamableValue(stream)) {
          if (!detail) continue
          if (detail.type === "text") {
            textContent = `${textContent}${detail.delta}`

            setConversation([
              ...messages,
              { role: "assistant", content: textContent },
            ])
          } else if (detail.type === "status") {
            setStatuses((prev) => {
              const next = [...prev]
              next[next.length - 1].isThinking = false
              if (detail.status === "start") {
                if (next.length > 1 && next[next.length - 2]?.label) {
                  next.pop()
                }
                next.push({
                  label: detail.label,
                  isThinking: true,
                })
              } else if (detail.status === "end") {
                next[next.length - 1].isThinking = false
                next.push({
                  isThinking: true,
                })
              }
              return next
            })
          }
        }
        setStatuses((prev) => {
          const next = [...prev]
          next.pop()
          return next
        })

        if (!textContent) {
          setConversation([
            ...messages,
            {
              role: "assistant",
              content: "An error occurred while processing the request.",
            },
          ])
        }
      } finally {
        setIsTyping(false)
      }
    },
    [model, temperature]
  )

  return (
    <>
      {conversation.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              continueConversation(input, conversation)
              setInput("")
            }}
          >
            <div className="flex w-[36rem] flex-col items-center gap-2">
              <h1 className="mb-4 text-4xl font-bold">
                On-chain Data Made Easy
              </h1>
              <div className="w-full space-y-2 rounded-md border p-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      "form" in e.target
                    ) {
                      e.preventDefault()
                      ;(e.target.form as HTMLFormElement).requestSubmit()
                    }
                  }}
                  disabled={isTyping}
                  placeholder="Ask anything about blockchain or ethereum!"
                  className="min-h-16 resize-none border-none bg-transparent p-2 text-base focus-visible:outline-none focus-visible:ring-transparent"
                />
                <div className="flex">
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="rounded-full px-3">
                          <Bot className="mr-2 size-4" />
                          {AVAILABLE_MODELS.find((m) => m.id === model)?.name ??
                            model}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 p-2">
                            {AVAILABLE_MODELS.map((m) => (
                              <Toggle
                                pressed={m.id === model}
                                onClick={() => setModel(m.id)}
                                className="relative flex h-full flex-col items-start justify-start p-2 text-start"
                                key={m.id}
                              >
                                <h3 className="text-base font-bold">
                                  {m.name}
                                </h3>
                                <h4 className="font-mono text-xs">{m.id}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {m.description}
                                </p>
                                {m.id === model && (
                                  <Check className="absolute right-2 top-1/2 size-4 -translate-y-1/2" />
                                )}
                                {m.isRedpill && (
                                  <div className="absolute right-0 top-0">
                                    <Badge className="gap-1 px-1.5 py-0">
                                      On-chain via{" "}
                                      <Pill className="size-3 stroke-red-400 stroke-[3]" />{" "}
                                      <span className="font-bold">Redpill</span>
                                    </Badge>
                                  </div>
                                )}
                              </Toggle>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="rounded-full px-3">
                          <Pencil className="mr-2 size-4" />
                          {
                            AVAILABLE_TEMPERATURES.find(
                              (t) => t.temperature === temperature
                            )?.label
                          }
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 p-2">
                            {AVAILABLE_TEMPERATURES.map((m, i) => (
                              <Toggle
                                pressed={m.temperature === temperature}
                                onClick={() => setTemperature(m.temperature)}
                                className="relative flex h-full flex-col items-start justify-start p-2 text-start"
                                key={i}
                              >
                                <h3 className="text-base font-bold">
                                  {m.label}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {m.description}
                                </p>
                                {m.temperature === temperature && (
                                  <Check className="absolute right-2 top-1/2 size-4 -translate-y-1/2" />
                                )}
                              </Toggle>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <Button
                    type="submit"
                    className="ml-auto rounded-full"
                    size="icon"
                  >
                    <ArrowRight className="size-5" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    [
                      UserRound,
                      "What's account status of muramasa.near, portfolio, and history?",
                      false,
                    ],
                  ] as const
                ).map(([Icon, text, b]) => (
                  <div
                    className={cn(
                      "inline-flex cursor-pointer items-center rounded-md border p-2 text-sm transition-colors hover:bg-secondary",
                      b ? "break-all" : "break-words"
                    )}
                    onClick={() => setInput(text)}
                    key={`model-${text}`}
                  >
                    <Icon className="mr-2 size-4 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex w-full max-w-[52rem] flex-1 flex-col gap-4 self-center">
            <h1 className="mb-4 text-3xl font-bold">
              {conversation[0].content}
            </h1>
            <div className="flex w-full flex-col gap-4">
              {conversation.slice(1).map((message, index) => (
                <Fragment key={index}>
                  {message.role === "assistant" ? (
                    <>
                      {conversation.length - 2 === index && (
                        <>
                          <div className="flex items-center gap-2">
                            <MessageCircleMore className="size-6" />
                            <h2 className="text-xl font-semibold">Status</h2>
                          </div>
                          <div>
                            {statuses.map((status, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                {status.isThinking ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Check className="size-4" />
                                )}
                                {status.label || "Thinking"}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <MessageCircleMore className="size-6" />
                        <h2 className="text-xl font-semibold">Answer</h2>
                      </div>
                      {message.content ? (
                        <>
                          <Markdown className="max-w-full">
                            {message.content}
                          </Markdown>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={async () => {
                                continueConversation(
                                  conversation[index].content,
                                  conversation.slice(0, index)
                                )
                              }}
                              className="rounded-full"
                              variant="outline"
                              size="sm"
                            >
                              <IterationCw className="mr-2 size-3" />
                              Retry
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-1/2" />
                          <Skeleton className="h-8 w-2/3" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Separator />
                      <h1 className="mb-2 text-2xl font-bold">
                        {message.content}
                      </h1>
                    </>
                  )}
                </Fragment>
              ))}
            </div>
            <div className="sticky bottom-4 mt-auto w-[40rem] self-center">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  continueConversation(input, conversation)
                  setInput("")
                }}
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask follow-up questions..."
                    className="rounded-full"
                  />
                  <Button
                    disabled={isTyping}
                    type="submit"
                    className="ml-auto size-8 rounded-full"
                    size="icon"
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
Chat.displayName = "Chat"

export { Chat }
