<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center flex-wrap ga-2">
      <span>
        <v-icon class="mr-2">mdi-cog-sync</v-icon>
        Processos
      </span>

      <v-btn
        :disabled="loading || saving"
        :loading="loading"
        prepend-icon="mdi-refresh"
        size="small"
        variant="tonal"
        @click="emit('refresh')"
      >
        Atualizar do Dokku
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="error"
        class="mb-4"
        density="compact"
        type="error"
        variant="tonal"
      >
        {{ error }}
      </v-alert>

      <v-alert
        v-if="locked"
        class="mb-4"
        color="info"
        density="compact"
        variant="tonal"
      >
        Aguarde a operação atual terminar para alterar a escala.
      </v-alert>

      <v-alert
        v-if="hasStoppedWorker"
        class="mb-4"
        color="warning"
        density="compact"
        icon="mdi-alert-circle"
        variant="tonal"
      >
        Worker detectado, mas ainda não está rodando. Defina a quantidade como 1
        para iniciar o processo.
      </v-alert>

      <div v-if="loading && managedProcesses.length === 0" class="text-center py-4">
        <v-progress-circular class="mb-2" indeterminate size="32" />
        <p class="text-caption text-grey">Sincronizando processos...</p>
      </div>

      <div v-else-if="managedProcesses.length === 0" class="text-center py-4 text-grey">
        <v-icon class="mb-2" color="grey" size="42">mdi-cog-off</v-icon>
        <p class="mb-1">Nenhum processo gerenciável detectado.</p>
        <p class="text-caption">
          Faça um deploy com <code>Procfile</code> contendo processos como
          <code>web</code> ou <code>worker</code>.
        </p>
      </div>

      <template v-else>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Processo</th>
              <th>Rodando</th>
              <th>Desejado</th>
              <th>Última sincronização</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="process in managedProcesses" :key="process.process_name">
              <td>
                <v-chip
                  :color="process.process_name === 'web' ? 'primary' : 'teal'"
                  size="small"
                  variant="tonal"
                >
                  {{ process.process_name }}
                </v-chip>
              </td>
              <td>{{ process.current_quantity }}</td>
              <td style="max-width: 140px;">
                <v-text-field
                  v-model.number="draft[process.process_name]"
                  density="compact"
                  hide-details
                  :max="maxInstances"
                  :min="process.process_name === 'web' ? 1 : 0"
                  :readonly="locked"
                  single-line
                  type="number"
                  variant="outlined"
                />
              </td>
              <td class="text-caption text-grey">
                {{ formatDate(process.last_synced_at) }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex justify-end mt-4">
          <v-btn
            color="primary"
            :disabled="locked || saving || loading || !hasChanges"
            :loading="saving"
            prepend-icon="mdi-content-save"
            @click="emitApply"
          >
            Aplicar escala
          </v-btn>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { AppProcessScale } from '@/interfaces'

  import { computed, ref, watch } from 'vue'

  const props = withDefaults(defineProps<{
    processes: AppProcessScale[]
    loading?: boolean
    saving?: boolean
    locked?: boolean
    error?: string
    maxInstances?: number
  }>(), {
    error: '',
    maxInstances: 5,
  })

  const emit = defineEmits<{
    refresh: []
    apply: [processes: Record<string, number>]
  }>()

  const draft = ref<Record<string, number>>({})

  const managedProcesses = computed(() =>
    props.processes.filter(process => process.process_name !== 'release'),
  )

  const hasStoppedWorker = computed(() =>
    managedProcesses.value.some(process =>
      process.process_name === 'worker' && process.current_quantity === 0
    ),
  )

  const hasChanges = computed(() =>
    managedProcesses.value.some(process =>
      Number(draft.value[process.process_name]) !== process.desired_quantity
    ),
  )

  watch(
    () => props.processes,
    processes => {
      draft.value = Object.fromEntries(
        processes
          .filter(process => process.process_name !== 'release')
          .map(process => [process.process_name, process.desired_quantity]),
      )
    },
    { immediate: true },
  )

  function emitApply () {
    const payload = Object.fromEntries(
      managedProcesses.value.map(process => {
        const rawQuantity = Number(draft.value[process.process_name])
        const minQuantity = process.process_name === 'web' ? 1 : 0
        const quantity = Math.min(
          props.maxInstances,
          Math.max(minQuantity, Number.isFinite(rawQuantity) ? rawQuantity : minQuantity),
        )
        return [process.process_name, quantity]
      }),
    )

    emit('apply', payload)
  }

  function formatDate (value?: string | null) {
    if (!value) return '-'
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>
