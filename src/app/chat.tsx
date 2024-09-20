"use client"

import { Fragment, useCallback, useState } from "react"
import { Message, submitMessage } from "@/services/ai"
import { readStreamableValue } from "ai/rsc"
import { ArrowRight, Bot, Check, Cuboid, MessageCircleMore } from "lucide-react"

import { AVAILABLE_MODELS, DEFAULT_MODEL, ModelId } from "@/config/model"
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
  const [conversation, setConversation] = useState<Message[]>([])
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL)
  const [input, setInput] = useState("")

  const continueConversation = useCallback(async () => {
    const text = input.trim()
    if (!text) return
    setInput("")

    const { messages, newMessage } = await submitMessage(
      [...conversation, { role: "user", content: input }],
      model
    )

    setConversation([...messages, { role: "assistant", content: "" }])

    let textContent = ""

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`

      setConversation([
        ...messages,
        { role: "assistant", content: textContent },
      ])
    }
  }, [conversation, model, input])

  return (
    <>
      {conversation.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              continueConversation()
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
                                <h3 className="text-lg font-semibold">
                                  {m.name}
                                </h3>
                                <h4 className="font-mono text-xs">{m.id}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {m.description}
                                </p>
                                {m.id === model && (
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
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    [
                      Cuboid,
                      "What is the latest block?, display essential details.",
                    ],
                  ] as const
                ).map(([Icon, text]) => (
                  <div
                    className="inline-flex cursor-pointer items-center rounded-md border p-2 text-sm transition-colors hover:bg-secondary"
                    onClick={() => setInput(text)}
                    key={`model-${text}`}
                  >
                    <Icon className="mr-2 size-6" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex w-full max-w-[48rem] flex-1 flex-col gap-4 self-center">
            <h1 className="mb-4 text-3xl font-semibold">
              {conversation[0].content}
            </h1>
            <div className="flex w-full flex-col gap-4">
              {conversation.slice(1).map((message, index) => (
                <Fragment key={index}>
                  {message.role === "user" ? (
                    <>
                      <Separator />
                      <h1 className="mb-2 text-2xl font-semibold">
                        {message.content}
                      </h1>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircleMore className="size-6" />
                      <h2 className="text-xl font-medium">Answer</h2>
                    </div>
                  )}
                  {message.role === "assistant" && (
                    <>
                      {message.content ? (
                        <Markdown className="max-w-full">
                          {message.content}
                        </Markdown>
                      ) : (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-1/2" />
                          <Skeleton className="h-8 w-2/3" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      )}
                    </>
                  )}
                </Fragment>
              ))}
            </div>
            <div className="sticky bottom-4 mt-auto w-[32rem] self-center">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  continueConversation()
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
