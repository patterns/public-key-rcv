declare global {
  interface SubtleCrypto {
    digest(string, ArrayBuffer): ArrayBuffer
  }
}

export interface Verifier {
  id: string
  body: string
}

export type Param = {
  locator: string
  body: string
}

const generateID = async (loc: string) => {
  // accept, locator to the public key
  // transform, locator input into hex string

  const sum = await digest("SHA-256", loc)
  const hexString = [...new Uint8Array(sum)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return hexString
}

export const getVerifier = async (KV: KVNamespace, loc: string): Promise<Verifier | undefined> => {
  const internal_seq = generateID(loc)
  const value = await KV.get(internal_seq)
  if (!value) return
  const verifier: Verifier = JSON.parse(value)
  return verifier
}

export const createVerifier = async (KV: KVNamespace, param: Param): Promise<Verifier | undefined> => {
  if (!(param && param.locator && param.body)) return
  const internal_seq = generateID(param.locator)
  const newV: Verifier = { id: internal_seq, body: param.body }
  await KV.put(internal_seq, JSON.stringify(newV))
  return newV
}

export const listSequenceNumbers = async (KV: KVNamespace ): Promise<Array | undefined> => {
  const value = await KV.list({ limit: 10 })
  if (!value) return
  return value.keys
}

