<template>
  <v-card v-if="loading && service" class="mt-4" color="primary" variant="tonal">
    <v-card-title class="d-flex align-center"><v-icon class="mr-2 mdi-spin">mdi-loading</v-icon>Provisionando serviço...</v-card-title>

    <v-card-text>
      <div v-if="status" class="mb-2">
        <div class="d-flex justify-space-between mb-1"><span>{{ status.status || 'Processando...' }}</span><span v-if="status.current != null">{{ status.current }}%</span></div>

        <v-progress-linear
          v-if="status.current != null"
          color="primary"
          height="8"
          :model-value="status.current"
          rounded
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { TaskStatus } from '@/modules/applications/domain/models'
  import type { Service } from '@/modules/services/domain/models'

  defineProps<{ loading: boolean, service: Service | null, status: TaskStatus | null }>()
</script>
