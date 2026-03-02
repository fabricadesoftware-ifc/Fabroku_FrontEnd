<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push(`/projects/${projectId}`)"
    >
      Voltar para Projeto
    </v-btn>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="appStore.currentApp">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center">
          <v-icon
            class="mr-3"
            :color="getStatusColor(appStore.currentApp.status)"
            size="32"
          >
            {{ getStatusIcon(appStore.currentApp.status) }}
          </v-icon>
          <div>
            <h1 class="text-h4">{{ appStore.currentApp.name }}</h1>
            <v-chip
              class="mt-1"
              :color="getStatusColor(appStore.currentApp.status)"
              size="small"
            >
              {{ formatStatus(appStore.currentApp.status) }}
            </v-chip>
          </div>
        </div>
        <v-btn
          color="primary"
          :loading="refreshing"
          prepend-icon="mdi-refresh"
          variant="tonal"
          @click="refreshStatus"
        >
          Atualizar Status
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <!-- Card de Progresso da Task -->
          <v-card
            v-if="
              appStore.currentApp.task_id &&
                ['STARTING', 'DELETING', 'DEPLOYING'].includes(appStore.currentApp.status ?? '')
            "
            class="mb-4"
            :color="
              appStore.currentApp.status === 'DELETING' ? 'pink'
              : appStore.currentApp.status === 'DEPLOYING' ? 'orange'
                : 'primary'
            "
            variant="tonal"
          >
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2 mdi-spin">mdi-loading</v-icon>
              {{
                appStore.currentApp.status === "DELETING"
                  ? "Deletando App..."
                  : appStore.currentApp.status === "DEPLOYING"
                    ? "Fazendo deploy..."
                    : "Criando App..."
              }}
            </v-card-title>
            <v-card-text>
              <div v-if="appStore.taskStatus" class="mb-2">
                <div class="d-flex justify-space-between mb-1">
                  <span>{{ formatStatus(appStore.taskStatus.status) }}</span>
                  <span>{{ appStore.taskStatus.current }}%</span>
                </div>
                <v-progress-linear
                  :color="
                    appStore.currentApp.status === 'DELETING'
                      ? 'pink'
                      : 'primary'
                  "
                  height="8"
                  :model-value="appStore.taskStatus.current"
                  rounded
                />
              </div>
              <div v-else class="text-center">
                <v-progress-circular indeterminate size="24" />
                <span class="ml-2">Carregando progresso...</span>
              </div>
            </v-card-text>
          </v-card>

          <AppDetailsCard :app="appStore.currentApp" />

          <AppPreviewCard :app="appStore.currentApp" />

          <AppEnvVarsCard
            :saving="savingEnvVar"
            :variables="
              appStore.currentApp.variables as
                | Record<string, string>
                | undefined
            "
            @add="handleAddEnvVar"
            @remove="removeEnvVar"
          />

        </v-col>

        <v-col cols="12" md="4">
          <AppActionsCard
            :app-name="appStore.currentApp.name"
            :deleting="deleting"
            :domain="appStore.currentApp.domain"
            :restarting="restarting"
            :starting="starting"
            :status="appStore.currentApp.status"
            :stopping="stopping"
            @delete="handleDeleteApp"
            @diagnose="diagnoseAppError"
            @restart="handleRestartApp"
            @start="handleStartApp"
            @stop="handleStopApp"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Dialog para vincular serviço existente -->
    <v-dialog v-model="linkServiceDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Vincular banco existente</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedServiceToLink"
            item-title="name"
            item-value="id"
            :items="availableServicesToLink"
            label="Selecione o serviço"
            variant="outlined"
          />
          <v-alert
            v-if="availableServicesToLink.length === 0"
            class="mt-3"
            color="info"
            density="compact"
            variant="tonal"
          >
            Nenhum serviço disponível. Crie um em
            <router-link :to="`/projects/${projectId}/services/new`">Serviços do projeto</router-link>.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="linkServiceDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!selectedServiceToLink"
            :loading="linkingService"
            @click="handleLinkService"
          >
            Vincular
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Logs da Aplicação -->
    <v-row v-if="appStore.currentApp">
      <v-col cols="12">
        <AppLogsCard
          :loading="logsLoading"
          :logs="displayLogs"
          :output="commandOutput"
          :running="runningCommand"
          :success="commandSuccess"
          :task-id="deployTaskId"
          :title="logsTitle"
          @clear="handleClearCommand"
          @run="handleRunCommand"
          @stream-logs="handleStreamLogs"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
    // Diagnóstico manual de erro
  import type { Service } from '@/interfaces'

  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import AppActionsCard from '@/components/projects/AppActionsCard.vue'
  import AppDatabaseCard from '@/components/projects/AppDatabaseCard.vue'
  import AppDetailsCard from '@/components/projects/AppDetailsCard.vue'
  import AppEnvVarsCard from '@/components/projects/AppEnvVarsCard.vue'
  import AppLogsCard from '@/components/projects/AppLogsCard.vue'
  import AppPreviewCard from '@/components/projects/AppPreviewCard.vue'
  import AppsService from '@/services/apps'
  import LogsService from '@/services/logs'
  import ServicesService from '@/services/services'
  import { useAppStore, useLogStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'
  async function diagnoseAppError () {
    if (!appStore.currentApp?.id) return
    try {
      const status = await appStore.fetchAppStatus(String(appStore.currentApp.id))
      if (
        status?.state === 'FAILURE'
        && (status as any).error_type === 'DeployKeysDisabled'
      ) {
        router.push({
          path: '/projects/deploy-keys-disabled',
          query: { help_url: (status as any).help_url || undefined },
        })
        return
      }
      if (
        status?.state === 'FAILURE'
        && (status as any).error_type === 'OrgPermissionDenied'
      ) {
        router.push({
          path: '/projects/org-permission-denied',
          query: { help_url: (status as any).help_url || undefined },
        })
        return
      }
      // Pode adicionar outros diagnósticos aqui
      alert('Nenhum problema crítico detectado. Veja os logs para mais detalhes.')
    } catch {
      alert('Erro ao diagnosticar. Tente novamente.')
    }
  }

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''
  const appId = (route.params as { appId: string }).appId || ''

  const appStore = useAppStore()
  const logStore = useLogStore()
  const loading = ref(true)
  const refreshing = ref(false)
  const savingEnvVar = ref(false)
  const deleting = ref(false)
  const starting = ref(false)
  const stopping = ref(false)
  const restarting = ref(false)
  const taskPollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

  // Estado do banco de dados
  const appServices = ref<Service[]>([])
  const creatingDatabase = ref(false)
  const linkingService = ref(false)
  const unlinkingService = ref<number | null>(null)
  const deletingService = ref<number | null>(null)
  const linkServiceDialog = ref(false)
  const availableServicesToLink = ref<Service[]>([])
  const selectedServiceToLink = ref<number | null>(null)

  // Estado do console de comandos
  const runningCommand = ref(false)
  const commandOutput = ref('')
  const commandSuccess = ref(true)

  // Logs runtime (quando app está RUNNING)
  const runtimeLogsLines = ref<string[]>([])
  const runtimeLogsLoading = ref(false)
  let runtimePollInterval: ReturnType<typeof setInterval> | null = null

  const isRunning = computed(() => appStore.currentApp?.status === 'RUNNING')
  const displayLogs = computed(() => {
    if (isRunning.value) {
      return runtimeLogsLines.value.map((line, i) => ({
        id: i,
        message: line,
        level: 'DOKKU' as const,
        app: appStore.currentApp?.id ?? 0,
        created_at: undefined,
      }))
    }
    return logStore.logs
  })
  const logsLoading = computed(() => {
    if (isRunning.value) return runtimeLogsLoading.value
    return logStore.loading
  })
  const deployTaskId = computed(() => {
    if (isRunning.value) return undefined
    return appStore.currentApp?.task_id ?? undefined
  })
  const logsTitle = computed(() => {
    if (isRunning.value) return 'Logs da Aplicação'
    return 'Deploy Logs'
  })

  async function fetchRuntimeLogs () {
    if (!appStore.currentApp?.id || !appStore.currentApp?.name_dokku) return
    runtimeLogsLoading.value = true
    try {
      const { lines } = await LogsService.getAppRuntimeLogs(appStore.currentApp.id, 200)
      runtimeLogsLines.value = lines
    } catch (error) {
      console.error('Erro ao buscar logs do app:', error)
      runtimeLogsLines.value = []
    } finally {
      runtimeLogsLoading.value = false
    }
  }

  function startRuntimeLogsPolling () {
    if (runtimePollInterval) return
    fetchRuntimeLogs()
    runtimePollInterval = setInterval(fetchRuntimeLogs, 4000)
  }

  function stopRuntimeLogsPolling () {
    if (runtimePollInterval) {
      clearInterval(runtimePollInterval)
      runtimePollInterval = null
    }
  }

  // --- Stream de logs em tempo real ---
  let logStreamActive = false
  function shouldStreamLogs () {
    const status = appStore.currentApp?.status
    return [
      'FAILED', 'ERROR', 'STARTING', 'DELETING', 'DEPLOYING',
    ].includes(status || '')
  }

  async function startLogStreamIfNeeded () {
    if (!appStore.currentApp?.task_id || logStreamActive) return
    if (shouldStreamLogs()) {
      logStreamActive = true
      await handleStreamLogs(appStore.currentApp.task_id)
    }
  }

  function stopLogStream () {
    logStreamActive = false
    // Não há método explícito para parar, mas o componente LogViewer já para o polling
  }

  onMounted(async () => {
    try {
      await appStore.fetchApp(appId)
      if (appStore.currentApp?.id) {
        await logStore.fetchLogsByApp(Number(appStore.currentApp.id))
        await fetchServices()
        await startLogStreamIfNeeded()
      }
      startTaskPollingIfNeeded()
      if (appStore.currentApp?.status === 'RUNNING') {
        startRuntimeLogsPolling()
      }
    } finally {
      loading.value = false
    }
  })

  onUnmounted(() => {
    stopTaskPolling()
    stopRuntimeLogsPolling()
  })

  watch(
    () => appStore.currentApp?.status,
    newStatus => {
      if (newStatus === 'STARTING' || newStatus === 'DELETING' || newStatus === 'DEPLOYING') {
        startTaskPollingIfNeeded()
      } else {
        stopTaskPolling()
        appStore.clearTaskStatus()
      }
      // Stream de logs automático (deploy)
      if (shouldStreamLogs()) {
        startLogStreamIfNeeded()
      } else {
        stopLogStream()
      }
      // Logs runtime quando RUNNING
      if (newStatus === 'RUNNING') {
        startRuntimeLogsPolling()
      } else {
        stopRuntimeLogsPolling()
      }
    },
  )

  // --- Task Polling ---
  function startTaskPollingIfNeeded () {
    const app = appStore.currentApp
    if (!app?.task_id || !['STARTING', 'DELETING', 'DEPLOYING'].includes(app.status ?? ''))
      return
    stopTaskPolling()
    pollTaskStatus()
    taskPollingInterval.value = setInterval(pollTaskStatus, 2000)
  }

  function stopTaskPolling () {
    if (taskPollingInterval.value) {
      clearInterval(taskPollingInterval.value)
      taskPollingInterval.value = null
    }
  }

  async function pollTaskStatus () {
    try {
      const status = await appStore.fetchAppStatus(appId)
      if (status?.state === 'SUCCESS' || status?.state === 'FAILURE') {
        stopTaskPolling()
        await appStore.fetchApp(appId)
      }
    } catch (error_) {
      console.error('Erro ao buscar status da task:', error_)
    }
  }

  async function refreshStatus () {
    refreshing.value = true
    try {
      await appStore.fetchApp(appId)
      if (appStore.currentApp?.task_id) {
        await appStore.fetchAppStatus(appId)
      }
    } finally {
      refreshing.value = false
    }
  }

  // --- Variáveis de Ambiente ---
  async function handleAddEnvVar (envVar: { key: string, value: string }) {
    savingEnvVar.value = true
    try {
      const currentVars = appStore.currentApp?.variables || {}
      await appStore.updateApp(appId, {
        variables: { ...currentVars, [envVar.key]: envVar.value },
      })
    } finally {
      savingEnvVar.value = false
    }
  }

  async function removeEnvVar (key: string) {
    const currentVars = { ...appStore.currentApp?.variables }
    delete currentVars[key]
    await appStore.updateApp(appId, { variables: currentVars })
  }

  // --- Controle do App ---
  async function handleDeleteApp () {
    deleting.value = true
    try {
      await appStore.deleteApp(appId)
      router.push(`/projects/${projectId}`)
    } finally {
      deleting.value = false
    }
  }

  async function handleStartApp () {
    starting.value = true
    try {
      await appStore.startApp(appId)
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao iniciar app:', error_)
    } finally {
      starting.value = false
    }
  }

  async function handleStopApp () {
    stopping.value = true
    try {
      await appStore.stopApp(appId)
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao parar app:', error_)
    } finally {
      stopping.value = false
    }
  }

  async function handleRestartApp () {
    restarting.value = true
    try {
      await appStore.restartApp(appId)
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao reiniciar app:', error_)
    } finally {
      restarting.value = false
    }
  }

  // --- Console / Comandos ---
  function handleClearCommand () {
    commandOutput.value = ''
    commandSuccess.value = true
  }

  async function handleRunCommand (command: string) {
    if (!command.trim() || !appStore.currentApp?.id) return
    runningCommand.value = true
    commandOutput.value = ''
    commandSuccess.value = true

    try {
      const result = await AppsService.runCommand(appId, command.trim())

      if (result.task_id) {
        if (appStore.currentApp) {
          appStore.currentApp.task_id = result.task_id
        }

        const pollCommandResult = async () => {
          try {
            const status = await AppsService.getAppStatus(appId)
            if (status.state === 'SUCCESS') {
              commandOutput.value
                = 'Comando executado com sucesso! Veja detalhes nos Logs abaixo.'
              commandSuccess.value = true
              runningCommand.value = false
              return true
            } else if (status.state === 'FAILURE') {
              commandOutput.value = status.status || 'Erro ao executar comando'
              commandSuccess.value = false
              runningCommand.value = false
              return true
            }
            return false
          } catch {
            return false
          }
        }

        let attempts = 0
        const interval = setInterval(async () => {
          attempts++
          const done = await pollCommandResult()
          if (done || attempts > 30) {
            clearInterval(interval)
            if (attempts > 30 && runningCommand.value) {
              commandOutput.value
                = 'Comando ainda em execução. Acompanhe o progresso nos Logs abaixo.'
              commandSuccess.value = true
              runningCommand.value = false
            }
          }
        }, 2000)
      }
    } catch (error_: any) {
      const errorData = error_?.response?.data
      if (errorData?.error) {
        commandOutput.value = errorData.error
        if (errorData.allowed_commands) {
          commandOutput.value
            += '\n\nComandos permitidos:\n' + errorData.allowed_commands.join('\n')
        }
      } else {
        commandOutput.value = 'Erro ao executar comando'
      }
      commandSuccess.value = false
      runningCommand.value = false
    }
  }

  // --- Banco de Dados / Serviços ---
  async function fetchServices () {
    if (!appStore.currentApp?.id) return
    try {
      const response = await ServicesService.getServicesByApp(
        Number(appStore.currentApp.id),
      )
      appServices.value = response.results
    } catch (error_) {
      console.error('Erro ao buscar serviços:', error_)
      if (appStore.currentApp?.services) {
        appServices.value = appStore.currentApp.services
      }
    }
  }

  async function handleCreateDatabase () {
    if (!appStore.currentApp?.id) return
    creatingDatabase.value = true
    try {
      await ServicesService.createService({
        app: Number(appStore.currentApp.id),
        service_type: 'postgres',
      })
      setTimeout(async () => {
        await appStore.fetchApp(appId)
        await fetchServices()
        creatingDatabase.value = false
      }, 3000)
    } catch (error_) {
      console.error('Erro ao criar banco de dados:', error_)
      creatingDatabase.value = false
    }
  }

  async function openLinkDialog () {
    try {
      const response = await ServicesService.getServicesByProject(projectId)
      availableServicesToLink.value = response.results.filter(s => !s.app)
      selectedServiceToLink.value = availableServicesToLink.value[0]?.id ?? null
      linkServiceDialog.value = true
    } catch (error_) {
      console.error('Erro ao buscar serviços:', error_)
    }
  }

  async function handleLinkService () {
    if (!selectedServiceToLink.value || !appStore.currentApp?.id) return
    linkingService.value = true
    try {
      await ServicesService.linkService(selectedServiceToLink.value, appStore.currentApp.id)
      linkServiceDialog.value = false
      selectedServiceToLink.value = null
      await appStore.fetchApp(appId)
      await fetchServices()
    } catch (error_) {
      console.error('Erro ao vincular serviço:', error_)
    } finally {
      linkingService.value = false
    }
  }

  async function handleUnlinkService (serviceId: number) {
    unlinkingService.value = serviceId
    try {
      await ServicesService.unlinkService(serviceId)
      setTimeout(async () => {
        await appStore.fetchApp(appId)
        await fetchServices()
        unlinkingService.value = null
      }, 2000)
    } catch (error_) {
      console.error('Erro ao desvincular serviço:', error_)
      unlinkingService.value = null
    }
  }

  async function handleDeleteService (serviceId: number) {
    deletingService.value = serviceId
    try {
      await ServicesService.deleteService(serviceId)
      setTimeout(async () => {
        await appStore.fetchApp(appId)
        await fetchServices()
        deletingService.value = null
      }, 3000)
    } catch (error_) {
      console.error('Erro ao deletar serviço:', error_)
      deletingService.value = null
    }
  }

  // --- Logs ---
  async function handleStreamLogs (taskId: string, afterId?: number) {
    await logStore.streamLogs(taskId, afterId)
  }

// --- Helpers importados de @/utils/status ---
</script>
