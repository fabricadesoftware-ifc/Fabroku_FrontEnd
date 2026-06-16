<template>
  <div class="logs-and-console">
    <div class="logs-tabs">
      <v-tabs v-model="activeTab" density="compact">
        <v-tab value="logs">
          <v-icon size="16" start>mdi-console</v-icon>
          Logs
        </v-tab>

      </v-tabs>
    </div>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="logs">
        <UnifiedLogsMock
          :live-active="liveActive"
          :live-available="liveAvailable"
          :loading="loading"
          :logs="logs"
          :output="output"
          :running="running"
          :status="status"
          :success="success"
          :task-id="taskId"
          :title="title"
          @clear-output="emit('clear')"
          @start-live="emit('start-live')"
          @stop-live="emit('stop-live')"
          @stop-stream="emit('stop-stream')"
          @stream-logs="(tid, afterId) => emit('stream-logs', tid, afterId)"
        />
      </v-tabs-window-item>
    </v-tabs-window>

    <div
      v-if="activeTab === 'logs'"
      class="logs-console__prompt"
    >
      <span v-if="running" class="logs-console__prompt-spinner">
        <v-progress-circular indeterminate size="14" width="2" />
      </span>

      <span v-else class="logs-console__prompt-icon">$</span>

      <input
        v-model="commandInput"
        class="logs-console__input"
        :disabled="running"
        placeholder="python manage.py migrate"
        type="text"
        @keydown.enter="submitCommand"
      >
    </div>

  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  import UnifiedLogsMock from '@/components/logs/UnifiedLogsMock.vue'

  defineProps<{
    logs: any[]
    loading?: boolean
    taskId?: string
    title?: string
    running?: boolean
    output?: string
    success?: boolean
    status?: string
    liveAvailable?: boolean
    liveActive?: boolean
  }>()

  const emit = defineEmits<{
    'stream-logs': [taskId: string, afterId?: number]
    'stop-stream': []
    'start-live': []
    'stop-live': []
    'run': [command: string]
    'clear': []
  }>()

  const commandInput = ref('')
  const activeTab = ref<'logs'>('logs')

  function submitCommand () {
    const cmd = commandInput.value.trim()
    if (!cmd) return
    emit('run', cmd)
    commandInput.value = ''
  }
</script>

<style scoped>
.logs-and-console {
  --logs-border: rgba(255, 255, 255, 0.08);

  border-radius: 8px;
  overflow: hidden;
}

.logs-tabs {
  background: #0d1117;
  border: 1px solid var(--logs-border);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  padding: 0 8px;
}

.logs-tabs :deep(.v-tab) {
  color: #8b949e;
  font-size: 12px;
  letter-spacing: 0;
  min-height: 38px;
  text-transform: none;
}

.logs-tabs :deep(.v-tab--selected) {
  color: #c9d1d9;
}

.logs-tabs + :deep(.v-window) .unified-log-panel {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.logs-console__prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #161b22;
  border: 1px solid var(--logs-border);
  border-radius: 0 0 8px 8px;
  border-top: 0;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 13px;
}

.logs-console__prompt-icon,
.logs-console__prompt-spinner {
  flex-shrink: 0;
}

.logs-console__prompt-icon {
  color: #3fb950;
}

.logs-console__input {
  flex: 1;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: inherit;
  outline: none;
}

.logs-console__input::placeholder {
  color: #484f58;
}

.logs-console__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
