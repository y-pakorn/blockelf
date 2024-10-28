"use server"

import { nearAccountTools } from "@/tools/accounts"
import { nearBlockTools } from "@/tools/blocks"
import { nearDEXTools } from "@/tools/dex"
import { nearFTTools } from "@/tools/fts"
import { nearNFTTools } from "@/tools/nfts"
import { nearSearchTools } from "@/tools/search"
import { nearTxnTools } from "@/tools/txns"
import { utilTools } from "@/tools/utils"
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
  sublabel?: string
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
        ...utilTools,
        ...nearAccountTools,
        ...nearNFTTools,
        ...nearTxnTools,
        ...nearFTTools,
        ...nearDEXTools,
        ...nearSearchTools,
        ...nearBlockTools,
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

NEAR Protocol Specific:
- Token is aliased as "FT" (Fungible Token) and "NFT" (Non-Fungible Token). So if you see "ft_transfer" action it mean a transfer of fungible token.

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

Think about what you need to do through planning and reasoning. The answer may not be direct, you may need to use multiple tools and multiple steps to answer the query.

Action: High level planning
Description: Plan and reason the steps to answer the user query.

Action: Execute
Description: Execute the available tools

You can take multiple action and steps.

Reflect on your action, observation and data gathered.

You should be very precise with the data observation. For example, if you see object { transaction_hash: "0x1234"  } in the data, it means the transaction hash is "0x1234" and you cannot use that to query the block since it is not a block hash.

If the data gathered is not enough to answer the query in the first planning, observe the data and reflect on the data to plan the next steps.

You can execute steps infinitely until you get the final answer.

After you are absolutely sure that you get the final answer. Give the final answer to the user.

Proceed without asking for more information.
`

      const schema = z.object({
        TYPE: z.union([
          z.literal("HIGH_LEVEL_PLANNING"),
          z.literal("EXECUTE"),
          z.literal("BATCH_EXECUTE"),
          z.literal("FINAL_ANSWER"),
        ]),
        HIGH_LEVEL_PLANNING: z
          .object({
            NAME: z.string().describe("Label for the user to see."),
            CURRENT_STATE_OF_EXECUTION: z.string(),
            OBSERVATION_REFLECTION: z.string(),
            MEMORY: z.string().nullable(),
            PLAN: z.string(),
            PLAN_REASONING: z.string(),
          })
          .optional(),
        EXECUTE: z
          .object({
            NAME: z.string().describe("Label for the user to see."),
            TASK: z.string(),
            TASK_TOOL: z
              .string()
              .describe(
                "A name of the tool to be called, can be one of the tools available."
              ),
            TASK_TOOL_PARAMETERS: z.record(z.any()),
            TASK_TOOL_REASONING: z.string(),
            SITUATION_ANALYSIS: z.string(),
          })
          .optional()
          .describe("Execute one of the tools available once using this step."),
        //Action: Batch Execute
        //Description: Execute the available tools multiple times simultaneously, DO NOT EXECUTE THE SAME TOOL WITH SAME PARAMETERS.
        //BATCH_EXECUTE: z
        //.object({
        //NAME: z.string().describe("Label for the user to see."),
        //TASKS: z.array(
        //z.object({
        //TASK: z.string(),
        //TASK_TOOL: z
        //.string()
        //.describe(
        //"A name of the tool to be called, can be one of the tools available."
        //),
        //TASK_TOOL_PARAMETERS: z.record(z.any()),
        //TASK_TOOL_REASONING: z.string(),
        //})
        //),
        //SITUATION_ANALYSIS: z.string(),
        //})
        //.optional(),
        FINAL_ANSWER: z
          .string()
          .describe(
            `
The final answer to the user query.

The final answer should not truncate or miss any important information.

YOU MUST use markdown to format the response.

Display object in markdown's table format.
Display icon/image in markdown's image format.
 - If the image is came in raw data, use inline HTML '<img src="{data}">'.
 - Else display the image using the URL "![{alt}]({url})".

The data you gave out should be human readable and easy to understand. And must be in the best UX for the user. For example, show image instead of a link to the image. Show table instead of a list of data. Show a graph instead of a table of data. Show a video instead of a link to the video.

DO NOT include any non-available data in the final answer.

DO NOT mention any tools or steps or previous step data in the final answer. The final answer is only thing the user will see.
`
          )
          .optional(),
      })

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
        }

        const object = await response.object

        console.log(object)

        if (object.TYPE === "FINAL_ANSWER") break

        stream.update({
          type: "status",
          status: "start",
          label: object.HIGH_LEVEL_PLANNING?.NAME || object.EXECUTE?.NAME,
          //object.BATCH_EXECUTE?.NAME,
          sublabel:
            object.HIGH_LEVEL_PLANNING?.OBSERVATION_REFLECTION ||
            object.EXECUTE?.SITUATION_ANALYSIS,
          //object.BATCH_EXECUTE?.SITUATION_ANALYSIS,
        })

        messages.push({
          role: "assistant",
          content: JSON.stringify(object, null, 2),
        })

        //if (object.TYPE === "BATCH_EXECUTE") {
        //await Promise.all(
        //object.BATCH_EXECUTE!.TASKS.map(async (task) => {
        //const toolName = task.TASK_TOOL
        //const tool = (tools as any)[toolName]
        //const toolResponse = await tool.execute(task.TASK_TOOL_PARAMETERS)

        //console.log("Called", toolName, toolResponse)
        //messages.push({
        //role: "assistant",
        //content: `Tool response:\n${JSON.stringify(toolResponse, null, 2)}`,
        //})
        //})
        //)
        //}

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
