<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>
        <v-icon class="mr-2">mdi-console</v-icon>
        Console
      </span>
    </v-card-title>

    <v-card-text>
      <p class="text-caption text-grey mb-3">
        Execute comandos dentro do container da aplicação (ex: migrate,
        collectstatic).
      </p>

      <!-- Comandos rápidos -->
      <div class="mb-3">
        <p class="text-subtitle-2 mb-2">Comandos rápidos</p>

        <div class="d-flex flex-wrap ga-2">
          <v-chip
            color="primary"
            :disabled="running"
            variant="outlined"
            @click="emit('run', 'python manage.py migrate')"
          >
            <v-icon class="mr-1" size="small">mdi-database-sync</v-icon>
            Django Migrate
          </v-chip>

          <v-chip
            color="primary"
            :disabled="running"
            variant="outlined"
            @click="emit('run', 'python manage.py collectstatic --noinput')"
          >
            <v-icon class="mr-1" size="small">mdi-folder-sync</v-icon>
            Collectstatic
          </v-chip>

          <v-chip
            color="primary"
            :disabled="running"
            variant="outlined"
            @click="emit('run', 'npx prisma migrate deploy')"
          >
            <v-icon class="mr-1" size="small">mdi-database-arrow-right</v-icon>
            Prisma Migrate
          </v-chip>

          <v-chip
            color="primary"
            :disabled="running"
            variant="outlined"
            @click="emit('run', 'php artisan migrate --force')"
          >
            <v-icon class="mr-1" size="small">mdi-language-php</v-icon>
            Laravel Migrate
          </v-chip>

          <v-chip
            color="primary"
            :disabled="running"
            variant="outlined"
            @click="emit('run', 'rails db:migrate')"
          >
            <v-icon class="mr-1" size="small">mdi-diamond-stone</v-icon>
            Rails Migrate
          </v-chip>
        </div>
      </div>

      <v-divider class="mb-3" />

      <!-- Comando personalizado -->
      <div class="d-flex ga-2">
        <v-text-field
          v-model="customCommand"
          density="compact"
          :disabled="running"
          hide-details
          label="Comando personalizado"
          placeholder="python manage.py showmigrations"
          prepend-inner-icon="mdi-chevron-right"
          variant="outlined"
          @keyup.enter="handleSubmit"
        />

        <v-btn
          color="primary"
          :disabled="!customCommand.trim()"
          :loading="running"
          variant="tonal"
          @click="handleSubmit"
        >
          <v-icon>mdi-play</v-icon>
        </v-btn>
      </div>

      <!-- Output do comando -->
      <div v-if="output || running" class="mt-3">
        <div class="console-output rounded pa-3">
          <div v-if="running" class="d-flex align-center text-primary">
            <v-progress-circular
              class="mr-2"
              indeterminate
              size="16"
              width="2"
            />

            <span class="text-caption">Executando comando...</span>
          </div>

          <div v-else>
            <div class="d-flex justify-space-between align-center mb-2">
              <span
                class="text-caption"
                :class="success ? 'text-success' : 'text-error'"
              >
                <v-icon size="small">{{
                  success ? "mdi-check-circle" : "mdi-alert-circle"
                }}</v-icon>
                {{ success ? "Comando executado" : "Falha na execução" }}
              </span>

              <v-btn icon size="x-small" variant="text" @click="emit('clear')">
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>

            <pre class="text-caption console-text">{{ output }}</pre>
          </div>
        </div>
      </div>

      <v-alert
        class="mt-3"
        color="info"
        density="compact"
        icon="mdi-information"
        variant="tonal"
      >
        Os comandos são executados via <code>dokku run</code> dentro do
        container. Acompanhe o output completo nos Logs.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineProps<{
    running?: boolean
    output?: string
    success?: boolean
  }>()

  const emit = defineEmits<{
    run: [command: string]
    clear: []
  }>()

  const customCommand = ref('')

  function handleSubmit () {
    if (!customCommand.value.trim()) return
    emit('run', customCommand.value.trim())
  }
</script>

<style scoped>
.console-output {
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.console-text {
  color: #d4d4d4;
  font-family: "Cascadia Code", "Fira Code", "Consolas", monospace;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
}
</style>
