import type { Service } from '@/modules/services/domain/models'

export type AppStatus
  = | 'STOPPED'
    | 'RUNNING'
    | 'ERROR'
    | 'STARTING'
    | 'DELETING'
    | 'DELETED'
    | 'DEPLOYING'
    | 'RESTARTING'
    | 'STOPPING'
    | 'FAILED'

export interface App {
  id?: number
  name: string
  git: string
  branch?: string
  project: string | undefined
  created_at?: string
  updated_at?: string
  status?: AppStatus
  domain?: string | null
  port?: number | null
  variables?: Record<string, string> | object
  task_id?: string | null
  name_dokku?: string | null
  is_owner?: boolean
  services?: Service[]
  last_commit_sha?: string
}

export interface AppProcessScale {
  id?: number
  process_name: string
  quantity: number
  desired_quantity: number
  current_quantity: number
  detected_at?: string
  last_synced_at?: string | null
  updated_at?: string
}

export interface TaskStatus {
  task_id: string
  state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE' | 'UNKNOWN'
  current?: number
  total?: number
  status?: string
}

export interface LastCommit {
  sha: string
  sha_short: string
  message: string
  author: string
  date: string
  url: string
}

export interface UpdateEnvVarsResult {
  app: App
  updated_keys: string[]
  removed_keys: string[]
  restarted: boolean
}
