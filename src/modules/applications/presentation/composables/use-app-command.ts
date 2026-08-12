import type { AppRepository } from '@/modules/applications/application/ports/app-repository'

import { ref } from 'vue'

import {
  GetApplicationStatus,
  RunApplicationCommand,
} from '@/modules/applications/application/use-cases/application-use-cases'
import { usePolling } from '@/shared/composables/use-polling'
import { getHttpErrorData } from '@/shared/errors/http-error'

interface AppCommandOptions {
  repository: AppRepository
  appId: string
  setTaskId?: (taskId: string) => void
}

export function useAppCommand (options: AppCommandOptions) {
  const running = ref(false)
  const output = ref('')
  const success = ref(true)
  const polling = usePolling()
  const runApplicationCommand = new RunApplicationCommand(options.repository)
  const getApplicationStatus = new GetApplicationStatus(options.repository)

  function clear () {
    output.value = ''
    success.value = true
  }

  async function run (command: string) {
    if (!command.trim()) {
      return
    }
    running.value = true
    output.value = ''
    success.value = true

    try {
      const result = await runApplicationCommand.execute(options.appId, command.trim())
      if (!result.task_id) {
        running.value = false
        return
      }
      options.setTaskId?.(result.task_id)

      let attempts = 0
      const pollCommand = async () => {
        attempts++
        try {
          const status = await getApplicationStatus.execute(options.appId)
          if (status.state === 'SUCCESS') {
            output.value = 'Comando executado com sucesso! Veja detalhes nos Logs abaixo.'
            running.value = false
            polling.stop()
          } else if (status.state === 'FAILURE') {
            output.value = status.status || 'Erro ao executar comando'
            success.value = false
            running.value = false
            polling.stop()
          } else if (attempts > 30) {
            output.value = 'Comando ainda em execução. Acompanhe o progresso nos Logs abaixo.'
            running.value = false
            polling.stop()
          }
        } catch {
          if (attempts > 30) {
            polling.stop()
          }
        }
      }

      polling.start(() => pollCommand(), 2000)
    } catch (error_) {
      const data = getHttpErrorData(error_)
      if (data && typeof data !== 'string' && typeof data.error === 'string') {
        output.value = data.error
        if (Array.isArray(data.allowed_commands)) {
          output.value += '\n\nComandos permitidos:\n' + data.allowed_commands.join('\n')
        }
      } else {
        output.value = 'Erro ao executar comando'
      }
      success.value = false
      running.value = false
    }
  }

  return { running, output, success, clear, run }
}
