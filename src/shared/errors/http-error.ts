import axios from 'axios'

export type HttpErrorData = Record<string, any> | string | null

export function getHttpErrorData (error: unknown): HttpErrorData {
  if (!axios.isAxiosError(error)) {
    return null
  }
  return (error.response?.data as HttpErrorData | undefined) ?? null
}
