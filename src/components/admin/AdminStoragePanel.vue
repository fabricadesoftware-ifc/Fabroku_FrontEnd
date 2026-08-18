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
          <thead>
            <tr>
              <th class="sortable-header" @click="sortBy('project_name')">
                Projeto
                <v-icon v-if="sortColumn === 'project_name'" size="small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th class="sortable-header" @click="sortBy('app_name')">
                App
                <v-icon v-if="sortColumn === 'app_name'" size="small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th class="sortable-header" @click="sortBy('service_name')">
                Serviço
                <v-icon v-if="sortColumn === 'service_name'" size="small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
              <th class="sortable-header text-right" @click="sortBy('size_bytes')">
                Tamanho
                <v-icon v-if="sortColumn === 'size_bytes'" size="small" class="ml-1">
                  {{ sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="service in sortedServices" :key="service.service_id">
              <td>{{ service.project_name }}</td>
              <td>{{ service.app_name ?? '-' }}</td>
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
  import { ref, computed } from 'vue'
  import type { StorageUsage } from '@/modules/administration/domain/models'

  const props = defineProps<{
    error: string | null
    loading: boolean
    usage: StorageUsage | null
  }>()

  const emit = defineEmits<{ refresh: [] }>()

  type SortColumn = 'project_name' | 'app_name' | 'service_name' | 'size_bytes'
  type SortDirection = 'asc' | 'desc'

  const sortColumn = ref<SortColumn>('size_bytes')
  const sortDirection = ref<SortDirection>('desc')

  const sortedServices = computed(() => {
    if (!props.usage?.services?.length) return []

    const services = [...props.usage.services]

    return services.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortColumn.value) {
        case 'project_name':
          aValue = a.project_name?.toLowerCase() || ''
          bValue = b.project_name?.toLowerCase() || ''
          break
        case 'app_name':
          aValue = a.app_name?.toLowerCase() || ''
          bValue = b.app_name?.toLowerCase() || ''
          break
        case 'service_name':
          aValue = (a.container_name || a.service_name)?.toLowerCase() || ''
          bValue = (b.container_name || b.service_name)?.toLowerCase() || ''
          break
        case 'size_bytes':
          aValue = a.size_bytes || 0
          bValue = b.size_bytes || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  })

  function sortBy(column: SortColumn) {
    if (sortColumn.value === column) {
      // Alterna direção se clicar na mesma coluna
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // Nova coluna: define como ascendente por padrão (exceto para tamanho que é descendente)
      sortColumn.value = column
      sortDirection.value = column === 'size_bytes' ? 'desc' : 'asc'
    }
  }
</script>

<style scoped>
  .sortable-header {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
  }

  .sortable-header:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
</style>
