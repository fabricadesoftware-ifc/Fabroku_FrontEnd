<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Administração</h1>
        <p class="text-grey">Gerenciar todos os projetos do sistema</p>
      </div>
    </div>

    <!-- Uso de espaço dos bancos -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-database</v-icon>
        Uso de espaço dos bancos Postgres
        <v-btn
          v-if="storageLoading"
          class="ml-2"
          icon
          size="small"
        >
          <v-progress-circular indeterminate size="20" width="2" />
        </v-btn>
        <v-btn
          v-else
          class="ml-2"
          icon
          size="small"
          variant="text"
          @click="fetchStorageUsage"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="storageError" class="text-error text-caption">
          {{ storageError }}
        </div>
        <template v-else>
          <p class="text-h6 mb-3">
            Total: <strong>{{ storageUsage?.total_formatted ?? '-' }}</strong>
          </p>
          <v-table v-if="storageUsage?.services?.length" density="compact">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>App</th>
                <th>Serviço</th>
                <th class="text-right">Tamanho</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in storageUsage.services"
                :key="s.service_id"
              >
                <td>{{ s.project_name }}</td>
                <td>{{ s.app_name ?? '-' }}</td>
                <td>
                  <code class="text-caption">{{ s.container_name ?? s.service_name }}</code>
                </td>
                <td class="text-right">{{ s.size_formatted }}</td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="text-grey text-caption">
            Nenhum banco Postgres encontrado.
          </p>
        </template>
      </v-card-text>
    </v-card>

    <!-- Filtros -->
    <v-chip-group v-model="filterSelection" class="mb-4" mandatory>
      <v-chip value="all">Todos</v-chip>
      <v-chip value="mine">Meus Projetos</v-chip>
      <v-chip value="others">Outros Usuários</v-chip>
    </v-chip-group>

    <!-- Loading -->
    <v-progress-linear v-if="projectStore.loading" indeterminate />

    <!-- Lista de Projetos -->
    <v-row v-if="!projectStore.loading">
      <v-col
        v-for="project in filteredProjects"
        :key="project.id"
        cols="12"
        md="4"
      >
        <v-card
          class="h-100"
          hover
          @click="$router.push(`/admin/projects/${project.id}`)"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-folder</v-icon>
              {{ project.name }}
            </div>
            <v-chip
              :color="project.is_owner ? 'success' : 'grey'"
              :prepend-icon="project.is_owner ? 'mdi-account-check' : 'mdi-account'"
              size="small"
            >
              {{ project.is_owner ? 'Meu' : 'Outro' }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle>
            Criado em: {{ formatDate(project.created_at) }}
          </v-card-subtitle>
          <v-card-text>
            <v-chip class="mr-1" size="small">
              <v-icon size="small" start>mdi-account-multiple</v-icon>
              {{ project.users?.length || 0 }} usuários
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              :to="`/admin/projects/${project.id}`"
              variant="text"
            >
              Ver Apps
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="filteredProjects.length === 0" cols="12">
        <v-card class="text-center pa-8">
          <v-icon
            class="mb-4"
            color="grey"
            size="64"
          >mdi-folder-outline</v-icon>
          <h3 class="text-h6 mb-2">Nenhum projeto encontrado</h3>
          <p class="text-grey">
            {{ getEmptyMessage() }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import type { StorageUsageResponse } from '@/services/admin'

  import { computed, onMounted, ref } from 'vue'

  import AdminService from '@/services/admin'
  import { useProjectStore } from '@/stores'

  const projectStore = useProjectStore()
  const filterSelection = ref('all')
  const storageUsage = ref<StorageUsageResponse | null>(null)
  const storageLoading = ref(false)
  const storageError = ref<string | null>(null)

  async function fetchStorageUsage () {
    storageLoading.value = true
    storageError.value = null
    try {
      storageUsage.value = await AdminService.getStorageUsage()
    } catch (error) {
      storageError.value = error instanceof Error ? error.message : 'Erro ao carregar uso de espaço'
    } finally {
      storageLoading.value = false
    }
  }

  onMounted(() => {
    projectStore.fetchProjects()
    fetchStorageUsage()
  })

  const filteredProjects = computed(() => {
    if (filterSelection.value === 'mine') {
      return projectStore.projects.filter(p => p.is_owner)
    }
    if (filterSelection.value === 'others') {
      return projectStore.projects.filter(p => !p.is_owner)
    }
    return projectStore.projects
  })

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function getEmptyMessage () {
    if (filterSelection.value === 'mine') {
      return 'Você não possui projetos'
    }
    if (filterSelection.value === 'others') {
      return 'Não há projetos de outros usuários'
    }
    return 'Nenhum projeto no sistema'
  }
</script>
