import type { AppRepository } from '@/modules/applications/application/ports/app-repository'
import type { App } from '@/modules/applications/domain/models'

import { ref } from 'vue'

import {
  DeleteApplication,
  RedeployApplication,
  RestartApplication,
  StartApplication,
  StopApplication,
} from '@/modules/applications/application/use-cases/application-use-cases'

interface AppActionsOptions {
  repository: AppRepository
  appId: string
  getApp: () => App | null
  setApp: (app: App) => void
}

function applyTask (app: App | null, task: Pick<App, 'task_id'>, status: App['status']) {
  if (!app) {
    return
  }
  app.task_id = task.task_id
  app.status = status
}

export function useAppActions (options: AppActionsOptions) {
  const deleting = ref(false)
  const starting = ref(false)
  const stopping = ref(false)
  const restarting = ref(false)
  const redeploying = ref(false)

  const deleteApplication = new DeleteApplication(options.repository)
  const startApplication = new StartApplication(options.repository)
  const stopApplication = new StopApplication(options.repository)
  const restartApplication = new RestartApplication(options.repository)
  const redeployApplication = new RedeployApplication(options.repository)

  async function remove () {
    deleting.value = true
    try {
      const result = await deleteApplication.execute(options.appId)
      applyTask(options.getApp(), result, 'DELETING')
      return result
    } finally {
      deleting.value = false
    }
  }

  async function start () {
    starting.value = true
    try {
      const result = await startApplication.execute(options.appId)
      if (result.task_id) {
        applyTask(options.getApp(), result, 'STARTING')
      } else {
        options.setApp(result)
      }
      return result
    } finally {
      starting.value = false
    }
  }

  async function stop () {
    stopping.value = true
    try {
      const result = await stopApplication.execute(options.appId)
      options.setApp(result)
      return result
    } finally {
      stopping.value = false
    }
  }

  async function restart () {
    restarting.value = true
    try {
      const result = await restartApplication.execute(options.appId)
      if (result.task_id) {
        applyTask(options.getApp(), result, 'STARTING')
      } else {
        options.setApp(result)
      }
      return result
    } finally {
      restarting.value = false
    }
  }

  async function redeploy () {
    redeploying.value = true
    try {
      const result = await redeployApplication.execute(options.appId)
      applyTask(options.getApp(), result, 'DEPLOYING')
      return result
    } finally {
      redeploying.value = false
    }
  }

  return { deleting, starting, stopping, restarting, redeploying, remove, start, stop, restart, redeploy }
}
