export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface TaskResult {
  status: string
  message: string
  task_id: string
}

export interface AsyncState {
  loading: boolean
  error: string | null
}
