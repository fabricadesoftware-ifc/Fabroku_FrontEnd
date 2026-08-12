<template>
  <v-container class="px-10 py-2" fluid>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push(`/projects/${projectId}`)"
    >
      Voltar para Projeto
    </v-btn>

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
                ['STARTING', 'DELETING', 'DEPLOYING'].includes(
                  appStore.currentApp.status ?? '',
                )
            "
            class="mb-4"
            :color="
              appStore.currentApp.status === 'DELETING'
                ? 'pink'
                : appStore.currentApp.status === 'DEPLOYING'
                  ? 'orange'
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

          <AppProcessScaleCard
            v-if="canManageProcesses"
            :error="processScaleError"
            :loading="processesLoading"
            :locked="processScaleLocked"
            :max-instances="processMaxInstances"
            :processes="appProcesses"
            :saving="scalingProcesses"
            @apply="handleScaleProcesses"
            @refresh="handleRefreshProcesses"
          />

          <AppPreviewCard :app="appStore.currentApp" />

          <AppDatabaseCard
            :app-name="appStore.currentApp.name_dokku || appStore.currentApp.name"
            :creating="creatingDatabase"
            :deleting-id="deletingService"
            :error="databaseError"
            :linking="linkingService"
            :services="appServices"
            :unlinking-id="unlinkingService"
            @create="handleCreateDatabase"
            @delete="handleDeleteService"
            @link="openLinkDialog"
            @unlink="handleUnlinkService"
          />

          <AppEnvVarsCard
            :saving="savingEnvVar"
            :variables="envVariables"
            @add="handleAddEnvVar"
            @add-multiple="handleAddMultipleEnvVars"
            @remove="removeEnvVar"
            @update="handleUpdateEnvVar"
          />
        </v-col>

        <v-col cols="12" md="4">
          <AppActionsCard
            :app-name="appStore.currentApp.name"
            :deleting="deleting"
            :domain="appStore.currentApp.domain"
            :redeploying="redeploying"
            :restarting="restarting"
            :starting="starting"
            :status="appStore.currentApp.status"
            :stopping="stopping"
            @delete="handleDeleteApp"
            @diagnose="diagnoseAppError"
            @redeploy="handleRedeployApp"
            @restart="handleRestartApp"
            @start="handleStartApp"
            @stop="handleStopApp"
          />
        </v-col>
      </v-row>
    </template>

    <AppServiceLinkDialog
      v-model="linkServiceDialog"
      :error="linkServiceError"
      :format-option="formatServiceOption"
      :loading="linkingService"
      :selected-service="selectedServiceToLink"
      :services="availableServicesToLink"
      :services-route="`/projects/${projectId}/services/new`"
      @clear-error="linkServiceError = ''"
      @confirm="handleLinkService"
      @update:selected-service="selectedServiceToLink = $event"
    />

    <!-- Logs da Aplicação -->
    <v-row v-if="appStore.currentApp">
      <v-col cols="12">
        <AppLogsCard
          :live-active="runtimeLogsLive"
          :live-available="isRunning"
          :loading="logsLoading"
          :logs="displayLogs"
          :output="commandOutput"
          :running="runningCommand"
          :status="appStore.currentApp.status"
          :success="commandSuccess"
          :task-id="deployTaskId"
          :task-stream-active="taskLogStreamActive"
          :title="logsTitle"
          @clear="handleClearCommand"
          @run="handleRunCommand"
          @start-live="startRuntimeLogsPolling"
          @start-stream="startTaskLogStream"
          @stop-live="stopRuntimeLogsPolling"
          @stop-stream="stopLogStream"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import AppActionsCard from '@/components/projects/AppActionsCard.vue'
  import AppDatabaseCard from '@/components/projects/AppDatabaseCard.vue'
  import AppDetailsCard from '@/components/projects/AppDetailsCard.vue'
  import AppEnvVarsCard from '@/components/projects/AppEnvVarsCard.vue'
  import AppLogsCard from '@/components/projects/AppLogsCard.vue'
  import AppPreviewCard from '@/components/projects/AppPreviewCard.vue'
  import AppProcessScaleCard from '@/components/projects/AppProcessScaleCard.vue'
  import AppServiceLinkDialog from '@/components/projects/AppServiceLinkDialog.vue'
  import { appRepository } from '@/modules/applications'
  import { useAppActions } from '@/modules/applications/presentation/composables/use-app-actions'
  import { useAppCommand } from '@/modules/applications/presentation/composables/use-app-command'
  import { useAppEnvironment } from '@/modules/applications/presentation/composables/use-app-environment'
  import { useAppProcesses } from '@/modules/applications/presentation/composables/use-app-processes'
  import { useAppServices } from '@/modules/applications/presentation/composables/use-app-services'
  import { useAppTaskPolling } from '@/modules/applications/presentation/composables/use-app-task-polling'
  import { logRepository } from '@/modules/logs/infrastructure/http/log-repository'
  import { useRuntimeLogStream } from '@/modules/logs/presentation/composables/use-runtime-log-stream'
  import { useTaskLogStream } from '@/modules/logs/presentation/composables/use-task-log-stream'
  import { serviceRepository } from '@/modules/services/infrastructure/http/service-repository'
  import { useAppStore, useAuthStore, useLogStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'
  async function diagnoseAppError () {
    if (!appStore.currentApp?.id) return
    try {
      const status = await appStore.fetchAppStatus(
        String(appStore.currentApp.id),
      )
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
      alert(
        'Nenhum problema crítico detectado. Veja os logs para mais detalhes.',
      )
    } catch {
      alert('Erro ao diagnosticar. Tente novamente.')
    }
  }

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''
  const appId = (route.params as { appId: string }).appId || ''

  const appStore = useAppStore()
  const authStore = useAuthStore()
  const logStore = useLogStore()
  const loading = ref(true)
  const refreshing = ref(false)
  const linkServiceDialog = ref(false)
  const selectedServiceToLink = ref<number | null>(null)

  const taskLogStream = useTaskLogStream(logRepository, {
    getTaskId: () => appStore.currentApp?.task_id ?? undefined,
    onLogs: logs => logStore.appendLogs(logs),
  })
  const taskLogStreamActive = taskLogStream.active

  // Logs runtime (quando app está RUNNING)
  const isRunning = computed(() => appStore.currentApp?.status === 'RUNNING')
  const runtimeLogs = useRuntimeLogStream(
    logRepository,
    () => appStore.currentApp?.id,
    () => isRunning.value,
  )
  const runtimeLogsLines = runtimeLogs.lines
  const runtimeLogsLoading = runtimeLogs.loading
  const runtimeLogsLive = runtimeLogs.live
  const envVariables = computed(() => (
    appStore.currentApp?.variables as Record<string, string> | undefined
  ))
  const displayLogs = computed(() => {
    if (isRunning.value) {
      return runtimeLogsLines.value.map((line, i) => ({
        id: i,
        message: line,
        level: 'DOKKU' as const,
        category: 'SYSTEM' as const,
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
  const processScaleLocked = computed(() =>
    ['DEPLOYING', 'STARTING', 'DELETING'].includes(appStore.currentApp?.status ?? ''),
  )
  const canManageProcesses = computed(() =>
    Boolean(authStore.user?.is_fabric || authStore.user?.is_superuser),
  )

  const taskPolling = useAppTaskPolling({
    getApp: () => appStore.currentApp,
    fetchApp: () => appStore.fetchApp(appId),
    fetchStatus: () => appStore.fetchAppStatus(appId),
    onCompleted: async status => {
      if (appStore.currentApp?.status === 'DELETING' && status.state === 'SUCCESS') {
        stopLogStream()
        await router.push(`/projects/${projectId}`)
        return
      }
      await appStore.fetchApp(appId)
      if (canManageProcesses.value) await fetchAppProcesses(true)
    },
  })

  const appActions = useAppActions({
    repository: appRepository,
    appId,
    getApp: () => appStore.currentApp,
    setApp: app => {
      appStore.currentApp = app
    },
  })
  const environment = useAppEnvironment(
    appRepository,
    appId,
    () => appStore.currentApp,
    app => {
      appStore.currentApp = app
    },
  )
  const appProcessesState = useAppProcesses({
    repository: appRepository,
    appId,
    canManage: () => canManageProcesses.value,
    waitForTask: taskPolling.waitForCompletion,
  })
  const appServicesState = useAppServices({
    serviceRepository,
    appId: () => appStore.currentApp?.id,
    projectId,
    waitForTask: taskPolling.waitForCompletion,
  })
  const command = useAppCommand({
    repository: appRepository,
    appId,
    setTaskId: taskId => {
      if (appStore.currentApp) appStore.currentApp.task_id = taskId
    },
  })

  const savingEnvVar = environment.saving
  const deleting = appActions.deleting
  const starting = appActions.starting
  const stopping = appActions.stopping
  const restarting = appActions.restarting
  const redeploying = appActions.redeploying
  const appServices = appServicesState.services
  const formatServiceOption = appServicesState.formatOption
  const creatingDatabase = appServicesState.creating
  const linkingService = appServicesState.linking
  const unlinkingService = appServicesState.unlinkingId
  const deletingService = appServicesState.deletingId
  const databaseError = appServicesState.error
  const availableServicesToLink = appServicesState.availableServices
  const linkServiceError = appServicesState.linkError
  const appProcesses = appProcessesState.processes
  const processesLoading = appProcessesState.loading
  const scalingProcesses = appProcessesState.saving
  const processScaleError = appProcessesState.error
  const processMaxInstances = appProcessesState.maxInstances
  const runningCommand = command.running
  const commandOutput = command.output
  const commandSuccess = command.success

  function startRuntimeLogsPolling () {
    runtimeLogs.start()
  }

  function stopRuntimeLogsPolling () {
    runtimeLogs.stop()
  }

  // --- Stream de logs em tempo real ---
  let logStreamActive = false
  function shouldStreamLogs () {
    const status = appStore.currentApp?.status
    return ['FAILED', 'ERROR', 'STARTING', 'DELETING', 'DEPLOYING'].includes(
      status || '',
    )
  }

  async function startLogStreamIfNeeded () {
    if (!appStore.currentApp?.task_id || logStreamActive) return
    if (shouldStreamLogs()) {
      logStreamActive = true
      taskLogStream.start()
    }
  }

  function startTaskLogStream () {
    if (!appStore.currentApp?.task_id) return
    logStreamActive = true
    taskLogStream.start()
  }

  function stopLogStream () {
    logStreamActive = false
    taskLogStream.stop()
  }

  onMounted(async () => {
    try {
      await appStore.fetchApp(appId)
      if (appStore.currentApp?.id) {
        await logStore.fetchLogsByApp(Number(appStore.currentApp.id))
        await fetchServices()
        if (canManageProcesses.value) {
          void fetchAppProcesses(true)
        }
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
    stopLogStream()
  })

  watch(
    () => appStore.currentApp?.status,
    newStatus => {
      if (
        newStatus === 'STARTING'
        || newStatus === 'DELETING'
        || newStatus === 'DEPLOYING'
      ) {
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

  watch(canManageProcesses, enabled => {
    if (enabled && appStore.currentApp?.id && appProcesses.value.length === 0) {
      void fetchAppProcesses(true)
    }
  })

  // --- Task Polling ---
  function startTaskPollingIfNeeded () {
    taskPolling.start()
  }

  function stopTaskPolling () {
    taskPolling.stop()
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
    await environment.add(envVar)
  }

  async function handleAddMultipleEnvVars (
    envVars: Array<{ key: string, value: string }>,
  ) {
    await environment.addMultiple(envVars)
  }

  async function handleUpdateEnvVar (
    oldKey: string,
    envVar: { key: string, value: string },
  ) {
    await environment.update(oldKey, envVar)
  }

  async function removeEnvVar (key: string) {
    await environment.remove(key)
  }

  // --- Controle do App ---
  async function handleDeleteApp () {
    try {
      await appActions.remove()
      await startLogStreamIfNeeded()
      startTaskPollingIfNeeded()
    // Não navega imediatamente — deixa o usuário acompanhar o progresso nos logs
    // A navegação ocorre quando o watch detectar status 'RUNNING' ou 'SUCCESS'
    } catch (error_) {
      console.error('Erro ao deletar app:', error_)
    }
  }

  async function handleStartApp () {
    try {
      await appActions.start()
      await startLogStreamIfNeeded()
      startTaskPollingIfNeeded()
    } catch (error_) {
      console.error('Erro ao iniciar app:', error_)
    }
  }

  async function handleStopApp () {
    try {
      await appActions.stop()
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao parar app:', error_)
    }
  }

  async function handleRestartApp () {
    try {
      await appActions.restart()
      await startLogStreamIfNeeded()
      startTaskPollingIfNeeded()
    } catch (error_) {
      console.error('Erro ao reiniciar app:', error_)
    }
  }

  async function handleRedeployApp () {
    try {
      await appActions.redeploy()
      await startLogStreamIfNeeded()
      startTaskPollingIfNeeded()
    } catch (error_) {
      console.error('Erro ao fazer redeploy:', error_)
    }
  }

  // --- Console / Comandos ---
  function handleClearCommand () {
    command.clear()
  }

  async function handleRunCommand (commandValue: string) {
    await command.run(commandValue)
  }

  async function fetchAppProcesses (refresh = false) {
    await appProcessesState.fetch(refresh)
  }

  async function handleRefreshProcesses () {
    await appProcessesState.refresh()
  }

  async function handleScaleProcesses (processes: Record<string, number>) {
    await appProcessesState.scale(processes)
  }

  async function fetchServices () {
    await appServicesState.fetch()
    if (appServices.value.length === 0 && appStore.currentApp?.services) {
      appServices.value = appStore.currentApp.services
    }
  }

  async function handleCreateDatabase (serviceType: 'postgres' | 'postgis') {
    try {
      await appServicesState.createDatabase(serviceType)
    } catch (error_) {
      console.error('Erro ao criar banco de dados:', error_)
    }
  }

  async function openLinkDialog () {
    try {
      await appServicesState.openLinkOptions()
      selectedServiceToLink.value = availableServicesToLink.value[0]?.id ?? null
      linkServiceDialog.value = true
    } catch (error_) {
      console.error('Erro ao buscar serviços:', error_)
    }
  }

  async function handleLinkService () {
    if (!selectedServiceToLink.value) return
    try {
      await appServicesState.link(selectedServiceToLink.value)
      linkServiceDialog.value = false
      selectedServiceToLink.value = null
    } catch (error_) {
      console.error('Erro ao vincular serviço:', error_)
    }
  }

  async function handleUnlinkService (serviceId: number) {
    try {
      await appServicesState.unlink(serviceId)
    } catch (error_) {
      console.error('Erro ao desvincular serviço:', error_)
    }
  }

  async function handleDeleteService (serviceId: number) {
    try {
      await appServicesState.remove(serviceId)
    } catch (error_) {
      console.error('Erro ao deletar serviço:', error_)
    }
  }

</script>
