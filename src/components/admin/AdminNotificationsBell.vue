<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    location="end"
    max-width="420"
    min-width="360"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        aria-label="Notificações de administração"
        icon
        size="small"
        variant="text"
      >
        <v-badge
          color="error"
          :content="unreadCount > 99 ? '99+' : unreadCount"
          :model-value="unreadCount > 0"
        >
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
      </v-btn>
    </template>

    <v-card rounded="lg">
      <v-card-title class="d-flex align-center">
        <span class="text-subtitle-1 font-weight-medium">Notificações</span>
        <v-spacer />

        <v-btn
          :disabled="unreadCount === 0"
          size="small"
          variant="text"
          @click="readAll"
        >
          Marcar todas como lidas
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-progress-linear v-if="loading" indeterminate />

      <v-alert
        v-if="error"
        class="ma-3"
        density="compact"
        type="error"
        variant="tonal"
      >
        {{ error }}
      </v-alert>

      <div
        v-else-if="!loading && notifications.length === 0"
        class="pa-6 text-center text-medium-emphasis"
      >
        Nenhuma notificação.
      </div>

      <v-list v-else class="notifications-list" lines="three">
        <v-list-item
          v-for="item in notifications"
          :key="item.id"
          :class="{ 'notification-unread': !item.read_at }"
        >
          <template #prepend>
            <v-icon
              :color="item.read_at ? 'grey' : 'error'"
              icon="mdi-alert-circle-outline"
            />
          </template>

          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ item.title }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ item.event_display }} · {{ formatDate(item.created_at) }}
          </v-list-item-subtitle>

          <div class="text-caption text-medium-emphasis notification-message">
            {{ item.message }}
          </div>

          <div class="d-flex ga-2 mt-1">
            <v-btn
              v-if="item.project_id && item.app"
              density="compact"
              size="small"
              :to="`/projects/${item.project_id}/${item.app}`"
              variant="tonal"
              @click="open = false"
            >
              Abrir app
            </v-btn>

            <v-btn
              v-if="!item.read_at"
              density="compact"
              size="small"
              variant="text"
              @click="read(item.id)"
            >
              Marcar como lida
            </v-btn>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { adminNotificationRepository } from '@/modules/administration/infrastructure/http/administration-repositories'
  import { useAdminNotifications } from '@/modules/administration/presentation/composables/use-admin-notifications'

  const open = ref(false)
  const {
    error,
    fetch,
    loading,
    notifications,
    read,
    readAll,
    startPolling,
    unreadCount,
  } = useAdminNotifications(adminNotificationRepository)

  onMounted(startPolling)

  watch(open, isOpen => {
    if (isOpen) {
      void fetch()
    }
  })

  function formatDate (dateString: string) {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>

<style scoped>
.notifications-list {
  max-height: 420px;
  overflow-y: auto;
}

.notification-unread {
  background-color: rgba(244, 67, 54, 0.06);
}

.notification-message {
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
