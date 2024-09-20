import _ from "lodash"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { z } from "zod"

const ethereum = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-pokt.nodies.app"),
})

export const getAddressFromName = {
  description: "Get the address from the name",
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
    return address
  },
}
