<template>
  <div>
    <v-chip-group
      class="mb-4"
      mandatory
      :model-value="filter"
      @update:model-value="emit('update:filter', $event)"
    >
      <v-chip value="all">Todos</v-chip>
      <v-chip value="mine">Meus Projetos</v-chip>
      <v-chip value="others">Outros Usuários</v-chip>
    </v-chip-group>

    <v-autocomplete
      v-model="selectedUserId"
      class="mb-4"
      clearable
      :items="allUsers"
      item-title="label"
      item-value="id"
      label="Filtrar por usuário específico"
      prepend-inner-icon="mdi-account-filter"
      variant="outlined"
      density="compact"
      hide-details
    >
      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <template #prepend>
            <UserAvatar
              :alt="item.raw.name || item.raw.email"
              :src="item.raw.avatar_url"
              size="32"
              class="mr-2"
            />
          </template>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <div class="d-flex align-center">
          <UserAvatar
            :alt="item.raw.name || item.raw.email"
            :src="item.raw.avatar_url"
            size="24"
            class="mr-2"
          />
          {{ item.raw.label }}
        </div>
      </template>
    </v-autocomplete>

    <v-progress-linear v-if="loading" indeterminate />

    <v-row v-if="!loading">
      <v-col v-for="project in filteredProjects" :key="project.id" cols="12" md="4">
        <v-card class="h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center text-truncate">
              <v-icon class="mr-2" color="primary">mdi-folder</v-icon>
              <span class="text-truncate">{{ project.name }}</span>
            </div>

            <v-chip
              :color="project.is_owner ? 'success' : 'grey'"
              :prepend-icon="project.is_owner ? 'mdi-account-check' : 'mdi-account'"
              size="small"
            >
              {{ project.is_owner ? 'Meu' : 'Outro' }}
            </v-chip>
          </v-card-title>

          <v-card-subtitle>Criado em: {{ formatDate(project.created_at) }}</v-card-subtitle>

          <v-card-text class="flex-grow-1">
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">Membros:</span>

              <div class="d-flex flex-wrap ga-1 mt-1">
                <v-chip v-for="user in project.users_detail || []" :key="user.id" size="small">
                  <UserAvatar
                    :alt="user.name || user.email"
                    size="24"
                    :src="user.avatar_url"
                    start
                  />
                  {{ user.name || user.email }}
                </v-chip>

                <v-chip v-if="!project.users_detail?.length" color="grey" size="small">
                  {{ project.users?.length || 0 }} usuário(s)
                </v-chip>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" :to="`/admin/projects/${project.id}`" variant="text">
              Ver Apps
            </v-btn>

            <v-spacer />

            <v-btn
              color="error"
              icon
              size="small"
              variant="text"
              @click.stop="emit('delete-project', project)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">Apagar projeto</v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="filteredProjects.length === 0" cols="12">
        <v-card class="text-center pa-8">
          <v-icon class="mb-4" color="grey" size="64">mdi-folder-outline</v-icon>
          <h3 class="text-h6 mb-2">Nenhum projeto encontrado</h3>
          <p class="text-grey">{{ emptyMessage }}</p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import type { Project } from '@/modules/projects/domain/models'
  import { computed, ref } from 'vue'

  import UserAvatar from '@/components/ui/UserAvatar.vue'

  type ProjectFilter = 'all' | 'mine' | 'others'

  const props = defineProps<{
    filter: ProjectFilter
    loading: boolean
    projects: Project[]
  }>()

  const emit = defineEmits<{
    'delete-project': [project: Project]
    'update:filter': [filter: ProjectFilter]
  }>()

  const selectedUserId = ref<number | null>(null)

  // Extrai todos os usuários únicos de todos os projetos
  const allUsers = computed(() => {
    const usersMap = new Map()

    props.projects.forEach(project => {
      project.users_detail?.forEach(user => {
        if (!usersMap.has(user.id)) {
          usersMap.set(user.id, {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            label: user.name || user.email
          })
        }
      })
    })

    return Array.from(usersMap.values()).sort((a, b) =>
      (a.label || '').localeCompare(b.label || '')
    )
  })

  const filteredProjects = computed(() => {
    let filtered = props.projects

    // Filtra por tipo (mine/others/all)
    if (props.filter === 'mine') {
      filtered = filtered.filter(project => project.is_owner)
    } else if (props.filter === 'others') {
      filtered = filtered.filter(project => !project.is_owner)
    }

    // Filtra por usuário específico se selecionado
    if (selectedUserId.value !== null) {
      filtered = filtered.filter(project =>
        project.users_detail?.some(user => user.id === selectedUserId.value)
      )
    }

    return filtered
  })

  const emptyMessage = computed(() => {
    if (selectedUserId.value !== null) {
      const user = allUsers.value.find(u => u.id === selectedUserId.value)
      return `Nenhum projeto encontrado para ${user?.label || 'este usuário'}`
    }
    if (props.filter === 'mine') return 'Você não possui projetos'
    if (props.filter === 'others') return 'Não há projetos de outros usuários'
    return 'Nenhum projeto no sistema'
  })

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }
</script>
