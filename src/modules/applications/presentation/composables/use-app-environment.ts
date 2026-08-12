import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type { App } from '@/modules/applications/domain/models'

import { ref } from 'vue'

import { UpdateApplicationEnvironment } from '@/modules/applications/application/use-cases/application-use-cases'

interface EnvironmentEntry {
  key: string
  value: string
}

export function useAppEnvironment (
  repository: AppRepository,
  appId: string,
  getApp: () => App | null,
  setApp: (app: App) => void,
) {
  const saving = ref(false)
  const updateEnvironment = new UpdateApplicationEnvironment(repository)

  async function save (variables: Record<string, string>) {
    saving.value = true
    try {
      const response = await updateEnvironment.execute(appId, variables)
      setApp(response.app)
      return response
    } finally {
      saving.value = false
    }
  }

  function currentVariables () {
    return { ...((getApp()?.variables ?? {}) as Record<string, string>) }
  }

  async function add (entry: EnvironmentEntry) {
    return save({ ...currentVariables(), [entry.key]: entry.value })
  }

  async function addMultiple (entries: EnvironmentEntry[]) {
    const variables = currentVariables()
    for (const entry of entries) {
      variables[entry.key] = entry.value
    }
    return save(variables)
  }

  async function update (oldKey: string, entry: EnvironmentEntry) {
    const variables = currentVariables()
    if (oldKey !== entry.key) {
      delete variables[oldKey]
    }
    variables[entry.key] = entry.value
    return save(variables)
  }

  async function remove (key: string) {
    const variables = currentVariables()
    delete variables[key]
    return save(variables)
  }

  return { saving, save, add, addMultiple, update, remove }
}
