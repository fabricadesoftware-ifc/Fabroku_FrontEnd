import axios from 'axios'

export type HttpErrorData = Record<string, any> | string | null

export function getHttpErrorData (error: unknown): HttpErrorData {
  if (!axios.isAxiosError(error)) {
    return null
  }
  return (error.response?.data as HttpErrorData | undefined) ?? null
}

export function getHttpErrorMessage (error: unknown, fallback: string): string {
  const data = getHttpErrorData(error)
  if (typeof data === 'string' && data.trim() && !data.trimStart().startsWith('<')) {
    return data
  }
  if (data && typeof data === 'object') {
    for (const key of ['error', 'message', 'detail']) {
      if (typeof data[key] === 'string' && data[key]) {
        return data[key]
      }
    }
  }
  return fallback
}
