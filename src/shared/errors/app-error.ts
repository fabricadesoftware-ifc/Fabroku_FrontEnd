export type AppErrorKind
  = | 'network'
    | 'authentication'
    | 'authorization'
    | 'validation'
    | 'not-found'
    | 'conflict'
    | 'unknown'

export class AppError extends Error {
  readonly kind: AppErrorKind
  readonly status?: number
  readonly details?: unknown

  constructor (
    message: string,
    options: {
      kind?: AppErrorKind
      status?: number
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.kind = options.kind || 'unknown'
    this.status = options.status
    this.details = options.details
  }
}

export function isAppError (error: unknown): error is AppError {
  return error instanceof AppError
}
