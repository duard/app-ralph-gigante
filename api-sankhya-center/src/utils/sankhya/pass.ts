import { createHash } from 'crypto'

export function hashString(input: string): string {
  return createHash('md5').update(input).digest('hex')
}

export function sqlVarBaseToStr(nomeUsu: string, cgc: string): string {
  const concatenatedString = (nomeUsu + cgc).trim()
  return hashString(concatenatedString)
}
