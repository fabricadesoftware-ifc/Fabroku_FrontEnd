import type { ServiceRepository } from '@/modules/services/application/ports/service-repository'
import type { Service, ServiceType } from '@/modules/services/domain/models'

import { ref } from 'vue'

import { getHttpErrorData } from '@/shared/errors/http-error'

interface AppServicesOptions {
  serviceRepository: ServiceRepository
  appId: () => number | undefined
  projectId: string
  waitForTask: (taskId?: string) => Promise<unknown>
}

export function useAppServices (options: AppServicesOptions) {
  const services = ref<Service[]>([])
  const availableServices = ref<Service[]>([])
  const creating = ref(false)
  const linking = ref(false)
  const unlinkingId = ref<number | null>(null)
  const deletingId = ref<number | null>(null)
  const error = ref('')
  const linkError = ref('')

  async function fetch () {
    const appId = options.appId()
    if (!appId) {
      return
    }
    try {
      const response = await options.serviceRepository.getByApp(appId)
      services.value = response.results
    } catch (error_) {
      console.error('Erro ao buscar serviços:', error_)
    }
  }

  function isReady (service: Service) {
    return Boolean(service.container_name) && !service.task_id
  }

  function formatOption (service: Service) {
    const labels: Record<ServiceType, string> = {
      postgres: 'PostgreSQL',
      postgis: 'PostGIS',
      redis: 'Redis',
      rabbitmq: 'RabbitMQ',
    }
    return `${service.name} · ${labels[service.service_type]}`
  }

  function formatError (error_: unknown, fallback: string) {
    const data = getHttpErrorData(error_)
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

  async function createDatabase (serviceType: ServiceType) {
    const appId = options.appId()
    if (!appId) {
      return
    }
    creating.value = true
    error.value = ''
    try {
      const result = await options.serviceRepository.create({ app: appId, service_type: serviceType })
      await options.waitForTask(result.task_id ?? undefined)
      await fetch()
      return result
    } catch (error_) {
      error.value = formatError(error_, 'Não foi possível criar o banco de dados. Tente novamente.')
      throw error_
    } finally {
      creating.value = false
    }
  }

  async function openLinkOptions () {
    try {
      const response = await options.serviceRepository.getByProject(options.projectId)
      linkError.value = ''
      availableServices.value = response.results.filter(service => !service.app && isReady(service))
      return availableServices.value
    } catch (error_) {
      linkError.value = formatError(error_, 'Não foi possível carregar os serviços disponíveis.')
      throw error_
    }
  }

  async function link (serviceId: number) {
    const appId = options.appId()
    if (!appId) {
      return
    }
    linking.value = true
    linkError.value = ''
    try {
      const result = await options.serviceRepository.link(serviceId, appId)
      await options.waitForTask(result.task_id)
      await fetch()
      return result
    } catch (error_) {
      linkError.value = formatError(error_, 'Não foi possível vincular o serviço.')
      throw error_
    } finally {
      linking.value = false
    }
  }

  async function unlink (serviceId: number) {
    unlinkingId.value = serviceId
    try {
      const result = await options.serviceRepository.unlink(serviceId)
      await options.waitForTask(result.task_id)
      await fetch()
      return result
    } finally {
      unlinkingId.value = null
    }
  }

  async function remove (serviceId: number) {
    deletingId.value = serviceId
    try {
      const result = await options.serviceRepository.remove(serviceId)
      await options.waitForTask(result.task_id)
      await fetch()
      return result
    } finally {
      deletingId.value = null
    }
  }

  return {
    services,
    availableServices,
    creating,
    linking,
    unlinkingId,
    deletingId,
    error,
    linkError,
    fetch,
    createDatabase,
    openLinkOptions,
    link,
    unlink,
    remove,
    isReady,
    formatOption,
    formatError,
  }
}
