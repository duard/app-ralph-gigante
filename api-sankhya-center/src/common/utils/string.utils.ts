/**
 * Remove espaços em branco do início e do fim de todas as strings em um objeto ou array recursivamente.
 * @param obj O objeto ou array a ser processado.
 * @returns O objeto ou array com strings trimadas.
 */
export function trimStrings(obj: any): any {
  if (typeof obj === 'string') {
    return obj.trim()
  } else if (Array.isArray(obj)) {
    return obj.map((item) => trimStrings(item))
  } else if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof Date)
  ) {
    const result: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = trimStrings(obj[key])
      }
    }
    return result
  }
  return obj
}

/**
 * Remove espaços em branco da direita (rtrim) de todas as strings em um objeto ou array recursivamente.
 * @param obj O objeto ou array a ser processado.
 * @returns O objeto ou array com strings rtrimadas.
 */
export function rtrimStrings(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\s+$/, '')
  } else if (Array.isArray(obj)) {
    return obj.map((item) => rtrimStrings(item))
  } else if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof Date)
  ) {
    const result: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = rtrimStrings(obj[key])
      }
    }
    return result
  }
  return obj
}
