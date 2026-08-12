export type ServiceType = 'postgres' | 'postgis' | 'redis' | 'rabbitmq'

export interface Service {
  id?: number
  name: string
  service_type: ServiceType
  app?: number | null
  project: string | number
  container_name?: string | null
  env_key?: string | null
  image?: string | null
  image_version?: string | null
  host?: string
  port?: number
  task_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateServiceInput {
  app?: number
  project?: number | string
  service_type: ServiceType
  name?: string
}
