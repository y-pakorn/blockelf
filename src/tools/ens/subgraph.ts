import { tool } from "ai"
import axios from "axios"
import BigNumber from "bignumber.js"
import _ from "lodash"
import { z } from "zod"

import { env } from "@/env.mjs"
import dayjs from "@/lib/dayjs"

export const ensSubgraphTools = {
  getENSProposals: tool({
    description:
      "Get the ENS (Ethereum Name Service) governance proposals by the keyword or search term in descending order",
    parameters: z.object({
      keyword: z
        .string()
        .describe(
          "The keyword or search term to search for, e.g. 'revenue', 'successful'. Empty string will return all proposals"
        ),
      limit: z
        .number()
        .lte(10)
        .optional()
        .default(5)
        .describe(
          "The maximum number of proposals to return. Default is 5, maximum is 20, and minimum is 1"
        ),
      skip: z
        .number()
        .optional()
        .default(0)
        .describe("The number of proposals to skip"),
    }),
    execute: async ({ keyword, skip, limit }) => {
      const now = _.now()
      const endpoint = `https://gateway.thegraph.com/api/${env.ENS_API_KEY}/subgraphs/id/GyijYxW9yiSRcEd5u2gfquSvneQKi5QuvU3WZgFyfFSn`
      const resp = await axios.post(endpoint, {
        query: `
          query Proposals($where: Proposal_filter, $skip: Int, $first: Int, $orderBy: Proposal_orderBy, $orderDirection: OrderDirection) {
            proposals(where: $where, skip: $skip, first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
              description
              state
              abstainDelegateVotes
              abstainWeightedVotes
              againstDelegateVotes
              againstWeightedVotes
              forWeightedVotes
              forDelegateVotes
              creationTime
            }
          }
        `,
        variables: {
          where: {
            description_contains: keyword,
          },
          skip,
          first: limit,
          orderBy: "creationTime",
          orderDirection: "desc",
        },
      })

      const data = resp.data.data.proposals

      const formatted = data.map((proposal: any) => {
        const totalVotes = new BigNumber(proposal.forWeightedVotes)
          .plus(proposal.againstWeightedVotes)
          .plus(proposal.abstainWeightedVotes)
        const forVotePercentage = new BigNumber(proposal.forWeightedVotes)
          .dividedBy(totalVotes)
          .multipliedBy(100)
          .toFixed(2)
        const againstVotePercentage = new BigNumber(
          proposal.againstWeightedVotes
        )
          .dividedBy(totalVotes)
          .multipliedBy(100)
          .toFixed(2)
        const abstainVotePercentage = new BigNumber(
          proposal.abstainWeightedVotes
        )
          .dividedBy(totalVotes)
          .multipliedBy(100)
          .toFixed(2)
        return {
          description: proposal.description,
          forVotePercentage,
          againstVotePercentage,
          abstainVotePercentage,
          forVoteCount: proposal.forDelegateVotes,
          againstVoteCount: proposal.againstDelegateVotes,
          abstainVoteCount: proposal.abstainDelegateVotes,
          creationTime: proposal.creationTime,
          creationTimeReadable: new Date(
            proposal.creationTime * 1000
          ).toLocaleString(),
          creationTimeRelative: dayjs(proposal.creationTime * 1000).fromNow(),
        }
      })
      console.log("getENSProposals took", _.now() - now, "ms")
      return {
        proposals: formatted,
      }
    },
  }),
}
