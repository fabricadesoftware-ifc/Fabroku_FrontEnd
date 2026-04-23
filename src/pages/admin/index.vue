<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Administração</h1>
        <p class="text-grey">Gerenciar projetos e usuários do sistema</p>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="projects">
        <v-icon start>mdi-folder-multiple</v-icon>
        Projetos
      </v-tab>
      <v-tab value="users">
        <v-icon start>mdi-account-group</v-icon>
        Usuários
      </v-tab>
      <v-tab value="storage">
        <v-icon start>mdi-database</v-icon>
        Armazenamento
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="projects">
        <v-chip-group v-model="filterSelection" class="mb-4" mandatory>
          <v-chip value="all">Todos</v-chip>
          <v-chip value="mine">Meus Projetos</v-chip>
          <v-chip value="others">Outros Usuários</v-chip>
        </v-chip-group>

        <v-progress-linear v-if="projectStore.loading" indeterminate />

        <v-row v-if="!projectStore.loading">
          <v-col
            v-for="project in filteredProjects"
            :key="project.id"
            cols="12"
            md="4"
          >
            <v-card class="h-100 d-flex flex-column">
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center text-truncate">
                  <v-icon class="mr-2" color="primary">mdi-folder</v-icon>
                  <span class="text-truncate">{{ project.name }}</span>
                </div>
                <v-chip
                  :color="project.is_owner ? 'success' : 'grey'"
                  :prepend-icon="
                    project.is_owner ? 'mdi-account-check' : 'mdi-account'
                  "
                  size="small"
                >
                  {{ project.is_owner ? "Meu" : "Outro" }}
                </v-chip>
              </v-card-title>

              <v-card-subtitle>
                Criado em: {{ formatDate(project.created_at) }}
              </v-card-subtitle>

              <v-card-text class="flex-grow-1">
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">Membros:</span>
                  <div class="d-flex flex-wrap ga-1 mt-1">
                    <v-chip
                      v-for="u in project.users_detail || []"
                      :key="u.id"
                      :prepend-avatar="u.avatar_url || undefined"
                      size="small"
                    >
                      {{ u.name || u.email }}
                    </v-chip>
                    <v-chip
                      v-if="!project.users_detail?.length"
                      color="grey"
                      size="small"
                    >
                      {{ project.users?.length || 0 }} usuário(s)
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
                <v-spacer />
                <v-btn
                  color="error"
                  icon
                  size="small"
                  variant="text"
                  @click.stop="confirmDeleteProject(project)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                  >Apagar projeto</v-tooltip>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col v-if="filteredProjects.length === 0" cols="12">
            <v-card class="text-center pa-8">
              <v-icon
                class="mb-4"
                color="grey"
                size="64"
              >mdi-folder-outline</v-icon>
              <h3 class="text-h6 mb-2">Nenhum projeto encontrado</h3>
              <p class="text-grey">{{ getEmptyMessage() }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item value="users">
        <v-progress-linear v-if="usersLoading" indeterminate />

        <v-text-field
          v-model="userSearch"
          class="mb-4"
          clearable
          density="compact"
          hide-details
          placeholder="Buscar por nome ou email..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />

        <v-table v-if="!usersLoading" density="comfortable" hover>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Email</th>
              <th class="text-center">Tipo</th>
              <th class="text-center">Apps</th>
              <th class="text-center">Serviços</th>
              <th class="text-center">Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id">
              <td>
                <div class="d-flex align-center ga-2 py-2">
                  <v-avatar :image="u.avatar_url || undefined" size="32">
                    <v-icon v-if="!u.avatar_url">mdi-account</v-icon>
                  </v-avatar>
                  <span>{{ u.name || "-" }}</span>
                </div>
              </td>
              <td>
                <span class="text-caption">{{ u.email }}</span>
              </td>
              <td class="text-center">
                <v-chip
                  v-if="u.is_superuser"
                  color="warning"
                  size="small"
                  variant="tonal"
                >
                  <v-icon size="14" start>mdi-shield-crown</v-icon>
                  Admin
                </v-chip>
                <v-chip
                  v-else-if="u.is_fabric"
                  color="info"
                  size="small"
                  variant="tonal"
                >
                  <v-icon size="14" start>mdi-account-hard-hat</v-icon>
                  Fábrica
                </v-chip>
                <span v-else class="text-grey text-caption">Aluno</span>
              </td>
              <td class="text-center">
                <v-chip
                  :color="
                    u.is_superuser
                      ? 'grey'
                      : getQuotaColor(u.apps_count, u.max_apps)
                  "
                  size="small"
                  variant="tonal"
                >
                  {{
                    u.is_superuser
                      ? "∞"
                      : `${u.apps_count ?? 0}/${u.max_apps ?? "?"}`
                  }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip
                  :color="
                    u.is_superuser
                      ? 'grey'
                      : getQuotaColor(u.services_count, u.max_services)
                  "
                  size="small"
                  variant="tonal"
                >
                  {{
                    u.is_superuser
                      ? "∞"
                      : `${u.services_count ?? 0}/${u.max_services ?? "?"}`
                  }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip :color="u.is_active ? 'success' : 'error'" size="small">
                  {{ u.is_active ? "Ativo" : "Desabilitado" }}
                </v-chip>
              </td>
              <td class="text-center">
                <div class="d-flex justify-center align-center flex-wrap ga-2">
                  <v-btn
                    :color="u.is_superuser ? 'warning' : 'grey'"
                    :disabled="isCurrentUser(u)"
                    :loading="togglingAdminUserId === u.id"
                    size="small"
                    variant="tonal"
                    @click="handleToggleAdmin(u)"
                  >
                    <v-icon start>{{
                      u.is_superuser
                        ? "mdi-shield-off-outline"
                        : "mdi-shield-crown-outline"
                    }}</v-icon>
                    {{ u.is_superuser ? "Remover admin" : "Tornar admin" }}
                  </v-btn>
                  <v-btn
                    :disabled="u.is_superuser"
                    icon
                    size="small"
                    variant="text"
                    @click="openQuotaDialog(u)"
                  >
                    <v-icon size="18">mdi-tune</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >Ajustar limites</v-tooltip>
                  </v-btn>
                  <v-btn
                    :color="u.is_active ? 'error' : 'success'"
                    :disabled="u.is_superuser"
                    :loading="togglingUserId === u.id"
                    size="small"
                    variant="tonal"
                    @click="handleToggleActive(u)"
                  >
                    <v-icon start>{{
                      u.is_active ? "mdi-account-off" : "mdi-account-check"
                    }}</v-icon>
                    {{ u.is_active ? "Desabilitar" : "Habilitar" }}
                  </v-btn>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td class="text-center text-grey pa-6" colspan="7">
                Nenhum usuário encontrado.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-tabs-window-item>

      <v-tabs-window-item value="storage">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-database</v-icon>
            Uso de espaço dos bancos Postgres
            <v-btn v-if="storageLoading" class="ml-2" icon size="small">
              <v-progress-circular indeterminate size="20" width="2" />
            </v-btn>
            <v-btn
              v-else
              class="ml-2"
              icon
              size="small"
              variant="text"
              @click="fetchStorageUsage(true)"
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
                Total:
                <strong>{{ storageUsage?.total_formatted ?? "-" }}</strong>
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
                  <tr v-for="s in storageUsage.services" :key="s.service_id">
                    <td>{{ s.project_name }}</td>
                    <td>{{ s.app_name ?? "-" }}</td>
                    <td>
                      <code class="text-caption">{{
                        s.container_name ?? s.service_name
                      }}</code>
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
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Dialog de confirmação para deletar projeto -->
    <v-dialog v-model="deleteDialog" max-width="450">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Apagar Projeto
        </v-card-title>
        <v-card-text>
          <p>
            Tem certeza que deseja apagar o projeto
            <strong>{{ projectToDelete?.name }}</strong>?
          </p>
          <p class="text-error text-caption mt-2">
            Esta ação não pode ser desfeita. Todos os apps e serviços associados
            serão removidos.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            variant="elevated"
            @click="handleDeleteProject"
          >
            Apagar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de edição de quota -->
    <v-dialog v-model="quotaDialog" max-width="450">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-tune</v-icon>
          Limites de {{ quotaUser?.name || quotaUser?.email }}
        </v-card-title>
        <v-card-text>
          <p class="text-caption text-medium-emphasis mb-4">
            Defina limites personalizados. Deixe vazio para usar o padrão ({{
              quotaUser?.is_fabric
                ? "5 apps / 3 serviços - Fábrica"
                : "3 apps / 2 serviços - Aluno"
            }}).
          </p>

          <v-text-field
            v-model.number="quotaForm.max_apps"
            clearable
            density="compact"
            hint="Padrão depende do tipo de usuário"
            label="Limite de Apps"
            min="0"
            persistent-hint
            type="number"
            variant="outlined"
          />

          <v-text-field
            v-model.number="quotaForm.max_services"
            class="mt-3"
            clearable
            density="compact"
            hint="Padrão depende do tipo de usuário"
            label="Limite de Serviços"
            min="0"
            persistent-hint
            type="number"
            variant="outlined"
          />

          <v-alert
            v-if="quotaUser"
            class="mt-3"
            density="compact"
            type="info"
            variant="tonal"
          >
            Uso atual: {{ quotaUser.apps_count ?? 0 }} apps,
            {{ quotaUser.services_count ?? 0 }} serviços
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="quotaDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="quotaSaving"
            variant="elevated"
            @click="handleSaveQuota"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { Project, User } from '@/interfaces'
  import type { StorageUsageResponse } from '@/services/admin'

  import { computed, onMounted, ref, watch } from 'vue'

  import AdminService from '@/services/admin'
  import UsersService from '@/services/users'
  import { useAuthStore, useProjectStore } from '@/stores'

  const authStore = useAuthStore()
  const projectStore = useProjectStore()
  const activeTab = ref('projects')
  const filterSelection = ref('all')

  const storageUsage = ref<StorageUsageResponse | null>(null)
  const storageLoading = ref(false)
  const storageError = ref<string | null>(null)

  const users = ref<User[]>([])
  const usersLoading = ref(false)
  const userSearch = ref('')
  const togglingUserId = ref<number | null>(null)
  const togglingAdminUserId = ref<number | null>(null)

  const deleteDialog = ref(false)
  const projectToDelete = ref<Project | null>(null)
  const deleting = ref(false)

  // Quota dialog
  const quotaDialog = ref(false)
  const quotaUser = ref<User | null>(null)
  const quotaForm = ref<{ max_apps: number | null, max_services: number | null }>(
    {
      max_apps: null,
      max_services: null,
    },
  )
  const quotaSaving = ref(false)

  async function fetchStorageUsage (forceRefresh = false) {
    storageLoading.value = true
    storageError.value = null
    try {
      storageUsage.value = await AdminService.getStorageUsage(forceRefresh)
    } catch (error) {
      storageError.value
        = error instanceof Error ? error.message : 'Erro ao carregar uso de espaço'
    } finally {
      storageLoading.value = false
    }
  }

  async function fetchUsers () {
    usersLoading.value = true
    try {
      users.value = await UsersService.getAdminList()
    } catch {
      users.value = []
    } finally {
      usersLoading.value = false
    }
  }

  onMounted(() => {
    projectStore.fetchProjects()
    fetchUsers()
  })

  watch(activeTab, tab => {
    if (
      tab === 'storage'
      && !storageLoading.value
      && (!storageUsage.value || storageError.value)
    ) {
      fetchStorageUsage()
    }
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

  const filteredUsers = computed(() => {
    if (!userSearch.value) return users.value
    const q = userSearch.value.toLowerCase()
    return users.value.filter(
      u =>
        (u.name || '').toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q),
    )
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

  function confirmDeleteProject (project: Project) {
    projectToDelete.value = project
    deleteDialog.value = true
  }

  async function handleDeleteProject () {
    if (!projectToDelete.value?.id) return
    deleting.value = true
    try {
      await projectStore.deleteProject(projectToDelete.value.id)
      deleteDialog.value = false
      projectToDelete.value = null
    } finally {
      deleting.value = false
    }
  }

  async function handleToggleActive (user: User) {
    if (!user.id) return
    togglingUserId.value = user.id
    try {
      const updated = await UsersService.toggleActive(user.id)
      const idx = users.value.findIndex(u => u.id === user.id)
      if (idx !== -1) users.value[idx] = updated
    } finally {
      togglingUserId.value = null
    }
  }

  async function handleToggleAdmin (user: User) {
    if (!user.id || isCurrentUser(user)) return
    togglingAdminUserId.value = user.id
    try {
      const updated = await UsersService.toggleAdmin(user.id)
      const idx = users.value.findIndex(u => u.id === user.id)
      if (idx !== -1) users.value[idx] = updated
    } finally {
      togglingAdminUserId.value = null
    }
  }

  function isCurrentUser (user: User) {
    return Boolean(user.id && authStore.user?.id === user.id)
  }

  function getQuotaColor (current?: number, max?: number | null): string {
    if (max == null || current == null) return 'grey'
    const ratio = current / max
    if (ratio >= 1) return 'error'
    if (ratio >= 0.8) return 'warning'
    return 'success'
  }

  function openQuotaDialog (user: User) {
    quotaUser.value = user
    quotaForm.value = {
      max_apps: user.custom_max_apps ?? null,
      max_services: user.custom_max_services ?? null,
    }
    quotaDialog.value = true
  }

  async function handleSaveQuota () {
    if (!quotaUser.value?.id) return
    quotaSaving.value = true
    try {
      const updated = await UsersService.setQuota(quotaUser.value.id, {
        max_apps: quotaForm.value.max_apps,
        max_services: quotaForm.value.max_services,
      })
      const idx = users.value.findIndex(u => u.id === quotaUser.value?.id)
      if (idx !== -1) users.value[idx] = updated
      quotaDialog.value = false
    } finally {
      quotaSaving.value = false
    }
  }
</script>
