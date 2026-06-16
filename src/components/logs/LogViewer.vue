<template>
  <div class="log-console" :class="{ 'log-console--expanded': expanded }">
    <div class="log-console__header">
      <div class="log-console__identity">
        <div aria-hidden="true" class="log-console__window-dots">
          <span class="log-console__dot log-console__dot--red" />
          <span class="log-console__dot log-console__dot--yellow" />
          <span class="log-console__dot log-console__dot--green" />
        </div>

        <div>
          <div class="log-console__title-row">
            <span class="log-console__title">{{ title || 'Logs do app' }}</span>

            <v-chip
              v-if="streaming"
              class="log-console__live-chip"
              color="success"
              density="compact"
              size="x-small"
              variant="flat"
            >
              <v-icon size="10" start>mdi-circle</v-icon>
              live
            </v-chip>
          </div>

          <div class="log-console__subtitle">
            {{ visibleLines.length }} de {{ parsedLines.length }} linha(s)
          </div>
        </div>
      </div>

      <div class="log-console__actions">
        <v-btn
          v-if="!streaming && taskId"
          density="compact"
          icon
          size="small"
          variant="text"
          @click="startStream"
        >
          <v-icon size="18">mdi-play</v-icon>
          <v-tooltip activator="parent" location="top">Acompanhar ao vivo</v-tooltip>
        </v-btn>

        <v-btn
          v-if="streaming"
          density="compact"
          icon
          size="small"
          variant="text"
          @click="stopStream"
        >
          <v-icon color="error" size="18">mdi-stop</v-icon>
          <v-tooltip activator="parent" location="top">Parar live tail</v-tooltip>
        </v-btn>

        <v-btn
          density="compact"
          icon
          size="small"
          variant="text"
          @click="copyVisibleLogs"
        >
          <v-icon size="18">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
          <v-tooltip activator="parent" location="top">Copiar logs visiveis</v-tooltip>
        </v-btn>

        <v-btn
          density="compact"
          icon
          size="small"
          variant="text"
          @click="expanded = !expanded"
        >
          <v-icon size="18">
            {{ expanded ? 'mdi-arrow-collapse' : 'mdi-arrow-expand' }}
          </v-icon>

          <v-tooltip activator="parent" location="top">
            {{ expanded ? 'Reduzir' : 'Expandir' }}
          </v-tooltip>
        </v-btn>
      </div>
    </div>

    <div class="log-console__toolbar">
      <v-text-field
        v-model="search"
        class="log-console__search"
        clearable
        density="compact"
        hide-details
        placeholder="Buscar no log..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
      />

      <div class="log-console__filters">
        <v-chip
          v-for="filter in filters"
          :key="filter.value"
          :color="activeFilter === filter.value ? filter.color : undefined"
          density="compact"
          size="default"
          :variant="activeFilter === filter.value ? 'flat' : 'tonal'"
          @click="activeFilter = filter.value"
        >
          <v-icon size="14" start>{{ filter.icon }}</v-icon>
          {{ filter.label }}
          <span v-if="filter.count !== undefined" class="ml-1">
            {{ filter.count }}
          </span>
        </v-chip>
      </div>
    </div>

    <div v-if="primaryInsight" class="log-console__insight">
      <div class="log-console__insight-icon">
        <v-icon :color="primaryInsight.color" size="20">{{ primaryInsight.icon }}</v-icon>
      </div>

      <div class="log-console__insight-copy">
        <strong>{{ primaryInsight.title }}</strong>
        <span>{{ primaryInsight.description }}</span>
      </div>

      <v-chip
        v-if="errorCount || warningCount"
        class="log-console__insight-chip"
        color="surface"
        size="small"
        variant="tonal"
      >
        {{ errorCount }} erro(s), {{ warningCount }} aviso(s)
      </v-chip>
    </div>

    <div ref="terminalBody" class="log-console__body">
      <div v-if="visibleLines.length === 0 && !loading" class="log-console__empty">
        <v-icon class="mb-2" size="32">mdi-text-box-search-outline</v-icon>
        <span>Nenhum log encontrado com os filtros atuais.</span>
      </div>

      <div
        v-for="line in visibleLines"
        :key="line.key"
        class="log-row"
        :class="`log-row--${line.severity}`"
      >
        <div class="log-row__rail">
          <span class="log-row__bullet" />
        </div>

        <div class="log-row__content">
          <div class="log-row__meta">
            <span v-if="line.time" class="log-row__time">{{ line.time }}</span>

            <v-chip
              class="log-row__badge"
              :color="line.color"
              density="compact"
              size="x-small"
              variant="tonal"
            >
              <v-icon size="12" start>{{ line.icon }}</v-icon>
              {{ line.label }}
            </v-chip>

            <span v-if="line.category" class="log-row__category">
              {{ line.category.toLowerCase() }}
            </span>
          </div>

          <div class="log-row__message">{{ line.text }}</div>

          <div v-if="line.hint" class="log-row__hint">
            <v-icon size="14">mdi-lightbulb-on-outline</v-icon>
            {{ line.hint }}
          </div>
        </div>
      </div>

      <div v-if="loading" class="log-console__loading">
        <v-progress-circular
          color="primary"
          indeterminate
          size="16"
          width="2"
        />

        <span>Carregando logs...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AppLog } from '@/interfaces'
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

  type FilterValue = 'all' | 'attention' | 'errors' | 'steps' | 'success' | 'raw'
  type Severity = 'error' | 'warning' | 'success' | 'step' | 'info' | 'raw'

  interface Props {
    logs: AppLog[]
    loading?: boolean
    title?: string
    taskId?: string
    autoScroll?: boolean
  }

  interface ParsedLine {
    key: string
    time: string
    text: string
    rawText: string
    severity: Severity
    label: string
    icon: string
    color: string
    category: string
    hint: string
    isRawOnly: boolean
  }

  interface Insight {
    title: string
    description: string
    icon: string
    color: string
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    title: 'Deploy Logs',
    autoScroll: true,
  })

  const emit = defineEmits<{
    'stream-logs': [taskId: string, afterId?: number]
    'stop-stream': []
  }>()

  const terminalBody = ref<HTMLElement | null>(null)
  const streaming = ref(false)
  const streamInterval = ref<number | null>(null)
  const expanded = ref(false)
  const search = ref('')
  const activeFilter = ref<FilterValue>('all')
  const copied = ref(false)

  const ERROR_PATTERNS = /\berror\b|failed|failure|fatal|denied|cannot|couldn't|could not|exception|traceback|no such file|exit status|healthcheck failed/i
  const WARNING_PATTERNS = /\bwarning\b|deprecated|skipping|already exists|unhealthy|timeout/i
  const SUCCESS_PATTERNS = /\bsuccess\b|successful|deployed|created|configured|linked|done|complete|completed|all checks successful/i
  const STEP_PATTERNS = /^[-=]+>\s|^----->|^=====>|^running |^building |^installing /i

  const KNOWN_HINTS: Array<{ pattern: RegExp, hint: string }> = [
    {
      pattern: /healthcheck|port listening/i,
      hint: 'O app provavelmente nao respondeu na porta esperada. Confira se ele usa a variavel PORT.',
    },
    {
      pattern: /module not found|modulenotfounderror|cannot find module/i,
      hint: 'Alguma dependencia parece ausente. Confira requirements.txt, pyproject.toml ou package.json.',
    },
    {
      pattern: /collectstatic/i,
      hint: 'Falha em arquivos estaticos. Em Django, confira STATIC_ROOT, whitenoise e dependencias.',
    },
    {
      pattern: /permission denied|publickey/i,
      hint: 'Parece problema de permissao no GitHub ou chave de deploy.',
    },
    {
      pattern: /no such file|manage\.py/i,
      hint: 'O caminho do arquivo/comando pode estar errado para a estrutura do projeto.',
    },
    {
      pattern: /database_url|redis_url|environment|env/i,
      hint: 'Pode faltar variavel de ambiente ou servico vinculado ao app.',
    },
  ]

  const parsedLines = computed<ParsedLine[]>(() => {
    const lines: ParsedLine[] = []

    for (const [logIndex, log] of props.logs.entries()) {
      const message = cleanMessage(log.message)
      if (!message) continue

      const chunks = splitMessage(log.level, message)
      for (const [chunkIndex, chunk] of chunks.entries()) {
        const text = chunk.trim()
        if (!text) continue

        const severity = getSeverity(log.level, text)
        const style = getSeverityStyle(severity)

        lines.push({
          key: `${log.id ?? logIndex}-${chunkIndex}-${severity}`,
          time: formatTime(log.created_at),
          text: makeHumanText(text),
          rawText: text,
          severity,
          label: style.label,
          icon: style.icon,
          color: style.color,
          category: log.category_display || log.category || '',
          hint: findHint(text),
          isRawOnly: log.level === 'DEBUG' || (log.level === 'INFO' && severity === 'info'),
        })
      }
    }

    return lines
  })

  const errorCount = computed(() => parsedLines.value.filter(line => line.severity === 'error').length)
  const warningCount = computed(() => parsedLines.value.filter(line => line.severity === 'warning').length)
  const stepCount = computed(() => parsedLines.value.filter(line => line.severity === 'step').length)
  const successCount = computed(() => parsedLines.value.filter(line => line.severity === 'success').length)

  const filters = computed(() => [
    {
      value: 'all' as const,
      label: 'Todos',
      icon: 'mdi-format-list-bulleted',
      color: 'primary',
      count: parsedLines.value.filter(line => !line.isRawOnly).length,
    },
    {
      value: 'attention' as const,
      label: 'Atencao',
      icon: 'mdi-alert-circle-outline',
      color: 'warning',
      count: errorCount.value + warningCount.value,
    },
    {
      value: 'errors' as const,
      label: 'Erros',
      icon: 'mdi-close-octagon-outline',
      color: 'error',
      count: errorCount.value,
    },
    {
      value: 'steps' as const,
      label: 'Etapas',
      icon: 'mdi-debug-step-over',
      color: 'info',
      count: stepCount.value,
    },
    {
      value: 'success' as const,
      label: 'Sucesso',
      icon: 'mdi-check-circle-outline',
      color: 'success',
      count: successCount.value,
    },
    {
      value: 'raw' as const,
      label: 'Raw',
      icon: 'mdi-code-tags',
      color: 'grey',
      count: parsedLines.value.length,
    },
  ])

  const visibleLines = computed(() => {
    const query = normalizeSearch(search.value)

    return parsedLines.value.filter(line => {
      if (activeFilter.value === 'all' && line.isRawOnly) return false
      if (activeFilter.value === 'attention' && !['error', 'warning'].includes(line.severity)) return false
      if (activeFilter.value === 'errors' && line.severity !== 'error') return false
      if (activeFilter.value === 'steps' && line.severity !== 'step') return false
      if (activeFilter.value === 'success' && line.severity !== 'success') return false

      if (!query) return true
      const haystack = normalizeSearch(`${line.text} ${line.rawText} ${line.category} ${line.hint}`)
      return haystack.includes(query)
    })
  })

  const primaryInsight = computed<Insight | null>(() => {
    const firstError = parsedLines.value.find(line => line.severity === 'error')
    if (firstError) {
      return {
        title: 'Algo quebrou neste fluxo',
        description: firstError.hint || firstError.text,
        icon: 'mdi-alert-octagon',
        color: 'error',
      }
    }

    const firstWarning = parsedLines.value.find(line => line.severity === 'warning')
    if (firstWarning) {
      return {
        title: 'Tem aviso para revisar',
        description: firstWarning.hint || firstWarning.text,
        icon: 'mdi-alert',
        color: 'warning',
      }
    }

    if (successCount.value > 0) {
      return null
    }

    return null
  })

  function splitMessage (level: string, message: string): string[] {
    if (level !== 'DOKKU') {
      return message.split('\n')
    }

    return message
      .split(/\n|(?=----->)|(?======>)/)
      .filter(Boolean)
  }

  function getSeverity (level: string, text: string): Severity {
    if (level === 'ERROR' || isErrorLine(text)) return 'error'
    if (level === 'WARNING' || isWarningLine(text)) return 'warning'
    if (level === 'SUCCESS' || SUCCESS_PATTERNS.test(text)) return 'success'
    if (level === 'DOKKU' && STEP_PATTERNS.test(text)) return 'step'
    if (level === 'DEBUG') return 'raw'
    return 'info'
  }

  function getSeverityStyle (severity: Severity) {
    switch (severity) {
      case 'error': {
        return { label: 'erro', icon: 'mdi-close-octagon', color: 'error' }
      }
      case 'warning': {
        return { label: 'aviso', icon: 'mdi-alert', color: 'warning' }
      }
      case 'success': {
        return { label: 'ok', icon: 'mdi-check-circle', color: 'success' }
      }
      case 'step': {
        return { label: 'etapa', icon: 'mdi-debug-step-over', color: 'info' }
      }
      case 'raw': {
        return { label: 'raw', icon: 'mdi-code-tags', color: 'grey' }
      }
      default: {
        return { label: 'info', icon: 'mdi-information-outline', color: 'primary' }
      }
    }
  }

  function isErrorLine (text: string): boolean {
    if (WARNING_PATTERNS.test(text) && !ERROR_PATTERNS.test(text)) return false
    if (text.startsWith('! ') && !ERROR_PATTERNS.test(text)) return false
    return ERROR_PATTERNS.test(text)
  }

  function isWarningLine (text: string): boolean {
    if (WARNING_PATTERNS.test(text)) return true
    return text.startsWith('! ') && !ERROR_PATTERNS.test(text)
  }

  function findHint (text: string): string {
    return KNOWN_HINTS.find(item => item.pattern.test(text))?.hint || ''
  }

  function makeHumanText (text: string): string {
    return text
      .replace(/^[-=]+>\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function formatTime (timestamp?: string): string {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function cleanMessage (msg: string): string {
    return msg
      .replace(/\u001B\[[0-9;]*[A-Za-z]/g, '')
      .replace(/\u001B\].*?(?:\u0007|\u001B\\)/g, '')
      .replace(/\u001B/g, '')
      .replace(/\r/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
  }

  function normalizeSearch (value: string): string {
    return value.trim().toLowerCase()
  }

  function scrollToBottom () {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
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

  function stopStream () {
    streaming.value = false
    if (streamInterval.value) {
      clearInterval(streamInterval.value)
      streamInterval.value = null
    }
    emit('stop-stream')
  }

  async function copyVisibleLogs () {
    const text = visibleLines.value
      .map(line => `[${line.time || '--:--:--'}] ${line.label.toUpperCase()} ${line.rawText}`)
      .join('\n')

    if (!text) return

    await navigator.clipboard.writeText(text)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1200)
  }

  watch(
    () => props.logs.length,
    () => {
      if (props.autoScroll) nextTick(scrollToBottom)
    },
  )

  watch(activeFilter, () => {
    nextTick(scrollToBottom)
  })

  onBeforeUnmount(() => stopStream())
</script>

<style scoped lang="scss">
.log-console {
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #c9d1d9;
  overflow: hidden;

  &--expanded {
    .log-console__body {
      max-height: 78vh;
    }
  }

  &__header {
    align-items: center;
    background: #161b22;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
  }

  &__identity {
    align-items: center;
    display: flex;
    gap: 12px;
    min-width: 0;
  }

  &__window-dots {
    display: flex;
    gap: 6px;
  }

  &__dot {
    border-radius: 999px;
    height: 9px;
    opacity: 0.8;
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

  &__title-row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__title {
    color: #8b949e;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__subtitle {
    color: #6e7681;
    font-size: 11px;
    margin-top: 2px;
  }

  &__live-chip {
    text-transform: uppercase;
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 4px;
  }

  &__toolbar {
    align-items: center;
    background: #0d1117;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(220px, 0.7fr) 1fr;
    padding: 8px 14px;
  }

  &__search :deep(.v-field) {
    background: #161b22;
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: none;
    color: #c9d1d9;
    min-height: 34px;
  }

  &__search :deep(.v-field__input) {
    color: #c9d1d9;
    font-size: 12px;
    min-height: 34px;
    padding-bottom: 0;
    padding-top: 0;
  }

  &__search :deep(.v-field__prepend-inner) {
    color: #6e7681;
  }

  &__filters {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  &__filters :deep(.v-chip) {
    font-size: 10px;
    letter-spacing: 0.01em;
  }

  &__insight {
    align-items: center;
    background: rgba(248, 81, 73, 0.08);
    border-bottom: 1px solid rgba(248, 81, 73, 0.18);
    display: grid;
    gap: 10px;
    grid-template-columns: auto 1fr auto;
    padding: 9px 14px;
  }

  &__insight-icon {
    align-items: center;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    display: flex;
    height: 28px;
    justify-content: center;
    width: 28px;
  }

  &__insight-copy {
    display: grid;
    gap: 2px;

    strong {
      color: #f0f6fc;
      font-size: 12px;
    }

    span {
      color: #c9d1d9;
      font-size: 12px;
      line-height: 1.45;
    }
  }

  &__body {
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    max-height: 420px;
    min-height: 140px;
    overflow-y: auto;
    padding: 10px 0;
    scrollbar-color: #30363d transparent;
    scrollbar-width: thin;
  }

  &__empty,
  &__loading {
    align-items: center;
    color: #6e7681;
    display: flex;
    gap: 8px;
    justify-content: center;
    min-height: 6px;
  }

  &__empty {
    flex-direction: column;
    font-family: inherit;
    font-size: 13px;
  }

  &__loading {
    font-size: 12px;
    min-height: 60px;
    padding: 6px 0 4px;
  }
}

.log-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 18px 1fr;
  padding: 4px 14px 4px 0;

  &:hover {
    background: rgba(255, 255, 255, 0.035);
  }

  &__rail {
    align-items: flex-start;
    display: flex;
    justify-content: center;
    padding-top: 10px;
    position: relative;

    &::before {
      background: rgba(255, 255, 255, 0.06);
      bottom: -12px;
      content: "";
      position: absolute;
      top: 16px;
      width: 1px;
    }
  }

  &:last-child &__rail::before {
    display: none;
  }

  &__bullet {
    background: #484f58;
    border-radius: 999px;
    height: 5px;
    width: 5px;
    z-index: 1;
  }

  &__content {
    min-width: 0;
  }

  &__meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 2px;
  }

  &__time,
  &__category {
    color: #6e7681;
    font-size: 11px;
  }

  &__badge {
    opacity: 0.88;
    text-transform: uppercase;
  }

  &__message {
    color: #c9d1d9;
    font-size: 12px;
    line-height: 1.65;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  &__hint {
    align-items: center;
    background: rgba(88, 166, 255, 0.08);
    border-left: 2px solid rgba(88, 166, 255, 0.42);
    border-radius: 6px;
    color: #8b949e;
    display: flex;
    font-family: inherit;
    font-size: 11px;
    gap: 6px;
    margin-top: 5px;
    padding: 6px 8px;
  }

  &--error {
    background: rgba(248, 81, 73, 0.055);

    .log-row__bullet {
      background: #f85149;
    }

    .log-row__message {
      color: #ffb4ad;
    }
  }

  &--warning {
    .log-row__bullet {
      background: #d29922;
    }

    .log-row__message {
      color: #e3b341;
    }
  }

  &--success {
    .log-row__bullet {
      background: #3fb950;
    }
  }

  &--step {
    .log-row__bullet {
      background: #58a6ff;
    }

    .log-row__message {
      color: #79c0ff;
      font-weight: 600;
    }
  }
}

@media (max-width: 780px) {
  .log-console {
    &__header,
    &__toolbar,
    &__insight {
      align-items: stretch;
      grid-template-columns: 1fr;
    }

    &__header {
      flex-direction: column;
      gap: 12px;
    }

    &__actions,
    &__filters {
      justify-content: flex-start;
    }

    &__insight-chip {
      justify-self: flex-start;
    }
  }
}
</style>
