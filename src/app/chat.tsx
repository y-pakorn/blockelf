"use client"

import { ReactNode, useState } from "react"
import { Message, submitMessage } from "@/services/ai"
import { readStreamableValue } from "ai/rsc"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Markdown } from "@/components/markdown"

const Chat = () => {
  const [conversation, setConversation] = useState<Message[]>([])
  const [component, setComponent] = useState<ReactNode>()

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const text = (e.target as any)[0].value
          if (!text) return

          const { messages, newMessage } = await submitMessage([
            ...conversation,
            { role: "user", content: text },
          ])

          setConversation(messages)

          let textContent = ""

          for await (const delta of readStreamableValue(newMessage)) {
            textContent = `${textContent}${delta}`

            setConversation([
              ...messages,
              { role: "assistant", content: textContent },
            ])
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Input className="w-[24rem]" placeholder="Type a message..." />
          <Button type="submit">Send</Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              setConversation([])
            }}
            variant="outline"
          >
            Clear Chat
          </Button>
        </div>
      </form>
      <div className="flex w-full flex-col gap-2">
        {conversation.map((message, index) => (
          <Markdown key={index} className="max-w-full">
            {message.content}
          </Markdown>
        ))}
      </div>
    </>
  )
}
Chat.displayName = "Chat"

export { Chat }
