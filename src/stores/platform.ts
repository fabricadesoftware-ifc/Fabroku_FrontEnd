import type { PlatformConfig } from '@/modules/platform/domain/models'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { GetPlatformConfig } from '@/modules/platform/application/use-cases/get-platform-config'
import { platformRepository } from '@/modules/platform/infrastructure/http/platform-repository'

const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  organization_name: 'Fábrica de Software',
  privileged_role_label: 'Membro da Fábrica',
  regular_role_label: 'Aluno',
  app_domain_suffix: '.class.fabricadesoftware.ifc.edu.br',
}

export const usePlatformStore = defineStore('platform', () => {
  const config = ref<PlatformConfig>({ ...DEFAULT_PLATFORM_CONFIG })
  const loading = ref(false)
  const loaded = ref(false)
  const getPlatformConfig = new GetPlatformConfig(platformRepository)

  const organizationName = computed(() => config.value.organization_name)
  const privilegedRoleLabel = computed(() => config.value.privileged_role_label)
  const regularRoleLabel = computed(() => config.value.regular_role_label)
  const appDomainSuffix = computed(() => config.value.app_domain_suffix)

  async function fetchConfig (force = false) {
    if (loaded.value && !force) {
      return config.value
    }

    loading.value = true
    try {
      config.value = await getPlatformConfig.execute()
      loaded.value = true
    } catch (error) {
      console.warn('Não foi possível carregar a configuração da instalação.', error)
      loaded.value = true
    } finally {
      loading.value = false
    }

    return config.value
  }

  return {
    appDomainSuffix,
    config,
    fetchConfig,
    loaded,
    loading,
    organizationName,
    privilegedRoleLabel,
    regularRoleLabel,
  }
})
