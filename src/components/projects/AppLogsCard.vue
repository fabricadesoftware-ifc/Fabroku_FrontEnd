<template>
  <div class="logs-and-console">
    <LogViewer
      :loading="loading"
      :logs="logs"
      :task-id="taskId"
      :title="title"
      @stop-stream="emit('stop-stream')"
      @stream-logs="(tid, afterId) => emit('stream-logs', tid, afterId)"
    />
    <!-- Input de comando estilo terminal -->
    <div class="logs-console__prompt">
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
    <!-- Output do comando -->
    <div v-if="output" class="logs-console__output">
      <pre :class="success ? 'text-success' : 'text-error'">{{ output }}</pre>
      <v-btn
        icon
        size="x-small"
        variant="text"
        @click="emit('clear')"
      >
        <v-icon size="small">mdi-close</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  import LogViewer from '@/components/logs/LogViewer.vue'

  defineProps<{
    logs: any[]
    loading?: boolean
    taskId?: string
    title?: string
    running?: boolean
    output?: string
    success?: boolean
  }>()

  const emit = defineEmits<{
    'stream-logs': [taskId: string, afterId?: number]
    'stop-stream': []
    'run': [command: string]
    'clear': []
  }>()

  const commandInput = ref('')

  function submitCommand () {
    const cmd = commandInput.value.trim()
    if (!cmd) return
    emit('run', cmd)
    commandInput.value = ''
  }
</script>

<style scoped>
.logs-and-console {
  overflow: hidden;
}

.logs-console__prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #161b22;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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

.logs-console__output {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  background: #1e1e1e;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 12px;
}

.logs-console__output pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
}
</style>
