"use server"

import { nearAccountTools } from "@/tools/accounts"
import { Message } from "@/types"
import { generateObject, generateText, streamText } from "ai"
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
  delta: string
}

export const submitMessage = async (
  messages: Message[],
  model: string = DEFAULT_MODEL,
  temperature?: number
) => {
  "use server"

  const stream = createStreamableValue<StreamResponse>()

  ;(async () => {
    try {
      const tools = {
        ...nearAccountTools,
      }

      const toolsDescription = _.chain(tools)
        .entries()
        .map(
          ([name, t], i) => `
Tool ${i}: ${name}
Description: ${(t as any).description}
Parameters:
${_.map(t.parameters.shape, (p, name) => `${name}: ${p.description}`).join(",\n")}
        `
        )
        .join("\n")
        .value()

      const system = `
You are NEAR Protocol's AI assistant and query resolver.
      `

      const p = `
Formulate plan to achieve "${_.last(messages)?.content}"

List all the steps you will take to achieve the goal.

If provided tools are needed to achieve the goal, explicitly mention their usage in the step.

Be detailed as possible in the steps, mention the expected result and the tools you will use to achieve it.

You can use the following tools:

${toolsDescription}

If there are any data that is not available even after using the tools, resulting in a dead end, do not continue, directly mention the dead end and the reason for it.

Do not add any unnecessary steps, only add steps that are necessary to achieve the goal.

If any of the steps can be ran in parallel, put them in the same step number.

PREVIOUS MESSAGES:
<start>
${_.map(
  messages,
  (m) => `
${m.role}: ${m.content}
  `
)}
<end>
      `
      const { object: steps } = await generateObject({
        model: openrouter(model),
        system,
        prompt: p,
        mode: "json",
        schema: z.object({
          plan: z.array(
            z.object({
              step: z.number(),
              title: z.string(),
              description: z.string(),
              reason: z.string(),
            })
          ),
        }),
        temperature,
        maxRetries: 5,
      })

      const results: {
        step: number
        title: string
        description: string
        result: string
        data?: string
      }[] = []

      for (const step of steps.plan) {
        stream.update({
          type: "status",
          status: "start",
          label: step.title,
        })
        const response = await generateText({
          model: openrouter(model),
          system,
          prompt: `
You are trying to achieve "${_.last(messages)?.content}".

These are previous steps and their results, THIS LIST ARE READ ONLY DO NOT INTERACT OR MODIFY:
<start>
${_.map(
  results,
  (r) => `
Step ${r.step}: ${r.title}
${r.description}
Result: ${r.result}
Data: ${r.data}
`
).join("\n")}
<end>

This is now step ${step.step}: ${step.title}
${step.description}

If this step expects a result from tool as step response, directly return the result as your result as text.

Your result:
          `,

          tools,
          toolChoice: "required",
          maxSteps: 10,
          temperature,
        })
        const toolsData = response.responseMessages
          .filter((d) => d.role === "tool")
          .map((d) => d.content)
          .flat()
          .map((d) => {
            if (typeof d !== "string" && d.type === "tool-result") {
              return d
            }
          })
          .filter((d) => d !== undefined)
        results.push({
          ...step,
          result: response.text,
          data: JSON.stringify(toolsData, null, 4),
        })
        stream.update({
          type: "status",
          status: "end",
        })
      }

      stream.update({
        type: "status",
        status: "start",
        label: "Formulating final answer to the question",
      })

      const finalResult = await streamText({
        model: openrouter(model),
        system,
        prompt: `
You are trying to achieve "${_.last(messages)?.content}".

These are previous steps and their results, THIS LIST ARE READ ONLY DO NOT INTERACT OR MODIFY:
<start>
${_.map(
  results,
  (r) => `
Step ${r.step}: ${r.title}
${r.description}
Result: ${r.result}
Data: ${r.data}
`
).join("\n")}
<end>

Formulate the final answer to the question.
The final answer should not truncate or miss any important information.

YOU MUST use markdown to format the response.

Display object in markdown's table format.
The data you gave out should be human readable and easy to understand.

DO NOT mention any tools or steps or previous step data in the final answer. The final answer is only thing the user will see.

Your final answer:
`,
        temperature,
      })

      stream.update({
        type: "status",
        status: "end",
      })

      for await (const detail of finalResult.fullStream) {
        if (detail.type === "text-delta")
          stream.update({
            type: "text",
            delta: detail.textDelta,
          })
      }
    } catch (e) {
      console.error(e)
    } finally {
      stream.done()
    }
  })()

  return {
    messages,
    stream: stream.value,
    error: null,
  }
}
