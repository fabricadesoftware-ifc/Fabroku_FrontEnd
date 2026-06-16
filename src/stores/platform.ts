import type { PlatformConfig } from '@/interfaces'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import PlatformService from '@/services/platform'

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
      config.value = await PlatformService.getConfig()
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
