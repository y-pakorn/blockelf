"use server"

import { nearAccountTools } from "@/tools/accounts"
import { nearFTTools } from "@/tools/fts"
import { nearNFTTools } from "@/tools/nfts"
import { nearTxnTools } from "@/tools/txns"
import { Message } from "@/types"
import { CoreMessage, streamObject } from "ai"
import { createStreamableValue } from "ai/rsc"
import _ from "lodash"
import { z } from "zod"

import { DEFAULT_MODEL } from "@/config/model"
import { openrouter } from "@/lib/ai_utils"

type StreamResponse = TextStreamResponse | StatusStreamResponse
type StatusStreamResponse = {
  type: "status"
  status: "start" | "end"
  label?: string
}
type TextStreamResponse = {
  type: "text"
  delta?: string
  text?: string
}

export const submitMessage = async (
  prevMessages: Message[],
  model: string = DEFAULT_MODEL,
  temperature?: number
) => {
  "use server"

  const controller = new AbortController()
  const stream = createStreamableValue<StreamResponse>()

  ;(async () => {
    try {
      const tools = {
        ...nearAccountTools,
        ...nearNFTTools,
        ...nearTxnTools,
        ...nearFTTools,
      }

      const toolsDescription = _.chain(tools)
        .entries()
        .map(
          ([name, t], i) => `
Tool ${i}: ${name}
Description: ${(t as any).description}
Parameters:
${_.map(t.parameters.shape, (p, name) => `"${name}": ${(p as any)?.description}`).join(",\n")}
        `
        )
        .join("\n")
        .value()

      const system = `
You are NEAR Protocol's AI assistant and query resolver.

AVAILABLE TOOLS:
<start>
${toolsDescription}
<end>

PREVIOUS MESSAGES WITH USER:
<start>
${_.map(prevMessages.slice(0, -1), (m) => `${m.role}: ${m.content}`).join("\n")}
<end>

CURRENT GOAL: Answer user query "${_.last(prevMessages)?.content}"

DO STEP BY STEP

Formulate a plan to answer the user query.

Think about what you need to do through planning and reasoning.

Start by high level planning, then execute the tool.

Then iterate, if needed, use high level planning again.

After enough high level planning, and data gathering. Give the final answer to the user.

If there is no tool available to answer the query. Return an error message.

Proceed without asking for more information.
`

      const schema = z
        .object({
          TYPE: z
            .union([
              z.literal("HIGH_LEVEL_PLANNING"),
              z.literal("EXECUTE"),
              z.literal("FINAL_ANSWER"),
              z.literal("ERROR"),
            ])
            .describe(
              "The type of response. Must be one of HIGH_LEVEL_PLANNING, LOW_LEVEL_PLANNING, FINAL_ANSWER, ERROR."
            ),
          HIGH_LEVEL_PLANNING: z
            .object({
              NAME: z.string(),
              CURRENT_STATE_OF_EXECUTION: z.string(),
              OBSERVATION_REFLECTION: z.string(),
              MEMORY: z.string(),
              PLAN: z.string(),
              PLAN_REASONING: z.string(),
            })
            .optional(),
          EXECUTE: z
            .object({
              TASK: z.string(),
              TASK_TOOL: z
                .string()
                .describe(
                  "A name of the tool to be called, can be one of the tools available."
                ),
              TASK_TOOL_PARAMETERS: z.record(z.any()),
              TASK_TOOL_REASONING: z.string(),
            })
            .optional()
            .describe(
              "Execute one of the tools available once using this step."
            ),
          FINAL_ANSWER: z
            .string()
            .describe(
              `
The final answer to the user query.

The final answer should not truncate or miss any important information.

YOU MUST use markdown to format the response.

Display object in markdown's table format.
Display icon/image in markdown's image format. If the image is in base64, use placeholder instead: "![Placeholder](https://placehold.co/400)". Else display the image using the URL "![{alt}]({url})".

The data you gave out should be human readable and easy to understand. And must be in the best UX for the user. For example, show image instead of a link to the image. Show table instead of a list of data. Show a graph instead of a table of data. Show a video instead of a link to the video.


DO NOT mention any tools or steps or previous step data in the final answer. The final answer is only thing the user will see.
`
            )
            .optional(),
          ERROR: z.string().optional(),
        })
        .describe(
          "The response for final answer or planning. Must be one of HIGH_LEVEL_PLANNING, LOW_LEVEL_PLANNING, FINAL_ANSWER, ERROR."
        )

      const messages: CoreMessage[] = [
        {
          role: "system",
          content: system,
        },
      ]

      while (true) {
        const response = await streamObject({
          model: openrouter(model),
          messages,
          temperature,
          mode: "json",
          schema,
          schemaName: "Response",
          abortSignal: controller.signal,
        })

        for await (const partial of response.partialObjectStream) {
          if (partial.TYPE === "FINAL_ANSWER") {
            stream.update({
              type: "text",
              text: partial.FINAL_ANSWER || "",
            })
          }

          if (partial.TYPE === "ERROR") {
            stream.update({
              type: "text",
              text: partial.ERROR || "",
            })
          }
        }

        const object = await response.object

        console.log(object)

        if (object.TYPE === "FINAL_ANSWER" || object.TYPE === "ERROR") break

        stream.update({
          type: "status",
          status: "start",
          label: object.HIGH_LEVEL_PLANNING?.NAME || object.EXECUTE?.TASK,
        })

        messages.push({
          role: "assistant",
          content: JSON.stringify(object, null, 2),
        })

        if (object.TYPE === "EXECUTE") {
          const toolName = object.EXECUTE!.TASK_TOOL
          const tool = (tools as any)[toolName]
          const parameters = object.EXECUTE!.TASK_TOOL_PARAMETERS

          const toolResponse = await tool.execute(parameters)

          console.log("Called", toolName, toolResponse)
          messages.push({
            role: "assistant",
            content: `Tool response:\n${JSON.stringify(toolResponse, null, 2)}`,
          })
        }

        stream.update({
          type: "status",
          status: "end",
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      controller.abort()
      stream.done()
    }
  })()

  return {
    messages: prevMessages,
    stream: stream.value,
    error: null,
  }
}
