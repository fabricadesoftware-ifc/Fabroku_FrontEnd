<template>
  <v-container max-width="700">
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push('/projects')"
    >
      Voltar para Projetos
    </v-btn>

    <h1 class="text-h4 mb-6">Novo Projeto</h1>

    <v-card>
      <v-card-text class="pa-6">
        <v-text-field
          v-model="projectName"
          autofocus
          class="mb-6"
          label="Nome do Projeto"
          placeholder="Meu projeto incrível"
          required
          variant="outlined"
        />

        <!-- Seleção de Equipe -->
        <div class="mb-2 text-subtitle-2">Equipe do Projeto</div>

        <!-- Usuário atual (sempre incluído) -->
        <v-chip
          v-if="authStore.user"
          class="mb-3"
          color="primary"
          prepend-icon="mdi-account-check"
        >
          <UserAvatar
            :alt="authStore.user.name || authStore.user.email"
            icon-size="small"
            size="24"
            :src="authStore.user.avatar_url"
            start
          />
          {{
            authStore.user.name ||
              authStore.user.username ||
              authStore.user.email
          }}
          (você)
        </v-chip>

        <!-- Busca de usuários -->
        <v-autocomplete
          v-model="selectedUsers"
          v-model:search="searchQuery"
          chips
          clearable
          closable-chips
          hide-no-data
          hide-selected
          item-title="name"
          item-value="id"
          :items="searchResults"
          label="Adicionar membros (buscar por nome do GitHub)"
          :loading="searching"
          multiple
          placeholder="Digite o nome do usuário..."
          return-object
          variant="outlined"
          @update:search="handleSearch"
        >
          <template #chip="{ item, props: chipProps }">
            <v-chip v-bind="chipProps">
              <UserAvatar
                :alt="formatUserName(getUserSlotItem(item))"
                icon-size="small"
                size="24"
                :src="getUserSlotItem(item).avatar_url"
                start
              />
              {{ formatUserName(getUserSlotItem(item)) }}
            </v-chip>
          </template>

          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <UserAvatar
                  :alt="formatUserName(getUserSlotItem(item))"
                  size="32"
                  :src="getUserSlotItem(item).avatar_url"
                />
              </template>

              <v-list-item-title>{{ formatUserName(getUserSlotItem(item)) }}</v-list-item-title>

              <v-list-item-subtitle v-if="getUserSlotItem(item).email">
                {{ getUserSlotItem(item).email }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>

          <template #no-data>
            <v-list-item v-if="searchQuery && searchQuery.length >= 2">
              <v-list-item-title>
                Nenhum usuário encontrado para "{{ searchQuery }}"
              </v-list-item-title>
            </v-list-item>

            <v-list-item v-else>
              <v-list-item-title>
                Digite pelo menos 2 caracteres para buscar
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />

        <v-btn
          variant="text"
          @click="$router.push('/projects')"
        >Cancelar</v-btn>

        <v-btn
          color="primary"
          :disabled="!projectName?.trim()"
          :loading="creating"
          size="large"
          @click="handleCreate"
        >
          Criar Projeto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import type { User } from '@/interfaces'

  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import UserAvatar from '@/components/ui/UserAvatar.vue'
  import { UsersService } from '@/services'
  import { useAuthStore, useProjectStore } from '@/stores'

  const router = useRouter()
  const projectStore = useProjectStore()
  const authStore = useAuthStore()

  const projectName = ref('')
  const creating = ref(false)
  const searching = ref(false)
  const searchQuery = ref('')
  const searchResults = ref<User[]>([])
  const selectedUsers = ref<User[]>([])
  const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  function getUserSlotItem (item: User | { raw: User }): User {
    return 'raw' in item ? item.raw : item
  }

  function formatUserName (user: Pick<User, 'email' | 'name' | 'username' | 'id'>) {
    return user.name || user.username || user.email || `Usuario #${user.id}`
  }

  async function handleSearch (query: string) {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }

    if (!query || query.length < 2) {
      searchResults.value = []
      return
    }

    searchTimeout.value = setTimeout(async () => {
      searching.value = true
      try {
        const results = await UsersService.searchByUsername(query)
        searchResults.value = results.filter(u => u.id !== authStore.user?.id)
      } catch (error_) {
        console.error('Erro ao buscar usuários:', error_)
        searchResults.value = []
      } finally {
        searching.value = false
      }
    }, 300)
  }

  async function handleCreate () {
    if (!projectName.value.trim()) return

    creating.value = true
    try {
      const userIds: number[] = []

      if (authStore.user?.id) {
        userIds.push(authStore.user.id)
      }

      for (const user of selectedUsers.value) {
        if (user.id && !userIds.includes(user.id)) {
          userIds.push(user.id)
        }
      }

      const project = await projectStore.createProject({
        name: projectName.value,
        users: userIds,
      })

      // Navega para o projeto criado
      if (project?.id) {
        router.push(`/projects/${project.id}`)
      } else {
        router.push('/projects')
      }
    } catch (error_) {
      console.error('Erro ao criar projeto:', error_)
    } finally {
      creating.value = false
    }
  }
</script>
