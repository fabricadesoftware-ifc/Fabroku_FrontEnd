import { getHttpErrorData } from '@/shared/errors/http-error'

export function formatServiceError (error: unknown, fallback: string) {
  const data = getHttpErrorData(error)
  if (!data) {
    return fallback
  }
  if (typeof data === 'string') {
    return data
  }
  if (data.quota) {
    return `Limite de serviços atingido: você possui ${data.current} de ${data.limit} serviços permitidos.`
  }
  if (typeof data.error === 'string') {
    return data.error
  }
  if (typeof data.detail === 'string') {
    return data.detail
  }

  const fieldErrors = data.name || data.non_field_errors
  if (Array.isArray(fieldErrors)) {
    return fieldErrors.join(' ')
  }
  if (typeof fieldErrors === 'string') {
    return fieldErrors
  }
  return fallback
}
