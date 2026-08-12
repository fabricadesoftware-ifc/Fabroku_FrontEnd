<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-database</v-icon>
      Uso de espaço dos bancos Postgres
      <v-btn v-if="loading" class="ml-2" icon size="small">
        <v-progress-circular indeterminate size="20" width="2" />
      </v-btn>

      <v-btn
        v-else
        class="ml-2"
        icon
        size="small"
        variant="text"
        @click="emit('refresh')"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div v-if="error" class="text-error text-caption">{{ error }}</div>

      <template v-else>
        <p class="text-h6 mb-3">Total: <strong>{{ usage?.total_formatted ?? '-' }}</strong></p>

        <v-table v-if="usage?.services?.length" density="compact">
          <thead><tr><th>Projeto</th><th>App</th><th>Serviço</th><th class="text-right">Tamanho</th></tr></thead>

          <tbody>
            <tr v-for="service in usage.services" :key="service.service_id">
              <td>{{ service.project_name }}</td><td>{{ service.app_name ?? '-' }}</td>
              <td><code class="text-caption">{{ service.container_name ?? service.service_name }}</code></td>
              <td class="text-right">{{ service.size_formatted }}</td>
            </tr>
          </tbody>
        </v-table>

        <p v-else class="text-grey text-caption">Nenhum banco Postgres encontrado.</p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { StorageUsage } from '@/modules/administration/domain/models'

  defineProps<{
    error: string | null
    loading: boolean
    usage: StorageUsage | null
  }>()

  const emit = defineEmits<{ refresh: [] }>()
</script>
