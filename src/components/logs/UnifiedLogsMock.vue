<template>
  <div class="unified-log-panel">
    <div class="unified-log-panel__toolbar">
      <v-text-field
        v-model="search"
        class="unified-log-panel__search"
        clearable
        density="compact"
        hide-details
        placeholder="Filtrar logs..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
      />

      <div aria-label="Filtro por fonte" class="unified-log-panel__group">
        <button
          v-for="source in sourceFilters"
          :key="source.value"
          class="unified-log-panel__filter"
          :class="{ 'unified-log-panel__filter--active': selectedSource === source.value }"
          type="button"
          @click="selectedSource = source.value"
        >
          {{ source.label }}
        </button>
      </div>

      <div aria-label="Filtro por nivel" class="unified-log-panel__group">
        <button
          v-for="level in levelFilters"
          :key="level.value"
          class="unified-log-panel__filter"
          :class="{ 'unified-log-panel__filter--active': selectedLevel === level.value }"
          type="button"
          @click="selectedLevel = level.value"
        >
          {{ level.label }}
        </button>
      </div>

      <v-select
        v-model="selectedRange"
        class="unified-log-panel__range"
        density="compact"
        hide-details
        :items="rangeOptions"
        variant="solo-filled"
      />
    </div>

    <div v-if="operationRunning" class="unified-log-panel__deploy-state">
      <div>
        <strong>{{ operationTitle }}</strong>
        <span>{{ operationDescription }}</span>
      </div>

      <div class="unified-log-panel__deploy-steps">
        <span
          v-for="step in operationSteps"
          :key="step.label"
          class="unified-log-panel__deploy-step"
          :class="`unified-log-panel__deploy-step--${step.status}`"
        >
          {{ step.label }}
        </span>
      </div>
    </div>

    <div class="unified-terminal">
      <div class="unified-terminal__bar">
        <div aria-hidden="true" class="unified-terminal__dots">
          <span class="unified-terminal__dot unified-terminal__dot--red" />
          <span class="unified-terminal__dot unified-terminal__dot--yellow" />
          <span class="unified-terminal__dot unified-terminal__dot--green" />
        </div>

        <span class="unified-terminal__title">
          {{ terminalTitle }}
        </span>

        <div class="unified-terminal__actions">
          <v-btn
            v-if="taskId || liveAvailable"
            density="compact"
            icon
            size="x-small"
            variant="text"
            @click="toggleLive"
          >
            <v-icon :color="isLive ? 'error' : undefined" size="16">
              {{ isLive ? 'mdi-stop' : 'mdi-play' }}
            </v-icon>

            <v-tooltip activator="parent" location="top">
              {{ isLive ? 'Parar live tail' : 'Acompanhar ao vivo' }}
            </v-tooltip>
          </v-btn>

          <v-btn
            density="compact"
            icon
            size="x-small"
            variant="text"
            @click="copyVisibleLogs"
          >
            <v-icon size="16">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
            <v-tooltip activator="parent" location="top">Copiar visiveis</v-tooltip>
          </v-btn>

          <v-btn
            density="compact"
            icon
            size="x-small"
            variant="text"
            @click="downloadVisibleLogs"
          >
            <v-icon size="16">mdi-download</v-icon>
            <v-tooltip activator="parent" location="top">Baixar historico</v-tooltip>
          </v-btn>

          <v-btn
            v-if="output"
            density="compact"
            icon
            size="x-small"
            variant="text"
            @click="emit('clear-output')"
          >
            <v-icon size="16">mdi-close</v-icon>
            <v-tooltip activator="parent" location="top">Limpar saida do comando</v-tooltip>
          </v-btn>
        </div>
      </div>

      <div
        ref="terminalBody"
        class="unified-terminal__body"
        :class="{ 'unified-terminal__body--compact': loading && filteredEntries.length === 0 }"
      >
        <div
          v-for="entry in filteredEntries"
          :key="entry.key"
          class="terminal-line"
          :class="[
            `terminal-line--${entry.level}`,
            `terminal-line--${entry.source}`,
            { 'terminal-line--focus': entry.focus },
          ]"
        >
          <span class="terminal-line__time">[{{ entry.time }}]</span>
          <span class="terminal-line__level">{{ entry.level.toUpperCase() }}</span>
          <span class="terminal-line__source">{{ getSourceLabel(entry.source) }}</span>
          <span class="terminal-line__message">{{ entry.message }}</span>
        </div>

        <div v-if="filteredEntries.length === 0 && !loading" class="unified-terminal__empty">
          Nenhum log encontrado com os filtros atuais.
        </div>

        <div v-if="loading" class="unified-terminal__loading">
          <v-progress-circular color="primary" indeterminate size="16" width="2" />
          <span>Carregando logs...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AppLog, LogCategory, LogLevel } from '@/interfaces'

  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

  type UnifiedLogLevel = 'info' | 'warning' | 'error' | 'success'
  type LogSource = 'app' | 'deploy' | 'command'
  type SourceFilter = 'all' | LogSource
  type LevelFilter = 'all' | UnifiedLogLevel

  interface Props {
    logs: AppLog[]
    loading?: boolean
    taskId?: string
    title?: string
    status?: string
    running?: boolean
    output?: string
    success?: boolean
    autoScroll?: boolean
    liveAvailable?: boolean
    liveActive?: boolean
  }

  interface UnifiedLogEntry {
    key: string
    time: string
    level: UnifiedLogLevel
    source: LogSource
    message: string
    focus: boolean
    createdAt?: Date
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    title: 'Logs',
    status: '',
    output: '',
    success: true,
    autoScroll: true,
    liveAvailable: false,
    liveActive: false,
  })

  const emit = defineEmits<{
    'stream-logs': [taskId: string, afterId?: number]
    'stop-stream': []
    'start-live': []
    'stop-live': []
    'clear-output': []
  }>()

  const terminalBody = ref<HTMLElement | null>(null)
  const search = ref('')
  const selectedSource = ref<SourceFilter>('all')
  const selectedLevel = ref<LevelFilter>('all')
  const selectedRange = ref('Ultima 1 hora')
  const copied = ref(false)
  const streaming = ref(false)
  const streamInterval = ref<number | null>(null)

  const ERROR_PATTERNS = /\berror\b|erro|failed|failure|falhou|fatal|denied|cannot|couldn't|could not|exception|traceback|no such file|exit status|healthcheck failed|timeout/i
  const WARNING_PATTERNS = /\bwarning\b|aviso|deprecated|skipping|already exists|unhealthy|timeout|not found/i
  const SUCCESS_PATTERNS = /\bsuccess\b|successful|sucesso|deployed|created|configured|linked|done|complete|completed|\bok\b|all checks successful/i
  const STEP_PATTERNS = /^[-=]+>\s|^----->|^=====>|^running |^building |^installing |^applying /i
  const COMMAND_PATTERNS = /run command|comando|manage\.py|migrate|loaddata|dumpdata|createsuperuser|fabroku run|python\s+/i
  const HTTP_STATUS_PATTERNS = [
    /"(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+[^"]+\s+HTTP\/[\d.]+"\s+(\d{3})\b/i,
    /\b(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\S+.*?\s[-–—]\s*(\d{3})\b/i,
  ]

  const sourceFilters: Array<{ label: string, value: SourceFilter }> = [
    { label: 'Tudo', value: 'all' },
    { label: 'App', value: 'app' },
    { label: 'Deploy', value: 'deploy' },
    { label: 'Comandos', value: 'command' },
  ]

  const levelFilters: Array<{ label: string, value: LevelFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
  ]

  const rangeOptions = ['Tudo', 'Ultima 1 hora', 'Ultimas 6 horas', 'Hoje', '7 dias']

  const isLive = computed(() => (props.liveAvailable ? props.liveActive : streaming.value))

  const operationRunning = computed(() =>
    ['DEPLOYING', 'STARTING', 'DELETING', 'RESTARTING', 'STOPPING'].includes(props.status),
  )

  const operationTitle = computed(() => {
    if (props.status === 'DEPLOYING') return 'Deploy em andamento'
    if (props.status === 'STARTING') return 'App iniciando'
    if (props.status === 'DELETING') return 'App sendo removido'
    if (props.status === 'RESTARTING') return 'App reiniciando'
    if (props.status === 'STOPPING') return 'App parando'
    return 'Operacao em andamento'
  })

  const operationDescription = computed(() => {
    if (props.status === 'DEPLOYING') {
      return 'Logs da aplicacao ficam em segundo plano enquanto o Fabroku acompanha build, release e healthcheck.'
    }
    return 'O Fabroku esta acompanhando a tarefa atual e destacando os eventos mais importantes.'
  })

  const operationSteps = computed(() => {
    if (props.status === 'DEPLOYING') {
      return [
        { label: 'Recebido', status: 'done' },
        { label: 'Build', status: 'active' },
        { label: 'Release', status: 'waiting' },
        { label: 'Healthcheck', status: 'waiting' },
      ]
    }

    return [
      { label: 'Solicitado', status: 'done' },
      { label: 'Dokku', status: 'active' },
      { label: 'Status', status: 'waiting' },
    ]
  })

  const terminalTitle = computed(() => {
    const baseTitle = props.title || 'Logs'
    if (isLive.value) return `${baseTitle} - live`
    return baseTitle
  })

  const entries = computed<UnifiedLogEntry[]>(() => {
    const normalized: UnifiedLogEntry[] = []

    for (const [logIndex, log] of props.logs.entries()) {
      for (const [chunkIndex, message] of splitLogMessage(log).entries()) {
        const cleanText = cleanMessage(message)
        if (!cleanText) continue

        const source = getLogSource(log, cleanText)
        const level = getLogLevel(log.level, cleanText)

        normalized.push({
          key: `${log.id ?? logIndex}-${chunkIndex}-${source}-${level}`,
          time: formatTime(log.created_at, cleanText),
          level,
          source,
          message: makeTerminalText(cleanText),
          focus: operationRunning.value && source !== 'app',
          createdAt: log.created_at ? new Date(log.created_at) : undefined,
        })
      }
    }

    if (props.running) {
      normalized.push({
        key: 'command-running',
        time: currentTime(),
        level: 'info',
        source: 'command',
        message: 'Executando comando no container...',
        focus: true,
      })
    }

    if (props.output) {
      normalized.push({
        key: `command-output-${props.success ? 'success' : 'error'}`,
        time: currentTime(),
        level: props.success ? 'success' : 'error',
        source: 'command',
        message: props.output,
        focus: true,
      })
    }

    return normalized
  })

  const filteredEntries = computed(() => {
    const query = search.value.trim().toLowerCase()
    const minDate = getRangeStartDate(selectedRange.value)

    return entries.value.filter(entry => {
      if (selectedSource.value !== 'all' && entry.source !== selectedSource.value) return false
      if (selectedLevel.value !== 'all' && entry.level !== selectedLevel.value) return false
      if (minDate && entry.createdAt && entry.createdAt < minDate) return false

      if (!query) return true

      const haystack = [
        entry.time,
        entry.level,
        entry.source,
        getSourceLabel(entry.source),
        entry.message,
      ].join(' ').toLowerCase()

      return haystack.includes(query)
    })
  })

  function splitLogMessage (log: AppLog): string[] {
    if (log.level === 'DOKKU') {
      return log.message
        .split(/\n|(?=----->)|(?======>)/)
        .filter(Boolean)
    }

    return log.message.split('\n')
  }

  function getLogSource (log: AppLog, message: string): LogSource {
    const metadataSource = String(log.metadata?.source || '').toLowerCase()
    if (['app', 'deploy', 'command'].includes(metadataSource)) {
      return metadataSource as LogSource
    }

    if (COMMAND_PATTERNS.test(message) || COMMAND_PATTERNS.test(String(log.metadata?.command || ''))) {
      return 'command'
    }

    if (props.status === 'RUNNING' && !log.created_at) {
      return 'app'
    }

    if (isDeployCategory(log.category) || log.level === 'DOKKU') {
      return 'deploy'
    }

    return 'app'
  }

  function isDeployCategory (category?: LogCategory): boolean {
    return [
      'CREATE',
      'DEPLOY',
      'CONFIG',
      'GIT',
      'DATABASE',
      'DOMAIN',
      'SSL',
    ].includes(category || '')
  }

  function getLogLevel (level: LogLevel, message: string): UnifiedLogLevel {
    const httpLevel = getHttpStatusLevel(message)
    if (httpLevel) return httpLevel

    if (level === 'ERROR') return 'error'
    if (level === 'WARNING') return 'warning'
    if (level === 'SUCCESS') return 'success'

    if (isErrorLine(message)) return 'error'
    if (isWarningLine(message)) return 'warning'
    if (SUCCESS_PATTERNS.test(message)) return 'success'

    return 'info'
  }

  function getHttpStatusLevel (message: string): UnifiedLogLevel | null {
    const statusCode = getHttpStatusCode(message)
    if (!statusCode) return null

    if (statusCode >= 500) return 'error'
    if (statusCode >= 400) return 'warning'
    if (statusCode >= 200 && statusCode < 400) return 'success'

    return 'info'
  }

  function getHttpStatusCode (message: string): number | null {
    for (const pattern of HTTP_STATUS_PATTERNS) {
      const match = message.match(pattern)
      if (match?.[1]) return Number(match[1])
    }

    return null
  }

  function isErrorLine (message: string): boolean {
    if (WARNING_PATTERNS.test(message) && !ERROR_PATTERNS.test(message)) return false
    return ERROR_PATTERNS.test(message)
  }

  function isWarningLine (message: string): boolean {
    return WARNING_PATTERNS.test(message)
  }

  function makeTerminalText (message: string): string {
    if (STEP_PATTERNS.test(message)) return message.trim()
    return message.replace(/\s+/g, ' ').trim()
  }

  function cleanMessage (message: string): string {
    return message
      .replace(/\u001B\[[0-9;]*[A-Za-z]/g, '')
      .replace(/\u001B\].*?(?:\u0007|\u001B\\)/g, '')
      .replace(/\u001B/g, '')
      .replace(/\r/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
  }

  function getSourceLabel (source: LogSource): string {
    if (source === 'deploy') return 'DEPLOY'
    if (source === 'command') return 'CMD'
    return 'APP'
  }

  function formatTime (timestamp?: string, fallbackMessage = ''): string {
    const inlineTimestamp = fallbackMessage.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/)?.[0]

    if (timestamp) {
      return new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: '2-digit',
        second: '2-digit',
      })
    }

    if (inlineTimestamp) return inlineTimestamp.replace('T', ' ')
    return '--:--:--'
  }

  function currentTime (): string {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
    })
  }

  function getRangeStartDate (range: string): Date | null {
    const now = Date.now()
    if (range === 'Ultima 1 hora') return new Date(now - 60 * 60 * 1000)
    if (range === 'Ultimas 6 horas') return new Date(now - 6 * 60 * 60 * 1000)
    if (range === 'Hoje') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }
    if (range === '7 dias') return new Date(now - 7 * 24 * 60 * 60 * 1000)
    return null
  }

  function serializeVisibleLogs (): string {
    return filteredEntries.value
      .map(entry => `[${entry.time}] ${entry.level.toUpperCase()} ${getSourceLabel(entry.source)} ${entry.message}`)
      .join('\n')
  }

  async function copyVisibleLogs () {
    const text = serializeVisibleLogs()
    if (!text) return

    await navigator.clipboard.writeText(text)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1200)
  }

  function downloadVisibleLogs () {
    const text = serializeVisibleLogs()
    if (!text) return

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fabroku-logs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function getLastLogId (): number | undefined {
    return props.logs.length > 0 ? props.logs.at(-1)?.id : undefined
  }

  function startStream () {
    if (!props.taskId) return

    streaming.value = true
    emit('stream-logs', props.taskId, getLastLogId())
    streamInterval.value = window.setInterval(() => {
      emit('stream-logs', props.taskId!, getLastLogId())
    }, 2000)
  }

  function toggleLive () {
    if (props.liveAvailable) {
      if (props.liveActive) {
        emit('stop-live')
        return
      }

      emit('start-live')
      return
    }

    if (streaming.value) {
      stopStream()
      return
    }

    startStream()
  }

  function stopStream () {
    streaming.value = false
    if (streamInterval.value) {
      clearInterval(streamInterval.value)
      streamInterval.value = null
    }
    emit('stop-stream')
  }

  function scrollToBottom () {
    if (!terminalBody.value) return
    terminalBody.value.scrollTop = terminalBody.value.scrollHeight
  }

  watch(
    () => [filteredEntries.value.length, props.output, props.running],
    () => {
      if (props.autoScroll) nextTick(scrollToBottom)
    },
  )

  onBeforeUnmount(() => stopStream())
</script>

<style scoped lang="scss">
.unified-log-panel {
  --logs-border: rgba(var(--v-theme-primary), 0.18);
  --logs-field: rgba(var(--v-theme-background), 0.72);
  --logs-muted: rgba(var(--v-theme-on-surface), 0.58);
  --logs-terminal: #121226;
  --logs-terminal-bar: #1d1d35;
  --logs-text: rgba(var(--v-theme-on-surface), 0.88);

  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.16), transparent 34%),
    rgba(var(--v-theme-surface), 0.98);
  border: 1px solid var(--logs-border);
  border-radius: 8px;
  color: var(--logs-text);
  overflow: hidden;

  &__toolbar {
    align-items: center;
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.12);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(220px, 1fr) auto auto 160px;
    padding: 12px;
  }

  &__search :deep(.v-field),
  &__range :deep(.v-field) {
    background: var(--logs-field);
    border: 1px solid rgba(var(--v-theme-primary), 0.16);
    border-radius: 6px;
    box-shadow: none;
    color: var(--logs-text);
    min-height: 32px;
  }

  &__search :deep(.v-field__input),
  &__range :deep(.v-field__input) {
    color: var(--logs-text);
    font-size: 12px;
    min-height: 32px;
    padding-bottom: 0;
    padding-top: 0;
  }

  &__group {
    background: var(--logs-field);
    border: 1px solid rgba(var(--v-theme-primary), 0.14);
    border-radius: 6px;
    display: flex;
    overflow: hidden;
  }

  &__filter {
    background: rgba(var(--v-theme-background), 0.72);
    border: 0;
    border-right: 1px solid rgba(var(--v-theme-primary), 0.12);
    color: var(--logs-text);
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
    min-height: 30px;
    padding: 0 10px;

    &:last-child {
      border-right: 0;
    }

    &:hover {
      background: rgba(var(--v-theme-surface), 0.6);
    }

    &--active {
      background: rgba(var(--v-theme-surface), 0.3);
      color: rgb(var(--v-theme-primary));
    }
  }

  &__deploy-state {
    align-items: center;
    background: rgba(var(--v-theme-primary), 0.1);
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.18);
    display: flex;
    gap: 16px;
    justify-content: space-between;
    padding: 10px 14px;

    strong {
      color: rgb(var(--v-theme-on-surface));
      display: block;
      font-size: 12px;
      margin-bottom: 2px;
    }

    span {
      color: var(--logs-muted);
      font-size: 11px;
    }
  }

  &__deploy-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  &__deploy-step {
    border: 1px solid rgba(var(--v-theme-primary), 0.16);
    border-radius: 999px;
    color: var(--logs-muted);
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;

    &--done {
      border-color: rgba(63, 185, 80, 0.32);
      color: #3fb950;
    }

    &--active {
      border-color: rgba(var(--v-theme-primary), 0.42);
      color: #a997ff;
    }
  }
}

.unified-terminal {
  background: var(--logs-terminal);

  &__bar {
    align-items: center;
    background:
      linear-gradient(90deg, rgba(var(--v-theme-primary), 0.16), transparent 52%),
      var(--logs-terminal-bar);
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.16);
    display: grid;
    gap: 12px;
    grid-template-columns: auto 1fr auto;
    min-height: 34px;
    padding: 0 12px;
  }

  &__dots {
    display: flex;
    gap: 6px;
  }

  &__dot {
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
    height: 9px;
    opacity: 0.9;
    width: 9px;

    &--red {
      background: #ff5f57;
    }

    &--yellow {
      background: #febc2e;
    }

    &--green {
      background: #28c840;
    }
  }

  &__title {
    color: var(--logs-muted);
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
    font-size: 11px;
    text-align: center;
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 16px;
  }

  &__body {
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    max-height: 520px;
    min-height: 420px;
    overflow: auto;
    padding: 14px;
    scrollbar-color: rgba(var(--v-theme-primary), 0.42) transparent;
    scrollbar-width: thin;

    &--compact {
      min-height: 86px;
    }
  }

  &__empty,
  &__loading {
    align-items: center;
    color: var(--logs-muted);
    display: flex;
    gap: 8px;
    justify-content: center;
    min-height: 58px;
  }
}

.terminal-line {
  display: grid;
  gap: 12px;
  grid-template-columns: 140px 54px 64px max-content;
  line-height: 1.75;
  min-width: max-content;

  &--focus {
    background: rgba(var(--v-theme-primary), 0.12);
    margin-left: -6px;
    padding-left: 6px;
  }

  &__time {
    color: #a997ff;
  }

  &__level {
    font-weight: 800;
  }

  &__source {
    color: rgba(var(--v-theme-on-surface), 0.48);
    font-weight: 700;
  }

  &__message {
    color: rgba(var(--v-theme-on-surface), 0.9);
    white-space: pre;
  }

  &--info &__level {
    color: #a997ff;
  }

  &--success &__level {
    color: #3fb950;
  }

  &--warning &__level {
    color: #f0b429;
  }

  &--error &__level,
  &--error &__message {
    color: #ff6b6b;
  }

  &--deploy &__source {
    color: #a997ff;
  }

  &--command &__source {
    color: #d6ccff;
  }
}

@media (max-width: 960px) {
  .unified-log-panel {
    &__toolbar {
      align-items: stretch;
      grid-template-columns: 1fr;
    }

    &__group,
    &__deploy-steps {
      justify-content: flex-start;
    }

    &__deploy-state {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
