import { tool } from "ai"
import _ from "lodash"
import { Address, createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { z } from "zod"

const ethereum = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-pokt.nodies.app"),
})

export const ensNameTools = {
  getAddressFromName: tool({
    description: "Get the address from the ens (.eth) name",
    parameters: z.object({
      name: z
        .string()
        .describe(
          "The ens name the format is 'something.eth' only without anything else, e.g. 'vitalik.eth'"
        ),
    }),
    execute: async ({ name }: { name: string }) => {
      const now = _.now()
      const address = await ethereum.getEnsAddress({
        name,
      })
      console.log("getEnsAddress took", _.now() - now, "ms")
      return {
        address,
      }
    },
  }),
  getNamesFromAddress: tool({
    description: "Get the ens (.eth) name from the address",
    parameters: z.object({
      address: z.string().describe("The address to get the ens name from"),
    }),
    execute: async ({ address }: { address: string }) => {
      const now = _.now()
      const name = await ethereum.getEnsName({
        address: address as Address,
      })
      console.log("getEnsName took", _.now() - now, "ms")
      return {
        name,
      }
    },
  }),
}
