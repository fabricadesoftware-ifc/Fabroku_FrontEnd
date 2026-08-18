<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push('/admin')"
    >
      Voltar para Administração
    </v-btn>

    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="user && !loading">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center ga-4">
          <UserAvatar
            :alt="user.name || user.email"
            :src="user.avatar_url"
            size="80"
          />

          <div>
            <h1 class="text-h4">{{ user.name || 'Sem nome' }}</h1>
            <p class="text-grey text-body-1 mb-2">{{ user.email }}</p>

            <div class="d-flex ga-2 flex-wrap">
              <v-chip
                v-if="user.is_superuser"
                color="warning"
                size="small"
              >
                <v-icon size="14" start>mdi-shield-crown</v-icon>
                Administrador
              </v-chip>

              <v-chip
                v-else-if="user.is_fabric"
                color="info"
                size="small"
              >
                <v-icon size="14" start>mdi-account-hard-hat</v-icon>
                Usuário Privilegiado
              </v-chip>

              <v-chip
                :color="user.is_active ? 'success' : 'error'"
                size="small"
              >
                {{ user.is_active ? 'Ativo' : 'Desabilitado' }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="h-100">
            <v-card-title>
              <v-icon class="mr-2">mdi-chart-box-outline</v-icon>
              Quotas e Uso
            </v-card-title>

            <v-card-text>
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">Apps</span>
                  <v-chip
                    :color="getQuotaColor(user.apps_count, user.max_apps)"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.is_superuser ? '∞' : `${user.apps_count ?? 0}/${user.max_apps ?? '?'}` }}
                  </v-chip>
                </div>

                <v-progress-linear
                  v-if="!user.is_superuser"
                  :color="getQuotaColor(user.apps_count, user.max_apps)"
                  :model-value="getQuotaPercentage(user.apps_count, user.max_apps)"
                  height="8"
                  rounded
                />
              </div>

              <div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">Serviços</span>
                  <v-chip
                    :color="getQuotaColor(user.services_count, user.max_services)"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.is_superuser ? '∞' : `${user.services_count ?? 0}/${user.max_services ?? '?'}` }}
                  </v-chip>
                </div>

                <v-progress-linear
                  v-if="!user.is_superuser"
                  :color="getQuotaColor(user.services_count, user.max_services)"
                  :model-value="getQuotaPercentage(user.services_count, user.max_services)"
                  height="8"
                  rounded
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="h-100">
            <v-card-title>
              <v-icon class="mr-2">mdi-information-outline</v-icon>
              Informações do Sistema
            </v-card-title>

            <v-card-text>
              <p class="mb-2">
                <strong>ID:</strong> {{ user.id }}
              </p>

              <p class="mb-2">
                <strong>Tipo de conta:</strong>
                <span v-if="user.is_superuser">Administrador</span>
                <span v-else-if="user.is_fabric">Usuário Privilegiado</span>
                <span v-else>Usuário Regular</span>
              </p>

              <p v-if="user.custom_max_apps !== null" class="mb-2">
                <strong>Limite customizado de apps:</strong> {{ user.custom_max_apps }}
              </p>

              <p v-if="user.custom_max_services !== null" class="mb-2">
                <strong>Limite customizado de serviços:</strong> {{ user.custom_max_services }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="mt-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5">
            <v-icon class="mr-2">mdi-folder-multiple</v-icon>
            Projetos do Usuário
          </h2>
          <v-chip>
            {{ userProjects.length }} {{ userProjects.length === 1 ? 'projeto' : 'projetos' }}
          </v-chip>
        </div>

        <v-progress-linear v-if="projectsLoading" indeterminate />

        <v-row v-else-if="userProjects.length > 0">
          <v-col v-for="project in userProjects" :key="project.id" cols="12" md="4">
            <v-card class="h-100 d-flex flex-column" hover @click="navigateToProject(project.id!)">
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center text-truncate">
                  <v-icon class="mr-2" color="primary">mdi-folder</v-icon>
                  <span class="text-truncate">{{ project.name }}</span>
                </div>

                <v-chip
                  :color="project.is_owner ? 'success' : 'grey'"
                  size="x-small"
                >
                  {{ project.is_owner ? 'Owner' : 'Membro' }}
                </v-chip>
              </v-card-title>

              <v-card-subtitle>
                Criado em: {{ formatDate(project.created_at) }}
              </v-card-subtitle>

              <v-card-text class="flex-grow-1">
                <div>
                  <span class="text-caption text-medium-emphasis">Membros:</span>
                  <div class="d-flex flex-wrap ga-1 mt-1">
                    <v-chip
                      v-for="u in project.users_detail?.slice(0, 3)"
                      :key="u.id"
                      size="x-small"
                    >
                      {{ u.name || u.email }}
                    </v-chip>
                    <v-chip v-if="(project.users_detail?.length || 0) > 3" size="x-small">
                      +{{ (project.users_detail?.length || 0) - 3 }}
                    </v-chip>
                  </div>
                </div>
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
        </v-row>

        <v-card v-else class="text-center pa-8">
          <v-icon class="mb-4" color="grey" size="64">mdi-folder-outline</v-icon>
          <h3 class="text-h6 mb-2">Nenhum projeto encontrado</h3>
          <p class="text-grey">Este usuário não participa de nenhum projeto</p>
        </v-card>
      </div>

      <div class="mt-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5">
            <v-icon class="mr-2">mdi-application</v-icon>
            Apps do Usuário
          </h2>
          <v-chip>
            {{ userApps.length }} {{ userApps.length === 1 ? 'app' : 'apps' }}
          </v-chip>
        </div>

        <v-progress-linear v-if="appsLoading" indeterminate />

        <v-row v-else-if="userApps.length > 0">
          <v-col v-for="app in userApps" :key="app.id" cols="12" md="4">
            <v-card class="h-100 d-flex flex-column" hover>
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" :color="getStatusColor(app.status)">
                    {{ getStatusIcon(app.status) }}
                  </v-icon>
                  <span class="text-truncate">{{ app.name }}</span>
                </div>
              </v-card-title>

              <v-card-subtitle class="text-truncate">
                {{ app.git }}
              </v-card-subtitle>

              <v-card-text class="flex-grow-1">
                <v-chip :color="getStatusColor(app.status)" size="small">
                  {{ formatStatus(app.status) }}
                </v-chip>

                <p v-if="app.domain" class="text-caption mt-2 text-truncate">
                  {{ app.domain }}
                </p>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  color="primary"
                  :to="`/projects/${app.project}/${app.id}`"
                  variant="text"
                >
                  Abrir App
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-else class="text-center pa-8">
          <v-icon class="mb-4" color="grey" size="64">mdi-application-outline</v-icon>
          <h3 class="text-h6 mb-2">Nenhum app encontrado</h3>
          <p class="text-grey">Este usuário não possui apps</p>
        </v-card>
      </div>
    </template>

    <v-card v-else-if="!loading" class="text-center pa-8">
      <v-icon class="mb-4" color="error" size="64">mdi-account-alert</v-icon>
      <h3 class="text-h6 mb-2">Usuário não encontrado</h3>
      <p class="text-grey">O usuário solicitado não existe ou você não tem permissão para visualizá-lo</p>
      <v-btn class="mt-4" color="primary" @click="$router.push('/admin')">
        Voltar para Administração
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import UserAvatar from '@/components/ui/UserAvatar.vue'
  import type { AdminUser } from '@/modules/administration/domain/models'
  import type { App } from '@/modules/applications/domain/models'
  import type { Project } from '@/modules/projects/domain/models'
  import { adminUserRepository } from '@/modules/administration'
  import { useAdminUsers } from '@/modules/administration/presentation/composables/use-admin-users'
  import { useProjectStore, useAppStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'

  const route = useRoute()
  const router = useRouter()
  const userId = parseInt((route.params as { userId: string }).userId || '0', 10)

  const projectStore = useProjectStore()
  const appStore = useAppStore()
  const { users, loading: usersLoading, fetch: fetchUsers } = useAdminUsers(adminUserRepository)

  const loading = ref(true)
  const projectsLoading = ref(true)
  const appsLoading = ref(true)
  const allProjects = ref<Project[]>([])
  const allApps = ref<App[]>([])

  const user = computed<AdminUser | null>(() =>
    users.value.find(u => u.id === userId) || null
  )

  const userProjects = computed(() =>
    allProjects.value.filter(project =>
      project.users_detail?.some(u => u.id === userId)
    )
  )

  const userApps = computed(() => {
    const projectIds = userProjects.value.map(p => p.id).filter(Boolean)
    return allApps.value.filter(app =>
      projectIds.includes(app.project)
    )
  })

  onMounted(async () => {
    try {
      loading.value = true
      await fetchUsers()
    } finally {
      loading.value = false
    }

    try {
      projectsLoading.value = true
      await projectStore.fetchProjects()
      allProjects.value = projectStore.projects
    } finally {
      projectsLoading.value = false
    }

    try {
      appsLoading.value = true
      await appStore.fetchApps()
      allApps.value = appStore.apps
    } finally {
      appsLoading.value = false
    }
  })

  function getQuotaColor (current?: number, max?: number | null): string {
    if (max == null || current == null) return 'grey'
    const ratio = max === 0 ? 1 : current / max
    if (ratio >= 1) return 'error'
    if (ratio >= 0.8) return 'warning'
    return 'success'
  }

  function getQuotaPercentage (current?: number, max?: number | null): number {
    if (max == null || current == null || max === 0) return 0
    return Math.min((current / max) * 100, 100)
  }

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function navigateToProject (projectId: string) {
    router.push(`/admin/projects/${projectId}`)
  }
</script>

<style scoped>
  .v-card[hover] {
    cursor: pointer;
    transition: transform 0.2s;
  }

  .v-card[hover]:hover {
    transform: translateY(-2px);
  }
</style>
