<template>
  <v-container class="px-10 py-2" fluid>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Administração</h1>
        <p class="text-grey">Gerenciar projetos e usuários do sistema</p>
      </div>
    </div>

    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="projects"><v-icon start>mdi-folder-multiple</v-icon>Projetos</v-tab>
      <v-tab value="users"><v-icon start>mdi-account-group</v-icon>Usuários</v-tab>
      <v-tab value="storage"><v-icon start>mdi-database</v-icon>Armazenamento</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="projects">
        <AdminProjectsPanel
          :filter="projectFilter"
          :loading="projectStore.loading"
          :projects="projectStore.projects"
          @delete-project="confirmDeleteProject"
          @update:filter="projectFilter = $event"
        />
      </v-tabs-window-item>

      <v-tabs-window-item value="users">
        <AdminUsersPanel
          :current-user-id="authStore.user?.id"
          :loading="adminUsersLoading"
          :privileged-role-label="platformStore.privilegedRoleLabel"
          :regular-role-label="platformStore.regularRoleLabel"
          :search="userSearch"
          :toggling-admin-user-id="togglingAdminUserId"
          :toggling-user-id="togglingUserId"
          :users="adminUsersList"
          @edit-quota="openQuotaDialog"
          @toggle-active="handleToggleActive"
          @toggle-admin="handleToggleAdmin"
          @update:search="userSearch = $event"
        />
      </v-tabs-window-item>

      <v-tabs-window-item value="storage">
        <AdminStoragePanel
          :error="adminStorageError"
          :loading="adminStorageLoading"
          :usage="adminStorageUsage"
          @refresh="fetchStorageUsage(true)"
        />
      </v-tabs-window-item>
    </v-tabs-window>

    <AdminProjectDeleteDialog
      v-model="deleteDialog"
      :loading="deleting"
      :project="projectToDelete"
      @confirm="handleDeleteProject"
    />

    <AdminQuotaDialog
      v-model="quotaDialog"
      :loading="quotaSaving"
      :privileged-role-label="platformStore.privilegedRoleLabel"
      :regular-role-label="platformStore.regularRoleLabel"
      :user="quotaUser"
      @save="handleSaveQuota"
    />
  </v-container>
</template>

<script setup lang="ts">
  import type { AdminUser } from '@/modules/administration/domain/models'
  import type { Project } from '@/modules/projects/domain/models'

  import { onMounted, ref, watch } from 'vue'

  import AdminProjectDeleteDialog from '@/components/admin/AdminProjectDeleteDialog.vue'
  import AdminProjectsPanel from '@/components/admin/AdminProjectsPanel.vue'
  import AdminQuotaDialog from '@/components/admin/AdminQuotaDialog.vue'
  import AdminStoragePanel from '@/components/admin/AdminStoragePanel.vue'
  import AdminUsersPanel from '@/components/admin/AdminUsersPanel.vue'
  import { adminUserRepository, storageRepository } from '@/modules/administration'
  import { useAdminStorage } from '@/modules/administration/presentation/composables/use-admin-storage'
  import { useAdminUsers } from '@/modules/administration/presentation/composables/use-admin-users'
  import { useAuthStore, usePlatformStore, useProjectStore } from '@/stores'

  type AdminTab = 'projects' | 'users' | 'storage'
  type ProjectFilter = 'all' | 'mine' | 'others'

  const authStore = useAuthStore()
  const platformStore = usePlatformStore()
  const projectStore = useProjectStore()
  const adminUsers = useAdminUsers(adminUserRepository)
  const adminStorage = useAdminStorage(storageRepository)
  const adminUsersLoading = adminUsers.loading
  const adminUsersList = adminUsers.users
  const togglingAdminUserId = adminUsers.togglingAdminUserId
  const togglingUserId = adminUsers.togglingUserId
  const quotaSaving = adminUsers.quotaSaving
  const adminStorageError = adminStorage.error
  const adminStorageLoading = adminStorage.loading
  const adminStorageUsage = adminStorage.usage

  const activeTab = ref<AdminTab>('projects')
  const projectFilter = ref<ProjectFilter>('all')
  const userSearch = ref('')
  const deleteDialog = ref(false)
  const projectToDelete = ref<Project | null>(null)
  const deleting = ref(false)
  const quotaDialog = ref(false)
  const quotaUser = ref<AdminUser | null>(null)

  onMounted(() => {
    void platformStore.fetchConfig()
    void projectStore.fetchProjects()
    void adminUsers.fetch().catch(() => {})
  })

  watch(activeTab, tab => {
    if (tab === 'storage' && !adminStorage.loading.value && (!adminStorage.usage.value || adminStorage.error.value)) {
      void fetchStorageUsage()
    }
  })

  async function fetchStorageUsage (forceRefresh = false) {
    await adminStorage.fetch(forceRefresh)
  }

  function confirmDeleteProject (project: Project) {
    projectToDelete.value = project
    deleteDialog.value = true
  }

  async function handleDeleteProject () {
    const projectId = projectToDelete.value?.id
    if (!projectId) return
    deleting.value = true
    try {
      await projectStore.deleteProject(projectId)
      deleteDialog.value = false
      projectToDelete.value = null
    } finally {
      deleting.value = false
    }
  }

  async function handleToggleActive (user: AdminUser) {
    await adminUsers.toggleActiveFor(user.id)
  }

  async function handleToggleAdmin (user: AdminUser) {
    if (user.id === authStore.user?.id) return
    await adminUsers.toggleAdminFor(user.id)
  }

  function openQuotaDialog (user: AdminUser) {
    quotaUser.value = user
    quotaDialog.value = true
  }

  async function handleSaveQuota (quota: { max_apps: number | null, max_services: number | null }) {
    if (!quotaUser.value) return
    await adminUsers.saveQuota(quotaUser.value.id, quota)
    quotaDialog.value = false
  }
</script>
