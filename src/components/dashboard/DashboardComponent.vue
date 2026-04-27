<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4 mb-6">Dashboard</h1>
    </div>

    <v-progress-linear v-if="loading" class="mb-4" indeterminate />

    <!-- Quota Usage Cards -->
    <v-row v-if="quota" class="mb-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-application</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Apps</span>
              </div>
              <v-chip
                :color="
                  quota.max_apps == null
                    ? 'grey'
                    : getQuotaColor(quota.apps_count, quota.max_apps)
                "
                size="small"
                variant="tonal"
              >
                {{
                  quota.max_apps == null
                    ? `${quota.apps_count} / ∞`
                    : `${quota.apps_count} / ${quota.max_apps}`
                }}
              </v-chip>
            </div>
            <v-progress-linear
              v-if="quota.max_apps != null"
              :color="getQuotaColor(quota.apps_count, quota.max_apps)"
              :model-value="(quota.apps_count / quota.max_apps) * 100"
              rounded
            />
            <v-progress-linear v-else color="grey" :model-value="0" rounded />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="secondary">mdi-database</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Serviços</span>
              </div>
              <v-chip
                :color="
                  quota.max_services == null
                    ? 'grey'
                    : getQuotaColor(quota.services_count, quota.max_services)
                "
                size="small"
                variant="tonal"
              >
                {{
                  quota.max_services == null
                    ? `${quota.services_count} / ∞`
                    : `${quota.services_count} / ${quota.max_services}`
                }}
              </v-chip>
            </div>
            <v-progress-linear
              v-if="quota.max_services != null"
              :color="getQuotaColor(quota.services_count, quota.max_services)"
              :model-value="(quota.services_count / quota.max_services) * 100"
              rounded
            />
            <v-progress-linear v-else color="grey" :model-value="0" rounded />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
                {{ formatGitUrl(app.git) }}
              </v-list-item-subtitle>
              <v-list-item-subtitle v-if="app.last_commit_sha" class="text-caption">
                <v-icon class="mr-1" color="primary" size="12">mdi-source-commit</v-icon>
                {{ app.last_commit_sha.slice(0, 7) }}
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
  import UsersService from '@/services/users'
  import { useAppStore, useProjectStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'

  const router = useRouter()
  const projectStore = useProjectStore()
  const appStore = useAppStore()

  const loading = ref(true)
  const showRepos = ref(false)

  const quota = ref<{
    max_apps: number | null
    max_services: number | null
    apps_count: number
    services_count: number
    can_create_app: boolean
    can_create_service: boolean
  } | null>(null)

  const _stats = computed(() => ({
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
      await Promise.all([
        projectStore.fetchProjects(),
        appStore.fetchApps(),
        UsersService.getMyQuota()
          .then(q => {
            quota.value = q
          })
          .catch(() => {}),
      ])
    } finally {
      loading.value = false
    }
  })

  function getQuotaColor (current: number, max: number | null): string {
    if (max == null) return 'grey'
    const ratio = current / max
    if (ratio >= 1) return 'error'
    if (ratio >= 0.8) return 'warning'
    return 'success'
  }

  function formatDate (dateString?: string) {
    if (!dateString) {
      return '-'
    }
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function formatGitUrl (url?: string) {
    if (!url) return '-'
    const match = url.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/)
    return match ? match[1] : url
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
