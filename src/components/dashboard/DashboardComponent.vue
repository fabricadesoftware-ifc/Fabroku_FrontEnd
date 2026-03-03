<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4 mb-6">Dashboard</h1>
    </div>

    <v-progress-linear v-if="loading" class="mb-4" indeterminate />

    <v-row>
      <!-- Projetos Recentes -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Projetos Recentes</span>
            <v-btn
              color="primary"
              size="small"
              :to="'/projects'"
              variant="text"
            >
              Ver todos
            </v-btn>
          </v-card-title>
          <v-list v-if="recentProjects.length > 0">
            <v-list-item
              v-for="project in recentProjects"
              :key="project.id"
              :to="`/projects/${project.id}`"
            >
              <template #prepend>
                <v-icon>mdi-folder</v-icon>
              </template>
              <v-list-item-title>{{ project.name }}</v-list-item-title>
              <v-list-item-subtitle>
                Criado em {{ formatDate(project.created_at) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-grey">
            <v-icon class="mb-2" size="48">mdi-folder-outline</v-icon>
            <p>Nenhum projeto ainda</p>
            <v-btn class="mt-2" color="primary" to="/projects">
              Criar Projeto
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Apps Recentes -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Apps Recentes</v-card-title>
          <v-list v-if="recentApps.length > 0">
            <v-list-item
              v-for="app in recentApps"
              :key="app.id"
              :to="`/projects/${app.project}/${app.id}`"
            >
              <template #prepend>
                <v-icon :color="getStatusColor(app.status)">
                  {{ getStatusIcon(app.status) }}
                </v-icon>
              </template>
              <v-list-item-title>{{ app.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ app.git }}
              </v-list-item-subtitle>
              <template #append>
                <v-chip :color="getStatusColor(app.status)" size="x-small">
                  {{ formatStatus(app.status) }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-grey">
            <v-icon class="mb-2" size="48">mdi-application-outline</v-icon>
            <p>Nenhum app ainda</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Repositórios -->
    <v-dialog v-model="showRepos" max-width="600">
      <RepoSelector @cancel="showRepos = false" @select="handleRepoSelect" />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { GitRepo } from '@/interfaces'

  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import RepoSelector from '@/components/git/RepoSelector.vue'
  import { useAppStore, useProjectStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'

  const router = useRouter()
  const projectStore = useProjectStore()
  const appStore = useAppStore()

  const loading = ref(true)
  const showRepos = ref(false)

  const stats = computed(() => ({
    projects: projectStore.projects.length,
    apps: appStore.apps.length,
    running: appStore.apps.filter(a => a.status === 'RUNNING').length,
    errors: appStore.apps.filter(a => a.status === 'ERROR').length,
  }))

  const recentProjects = computed(() => {
    const sorted = [...projectStore.projects]
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
    return sorted.slice(0, 5)
  })

  const recentApps = computed(() => {
    const sorted = [...appStore.apps]
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
    return sorted.slice(0, 5)
  })

  onMounted(async () => {
    try {
      await Promise.all([projectStore.fetchProjects(), appStore.fetchApps()])
    } finally {
      loading.value = false
    }
  })

  function formatDate (dateString?: string) {
    if (!dateString) {
      return '-'
    }
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Helpers importados de @/utils/status

  function handleRepoSelect (repo: GitRepo) {
    showRepos.value = false
    // Redireciona para criar projeto com o repo selecionado
    router.push({
      path: '/projects',
      query: { repo: repo.clone_url, name: repo.name },
    })
  }
</script>
