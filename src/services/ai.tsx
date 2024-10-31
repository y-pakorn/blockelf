"use server"

import { unstable_noStore } from "next/cache"
import { nearAccountTools } from "@/tools/accounts"
import { nearBlockTools } from "@/tools/blocks"
import { nearDEXTools } from "@/tools/dex"
import { nearFTTools } from "@/tools/fts"
import { internetTools } from "@/tools/internet"
import { nearNetworkTools } from "@/tools/networks"
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

type StreamResponse =
  | TextStreamResponse
  | StatusStreamResponse
  | RawThoughtStreamResponse
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
type RawThoughtStreamResponse = {
  type: "raw_thought"
  thought: any
}

export const submitMessage = async (
  prevMessages: Message[],
  model: string = DEFAULT_MODEL,
  temperature?: number
) => {
  "use server"
  unstable_noStore()

  const controller = new AbortController()
  const stream = createStreamableValue<StreamResponse>()

  ;(async () => {
    try {
      const tools = {
        ...utilTools,
        ...internetTools,
        ...nearAccountTools,
        ...nearNFTTools,
        ...nearTxnTools,
        ...nearFTTools,
        ...nearDEXTools,
        ...nearSearchTools,
        ...nearBlockTools,
        ...nearNetworkTools,
      }

      const toolsDescription = _.chain(tools)
        .entries()
        .map(
          ([name, t], i) => `
Tool ${i}: ${name}
Description: ${(t as any).description}
${_.size(t.parameters.shape) === 0 ? "" : "Parameters:"}
${_.map(t.parameters.shape, (p, name) => {
  return `"${name}"${
    (p as any).isOptional() ? "?" : ""
  }: ${(p as any)?.description}`
}).join(",\n")}
        `
        )
        .join("\n")
        .value()

      const system = `
You are NEAR Protocol's AI assistant and query resolver.

NEAR Protocol Specific:
- Token is aliased as "FT" (Fungible Token) and "NFT" (Non-Fungible Token). So if you see "ft_transfer" action it mean a transfer of fungible token.
- Token can also mean NEAR token, which is the native token of NEAR Protocol.
- But normally when we say token, it means BOTH Near token and fungible token.
- Account ID is the unique identifier of an account in NEAR Protocol. It is also called as "address" in some context. Its a prefixed string with dot (.) separated parts. For example, "alice.near" is an account ID, "relay.tg" is an account ID, "0-relay.hot.tg" is also an account ID.
- If user is talking about updates in general, it means updates in the social side or protocol side. If user is talking about updates in the blockchain side, they will mention it as on-chain, blockchain, or something similar.
- If user is talking about portfolio value, don't forget to include NEAR token value in the portfolio value. If you can't find price for a certain token, just skip that token and calculate the portfolio value without that token.
- NEAR token decimals is 24. So if you see a number like "1000000000000000000000000", it means "1 NEAR". Make sure to convert the NEAR token and other token to human readable format.

AVAILABLE TOOLS:
<start>
${toolsDescription}
<end>

PREVIOUS MESSAGES WITH USER:
<start>
${_.map(prevMessages.slice(0, -1), (m) => `${m.role}: ${m.content}`).join("\n")}
<end>

CURRENT GOAL: Answer user query "${_.last(prevMessages)?.content}"

User query context might be in the previous messages. You can use the previous messages to understand the context of the user query.

DO STEP BY STEP

Formulate a plan to answer the user query.

Think about what you need to do through planning and reasoning. The answer may not be direct, you may need to use multiple tools and multiple steps to answer the query.

Action: High level planning
Description: Plan and reason the steps to answer the user query.

Action: Execute
Description: Execute the available tools

Action: Batch Execute
Description: Execute the available tools multiple times simultaneously, DO NOT EXECUTE THE SAME TOOL WITH SAME PARAMETERS.

You can take multiple action and steps.

Normal thinking process would be (but not limited to):

You need LOW_LEVEL_PLANNING every time before EXECUTE/BATCH_EXECUTE and after all EXECUTE/BATCH_EXECUTE are done because you need to observe the data and reflect on the data. The next step might be different from what you planned earlier.

DO NOT USE Batch Execute if the execution parameters are dependent of each other. For example, if you need to get the last 3 blocks and then get the transactions in the last 3 blocks, you cannot use Batch Execute because the second step is dependent on the first step. 

PREFER USING TOOLS THAT RESULT IN DIRECT DATA.

If direct data is not available, iterate and repeat the process until you get the final answer.

Reflect on your action, observation and data gathered.

PLAN and EXECUTE step by step. Don't rush to the final answer.

You should be very precise with the data observation. For example, if you see object { transaction_hash: "0x1234"  } in the data, it means the transaction hash is "0x1234" and you cannot use that to query the block since it is not a block hash.

If the data gathered is not enough to answer the query in the first planning, observe the data and reflect on the data to plan the next steps. You can plan and execute infinitely until you get the final answer. Correct the plan and reasoning based on the data you gathered.

Don't forget that you has "searchInternet" tool. You can use the internet search tool to search the internet for the data. But try to use it after you are sure that other tools cannot give you the data.

You can execute steps infinitely until you get the final answer.

Always use HIGH_LEVEL_PLANNING before answering the final answer. This step is important to prepare, format, and reason the data to be given to the user.

After you are absolutely sure that you get the final answer. Give the final answer to the user.

Proceed without asking for more information.
`

      const schema = z.object({
        TYPE: z.union([
          z.literal("HIGH_LEVEL_PLANNING"),
          z.literal("LOW_LEVEL_PLANNING"),
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
            DATA_SCRATCHPAD: z
              .string()
              .nullable()
              .describe(
                "Temporary data storage for very complex data will persist until final answer is answered."
              ),
          })
          .optional(),
        LOW_LEVEL_PLANNING: z
          .object({
            NAME: z.string().describe("Label for the user to see."),
            SITUATION_ANALYSIS: z.string(),
            PLAN: z.string(),
            PLAN_REASONING: z.string(),
            TASK: z.string(),
            TASK_REASONING: z.string(),
            CHANGE_INDICATOR_NEXT_STEP: z.string().nullable(),
            DATA_SCRATCHPAD: z
              .string()
              .nullable()
              .describe(
                "Temporary data storage for very complex data will persist until final answer is answered."
              ),
          })
          .optional(),
        EXECUTE: z
          .object({
            NAME: z
              .string()
              .describe(
                `Label for the user to see., In format of "EXECUTE {TASK_TOOL}"`
              ),
            THOUGHT: z.string(),
            TASK_TOOL: z
              .string()
              .describe(
                "A name of the tool to be called, can be one of the tools available."
              ),
            TASK_TOOL_PARAMETERS: z.record(z.any()),
          })
          .optional()
          .describe("Execute one of the tools available once using this step."),
        BATCH_EXECUTE: z
          .object({
            NAME: z
              .string()
              .describe(
                'Label for the user to see., In format of "BATCH_EXECUTE {TASKS.length} tasks"'
              ),
            TASKS: z.array(
              z.object({
                TASK_TOOL: z
                  .string()
                  .describe(
                    "A name of the tool to be called, can be one of the tools available."
                  ),
                TASK_TOOL_PARAMETERS: z.record(z.any()),
                THOUGHT: z.string(),
              })
            ),
          })
          .optional(),
        FINAL_ANSWER: z
          .string()
          .describe(
            `
The final answer to the user query.

The final answer should not truncate or miss any important information.

YOU MUST use markdown to format the response.

Display object in markdown's table format.
Display icon/image in markdown's image format using "![{alt}]({url})".

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

        //stream.update({
        //type: "raw_thought",
        //thought: object,
        //})

        if (object.TYPE === "FINAL_ANSWER") break

        stream.update({
          type: "status",
          status: "start",
          label:
            object.HIGH_LEVEL_PLANNING?.NAME ||
            object.LOW_LEVEL_PLANNING?.NAME ||
            object.EXECUTE?.NAME ||
            object.BATCH_EXECUTE?.NAME,
          sublabel:
            object.HIGH_LEVEL_PLANNING?.OBSERVATION_REFLECTION ||
            object.LOW_LEVEL_PLANNING?.SITUATION_ANALYSIS,
        })

        messages.push({
          role: "assistant",
          content: JSON.stringify(object, null, 2),
        })

        if (object.TYPE === "BATCH_EXECUTE") {
          await Promise.all(
            object.BATCH_EXECUTE!.TASKS.map(async (task) => {
              const toolName = task.TASK_TOOL
              const tool = (tools as any)[toolName]
              const toolResponse = await tool.execute(task.TASK_TOOL_PARAMETERS)

              //console.log(
              //"Called",
              //toolName,
              //task.TASK_TOOL_PARAMETERS,
              //toolResponse
              //)
              messages.push({
                role: "assistant",
                content: `
TOOL_NAME: ${toolName}
TASK_TOOL_PARAMETERS: ${JSON.stringify(task.TASK_TOOL_PARAMETERS)}
TOOL_RESPONSE: ${JSON.stringify(toolResponse, null, 2)}`,
              })
            })
          )
        }

        if (object.TYPE === "EXECUTE") {
          const toolName = object.EXECUTE!.TASK_TOOL
          const tool = (tools as any)[toolName]
          const parameters = object.EXECUTE!.TASK_TOOL_PARAMETERS

          const toolResponse = await tool.execute(parameters)

          //console.log("Called", toolName, parameters, toolResponse)
          messages.push({
            role: "assistant",
            content: `
TOOL_NAME: ${toolName}
TASK_TOOL_PARAMETERS: ${JSON.stringify(parameters)}
TOOL_RESPONSE: ${JSON.stringify(toolResponse, null, 2)}`,
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
