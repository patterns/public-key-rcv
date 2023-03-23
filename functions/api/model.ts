declare global {
  interface Crypto {
    sha256(): string
  }
}

export interface Key {
  id: string
  body: string
}

export type Param = {
  locator: string
  body: string
}

const generateID = (loc: string) => {
  return sha256(loc)
}

export const getKey = async (KV: KVNamespace, loc: string): Promise<Key | undefined> => {
  const value = await KV.get(generateID(loc))
  if (!value) return
  const key: Key = JSON.parse(value)
  return key
}

export const createKey = async (KV: KVNamespace, param: Param): Promise<Key | undefined> => {
  if (!(param && param.locator && param.body)) return
  const sum = generateID(param.locator)
  const newKey: Key = { id: sum, body: param.body }
  await KV.put(sum, JSON.stringify(newKey))
  return newKey
}

