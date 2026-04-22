<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push('/projects')"
    >
      Voltar para Projetos
    </v-btn>

    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="currentProject">
      <h1 class="text-h4 mb-4">{{ currentProject.name }}</h1>

      <v-card class="mb-6">
        <v-card-title>Detalhes do Projeto</v-card-title>
        <v-card-text>
          <p><strong>ID:</strong> {{ currentProject.id }}</p>
          <p>
            <strong>Criado em:</strong>
            {{ formatDate(currentProject.created_at) }}
          </p>
          <p>
            <strong>Atualizado em:</strong>
            {{ formatDate(currentProject.updated_at) }}
          </p>
        </v-card-text>
      </v-card>

      <v-card class="mb-6">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
          <span>Equipe do Projeto</span>
          <v-chip color="primary" size="small" variant="tonal">
            {{ currentTeamIds.length }} membro(s)
          </v-chip>
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Membros atuais</div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="user in currentProject.users_detail || []"
                :key="user.id"
                :prepend-avatar="user.avatar_url || undefined"
                size="small"
              >
                {{ formatUserName(user) }}
              </v-chip>
            </div>
          </div>

          <template v-if="canManageTeam">
            <v-divider class="mb-4" />

            <p class="text-body-2 mb-3">
              {{ teamManagerHint }}
            </p>

            <v-chip
              v-if="fixedMember"
              class="mb-3"
              color="primary"
              prepend-icon="mdi-account-check"
              variant="tonal"
            >
              <v-avatar v-if="fixedMember.avatar_url" size="24" start>
                <v-img :src="fixedMember.avatar_url" />
              </v-avatar>
              <v-avatar v-else color="grey" size="24" start>
                <v-icon size="small">mdi-account</v-icon>
              </v-avatar>
              {{ formatUserName(fixedMember) }} (voce)
            </v-chip>

            <v-autocomplete
              v-model="editableTeamMembers"
              v-model:search="teamSearchQuery"
              chips
              clearable
              closable-chips
              hide-no-data
              hide-selected
              item-title="name"
              item-value="id"
              :items="teamSearchResults"
              :label="teamSearchLabel"
              :loading="teamSearching"
              multiple
              placeholder="Digite nome ou email..."
              return-object
              variant="outlined"
              @update:search="handleTeamSearch"
            >
              <template #chip="{ item, props: chipProps }">
                <v-chip v-bind="chipProps">
                  <v-avatar v-if="item.raw.avatar_url" size="24" start>
                    <v-img :src="item.raw.avatar_url" />
                  </v-avatar>
                  {{ formatUserName(item.raw) }}
                </v-chip>
              </template>
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-avatar v-if="item.raw.avatar_url" size="32">
                      <v-img :src="item.raw.avatar_url" />
                    </v-avatar>
                    <v-avatar v-else color="grey" size="32">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ formatUserName(item.raw) }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.raw.email">
                    {{ item.raw.email }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
              <template #no-data>
                <v-list-item v-if="teamSearchQuery && teamSearchQuery.length >= 2">
                  <v-list-item-title>
                    Nenhum usuario encontrado para "{{ teamSearchQuery }}"
                  </v-list-item-title>
                </v-list-item>
                <v-list-item v-else>
                  <v-list-item-title>
                    Digite pelo menos 2 caracteres para buscar
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>

            <v-alert
              v-if="teamFeedback"
              class="mt-4"
              :type="teamFeedback.type"
              variant="tonal"
            >
              {{ teamFeedback.message }}
            </v-alert>
          </template>

          <v-alert v-else type="info" variant="tonal">
            Voce precisa fazer parte do projeto para editar a equipe.
          </v-alert>
        </v-card-text>

        <v-card-actions v-if="canManageTeam" class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn
            :disabled="!hasTeamChanges || teamSaving"
            variant="text"
            @click="resetTeamSelection"
          >
            Descartar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!hasTeamChanges || !selectedTeamIds.length"
            :loading="teamSaving"
            @click="saveTeamChanges"
          >
            Salvar equipe
          </v-btn>
        </v-card-actions>
      </v-card>

      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <h2 class="text-h5">Apps deste Projeto</h2>
        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-database"
            :to="`/projects/${projectId}/services`"
          >
            Servicos
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            :to="`/projects/${projectId}/new`"
          >
            Novo App
          </v-btn>
        </div>
      </div>

      <v-progress-linear v-if="appStore.loading" indeterminate />

      <v-row v-if="!appStore.loading">
        <v-col v-for="app in projectApps" :key="app.id" cols="12" md="4">
          <v-card
            class="h-100"
            hover
            @click="$router.push(`/projects/${projectId}/${app.id}`)"
          >
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" :color="getStatusColor(app.status)">
                {{ getStatusIcon(app.status) }}
              </v-icon>
              {{ app.name }}
            </v-card-title>
            <v-card-subtitle>{{ app.git }}</v-card-subtitle>
            <v-card-text>
              <v-chip :color="getStatusColor(app.status)" size="small">
                {{ formatStatus(app.status) }}
              </v-chip>
              <span v-if="app.domain" class="ml-2 text-caption">
                {{ app.domain }}
              </span>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :to="`/projects/${projectId}/${app.id}`"
                variant="text"
              >
                Abrir App
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="projectApps.length === 0" cols="12">
          <v-card class="text-center pa-8">
            <v-icon
              class="mb-4"
              color="grey"
              size="64"
            >mdi-application-outline</v-icon>
            <h3 class="text-h6 mb-2">Nenhum app neste projeto</h3>
            <p class="text-grey mb-4">Crie seu primeiro app para comecar</p>
            <v-btn color="primary" :to="`/projects/${projectId}/new`">
              Criar App
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import type { Project, ProjectUser, User } from '@/interfaces'

  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'

  import { UsersService } from '@/services'
  import { useAppStore, useAuthStore, useProjectStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'

  const route = useRoute()
  const projectId = (route.params as { projectId: string }).projectId || ''

  const projectStore = useProjectStore()
  const appStore = useAppStore()
  const authStore = useAuthStore()

  const loading = ref(true)
  const teamSaving = ref(false)
  const teamSearching = ref(false)
  const teamSearchQuery = ref('')
  const teamSearchResults = ref<User[]>([])
  const editableTeamMembers = ref<User[]>([])
  const teamFeedback = ref<{ type: 'success' | 'error', message: string } | null>(null)
  const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  const currentProject = computed(() => projectStore.currentProject)

  const currentTeamIds = computed(() => {
    const users = currentProject.value?.users || []
    return users
      .filter((id): id is number => typeof id === 'number')
      .slice()
      .sort((left, right) => left - right)
  })

  const projectApps = computed(() => {
    return appStore.apps.filter(app => app.is_owner !== false)
  })

  const fixedMember = computed<User | null>(() => {
    const authUser = authStore.user
    const authUserId = authUser?.id

    if (!authUserId || authUser?.is_superuser || !currentTeamIds.value.includes(authUserId)) {
      return null
    }

    const currentMember = currentProject.value?.users_detail?.find(user => user.id === authUserId)

    if (currentMember) {
      return mapProjectUserToUser(currentMember)
    }

    return {
      id: authUserId,
      email: authUser.email,
      name: authUser.name,
      avatar_url: authUser.avatar_url,
    }
  })

  const canManageTeam = computed(() => {
    const authUserId = authStore.user?.id

    if (!authUserId) {
      return false
    }

    return Boolean(authStore.user?.is_superuser || currentTeamIds.value.includes(authUserId))
  })

  const selectedTeamIds = computed(() => {
    const ids = new Set<number>()

    if (fixedMember.value?.id) {
      ids.add(fixedMember.value.id)
    }

    for (const user of editableTeamMembers.value) {
      if (typeof user.id === 'number') {
        ids.add(user.id)
      }
    }

    return Array.from(ids).sort((left, right) => left - right)
  })

  const hasTeamChanges = computed(() => {
    if (selectedTeamIds.value.length !== currentTeamIds.value.length) {
      return true
    }

    return selectedTeamIds.value.some((id, index) => id !== currentTeamIds.value[index])
  })

  const teamManagerHint = computed(() => {
    if (fixedMember.value) {
      return 'Adicione ou remova outras pessoas do time. O seu usuario fica fixo para evitar perda de acesso ao projeto.'
    }

    return 'Como administrador, voce pode ajustar livremente os membros deste projeto.'
  })

  const teamSearchLabel = computed(() => {
    if (fixedMember.value) {
      return 'Adicionar ou remover outros membros'
    }

    return 'Adicionar ou remover membros'
  })

  onMounted(async () => {
    try {
      await projectStore.fetchProject(projectId)
      initializeTeamSelection(projectStore.currentProject)
      await appStore.fetchAppsByProject(projectId)
    } finally {
      loading.value = false
    }
  })

  function mapProjectUserToUser (user: ProjectUser): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    }
  }

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function formatUserName (user: Pick<User, 'email' | 'name' | 'id'>) {
    return user.name || user.email || `Usuario #${user.id}`
  }

  function initializeTeamSelection (project: Project | null) {
    const lockedMemberId = fixedMember.value?.id
    const members = (project?.users_detail || []).map(mapProjectUserToUser)

    editableTeamMembers.value = members.filter(user => user.id !== lockedMemberId)
    teamSearchQuery.value = ''
    teamSearchResults.value = []
    teamFeedback.value = null
  }

  function isUserAlreadySelected (userId?: number) {
    if (typeof userId !== 'number') {
      return false
    }

    if (fixedMember.value?.id === userId) {
      return true
    }

    return editableTeamMembers.value.some(user => user.id === userId)
  }

  async function handleTeamSearch (query: string) {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }

    if (!query || query.length < 2) {
      teamSearchResults.value = []
      return
    }

    searchTimeout.value = setTimeout(async () => {
      teamSearching.value = true

      try {
        const results = await UsersService.searchByUsername(query)
        teamSearchResults.value = results.filter(user => !isUserAlreadySelected(user.id))
      } catch (error_) {
        console.error('Erro ao buscar usuarios para o projeto:', error_)
        teamSearchResults.value = []
      } finally {
        teamSearching.value = false
      }
    }, 300)
  }

  function resetTeamSelection () {
    initializeTeamSelection(currentProject.value)
  }

  async function saveTeamChanges () {
    if (!currentProject.value?.id || !selectedTeamIds.value.length) {
      return
    }

    teamSaving.value = true
    teamFeedback.value = null

    try {
      const updatedProject = await projectStore.updateProject(currentProject.value.id, {
        users: selectedTeamIds.value,
      })

      initializeTeamSelection(updatedProject)
      teamFeedback.value = {
        type: 'success',
        message: 'Equipe atualizada com sucesso.',
      }
    } catch (error) {
      console.error('Erro ao atualizar equipe do projeto:', error)
      teamFeedback.value = {
        type: 'error',
        message: getProjectTeamErrorMessage(error),
      }
    } finally {
      teamSaving.value = false
    }
  }

  function getProjectTeamErrorMessage (error: unknown): string {
    const responseData = (error as {
      response?: {
        data?: {
          detail?: string
          error?: string
          users?: string[] | string
        }
      }
    })?.response?.data

    if (Array.isArray(responseData?.users) && responseData.users.length > 0) {
      return responseData.users[0] ?? 'Nao foi possivel atualizar a equipe do projeto.'
    }

    if (typeof responseData?.users === 'string') {
      return responseData.users
    }

    if (typeof responseData?.detail === 'string') {
      return responseData.detail
    }

    if (typeof responseData?.error === 'string') {
      return responseData.error
    }

    return 'Nao foi possivel atualizar a equipe do projeto.'
  }
</script>
