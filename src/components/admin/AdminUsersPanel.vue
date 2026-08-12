<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />

    <v-text-field
      class="mb-4"
      clearable
      density="compact"
      hide-details
      :model-value="search"
      placeholder="Buscar por nome ou email..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      @update:model-value="emit('update:search', $event)"
    />

    <v-table v-if="!loading" density="comfortable" hover>
      <thead>
        <tr>
          <th>Usuário</th><th>Email</th><th class="text-center">Tipo</th>
          <th class="text-center">Apps</th><th class="text-center">Serviços</th>
          <th class="text-center">Status</th><th class="text-center">Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>
            <div class="d-flex align-center ga-2 py-2">
              <UserAvatar :alt="user.name || user.email" size="32" :src="user.avatar_url" />
              <span>{{ user.name || '-' }}</span>
            </div>
          </td>

          <td><span class="text-caption">{{ user.email }}</span></td>

          <td class="text-center">
            <v-chip v-if="user.is_superuser" color="warning" size="small" variant="tonal">
              <v-icon size="14" start>mdi-shield-crown</v-icon>Admin
            </v-chip>

            <v-chip v-else-if="user.is_fabric" color="info" size="small" variant="tonal">
              <v-icon size="14" start>mdi-account-hard-hat</v-icon>{{ privilegedRoleLabel }}
            </v-chip>

            <span v-else class="text-grey text-caption">{{ regularRoleLabel }}</span>
          </td>

          <td class="text-center">
            <v-chip :color="user.is_superuser ? 'grey' : getQuotaColor(user.apps_count, user.max_apps)" size="small" variant="tonal">
              {{ user.is_superuser ? '∞' : `${user.apps_count ?? 0}/${user.max_apps ?? '?'}` }}
            </v-chip>
          </td>

          <td class="text-center">
            <v-chip :color="user.is_superuser ? 'grey' : getQuotaColor(user.services_count, user.max_services)" size="small" variant="tonal">
              {{ user.is_superuser ? '∞' : `${user.services_count ?? 0}/${user.max_services ?? '?'}` }}
            </v-chip>
          </td>

          <td class="text-center">
            <v-chip :color="user.is_active ? 'success' : 'error'" size="small">
              {{ user.is_active ? 'Ativo' : 'Desabilitado' }}
            </v-chip>
          </td>

          <td class="text-center">
            <div class="d-flex justify-center align-center flex-wrap ga-2">
              <v-btn
                :color="user.is_superuser ? 'warning' : 'grey'"
                :disabled="isCurrentUser(user)"
                :loading="togglingAdminUserId === user.id"
                size="small"
                variant="tonal"
                @click="emit('toggle-admin', user)"
              >
                <v-icon start>{{ user.is_superuser ? 'mdi-shield-off-outline' : 'mdi-shield-crown-outline' }}</v-icon>
                {{ user.is_superuser ? 'Remover admin' : 'Tornar admin' }}
              </v-btn>

              <v-btn
                :disabled="user.is_superuser"
                icon
                size="small"
                variant="text"
                @click="emit('edit-quota', user)"
              >
                <v-icon size="18">mdi-tune</v-icon>
                <v-tooltip activator="parent" location="top">Ajustar limites</v-tooltip>
              </v-btn>

              <v-btn
                :color="user.is_active ? 'error' : 'success'"
                :disabled="user.is_superuser"
                :loading="togglingUserId === user.id"
                size="small"
                variant="tonal"
                @click="emit('toggle-active', user)"
              >
                <v-icon start>{{ user.is_active ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                {{ user.is_active ? 'Desabilitar' : 'Habilitar' }}
              </v-btn>
            </div>
          </td>
        </tr>

        <tr v-if="filteredUsers.length === 0">
          <td class="text-center text-grey pa-6" colspan="7">Nenhum usuário encontrado.</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
  import type { AdminUser } from '@/modules/administration/domain/models'
  import { computed } from 'vue'

  import UserAvatar from '@/components/ui/UserAvatar.vue'

  const props = defineProps<{
    currentUserId?: number
    loading: boolean
    privilegedRoleLabel: string
    regularRoleLabel: string
    search: string
    togglingAdminUserId: number | null
    togglingUserId: number | null
    users: AdminUser[]
  }>()

  const emit = defineEmits<{
    'edit-quota': [user: AdminUser]
    'toggle-active': [user: AdminUser]
    'toggle-admin': [user: AdminUser]
    'update:search': [search: string]
  }>()

  const filteredUsers = computed(() => {
    const query = props.search.trim().toLowerCase()
    if (!query) return props.users
    return props.users.filter(user =>
      (user.name || '').toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  })

  function isCurrentUser (user: AdminUser) {
    return user.id === props.currentUserId
  }

  function getQuotaColor (current?: number, max?: number | null): string {
    if (max == null || current == null) return 'grey'
    const ratio = max === 0 ? 1 : current / max
    if (ratio >= 1) return 'error'
    if (ratio >= 0.8) return 'warning'
    return 'success'
  }
</script>
