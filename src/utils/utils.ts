import { Request } from 'express'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export function fetchIP(req: Request) {
  let xForwarded = req.headers['x-real-ip'] as string
  if (!xForwarded) {
    xForwarded =
      (req.headers['x-forwarded-for'] as string) || (req.ip as string)
  }
  const arr = xForwarded.split(':')
  return arr[arr.length - 1] || ''
}

/**
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export async function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt)
        return [parsedError, undefined]
      }
      return [err, undefined]
    })
}

export const i18n = {
  t: (msg: string, lang?: string) => {
    if (!lang) return msg
    const filePath = join(__dirname, `../../public/locales/${lang}.json`)
    if (!existsSync(filePath)) return msg
    const content = readFileSync(filePath).toString()
    const json = JSON.parse(content)
    // 先不考虑变量
    return json[msg] ?? msg
  }
}
