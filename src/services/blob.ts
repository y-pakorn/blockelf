import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import { put } from "@vercel/blob"

import { dataUrlToFile, isValidHttpUrl } from "@/lib/utils"

export const dataUrlToBlobUrl = async (dataUrl: string) => {
  if (!dataUrl) return ""
  const fileNameFromHashed = bytesToHex(sha256(dataUrl))
  const file = await dataUrlToFile(dataUrl, fileNameFromHashed)
  return await put(fileNameFromHashed, file, {
    access: "public",
  }).then((res) => res.url)
}

export const possibleDataUrlToBlobUrl = async (dataUrl: string) => {
  return isValidHttpUrl(dataUrl) ? dataUrl : await dataUrlToBlobUrl(dataUrl)
}
