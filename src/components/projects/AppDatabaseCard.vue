<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center flex-wrap ga-2">
      <span>
        <v-icon class="mr-2">mdi-database</v-icon>
        Serviços Vinculados
      </span>

      <div class="d-flex ga-2">
        <v-btn
          v-if="!hasPostgres"
          color="primary"
          :disabled="!appName"
          :loading="creating"
          prepend-icon="mdi-database-plus"
          size="small"
          variant="flat"
          @click="emit('create')"
        >
          Criar PostgreSQL
        </v-btn>

        <v-btn
          color="primary"
          :disabled="!appName"
          :loading="linking"
          prepend-icon="mdi-link"
          size="small"
          variant="flat"
          @click="emit('link')"
        >
          Vincular existente
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <!-- Sem servicos vinculados -->
      <div v-if="!hasLinkedServices && !creating" class="text-center py-4 text-grey">
        <v-icon class="mb-2" color="grey" size="48">mdi-database-off</v-icon>
        <p class="mb-2">Nenhum serviço vinculado</p>

        <p class="text-caption">
          Crie ou vincule PostgreSQL/Redis e a variável
          <code>DATABASE_URL</code> ou <code>REDIS_URL</code> será sincronizada no app.
        </p>
      </div>

      <!-- Criando servico -->
      <div v-else-if="creating" class="text-center py-4">
        <v-progress-circular
          class="mb-3"
          color="primary"
          indeterminate
          size="48"
        />

        <p class="text-primary">Criando serviço...</p>

        <p class="text-caption text-grey">
          O serviço será provisionado e a variável de conexão será
          automaticamente configurada.
        </p>
      </div>

      <!-- Servicos vinculados -->
      <div v-else>
        <v-list density="compact">
          <v-list-item v-for="service in services" :key="service.id">
            <template #prepend>
              <v-icon color="success">mdi-database-check</v-icon>
            </template>

            <v-list-item-title class="d-flex align-center">
              <span class="font-weight-medium">{{ service.name }}</span>

              <v-chip class="ml-2" color="blue" size="x-small" variant="tonal">
                {{ service.service_type }}
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle>
              Contêiner: <code>{{ service.container_name || "-" }}</code>
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                v-if="showUnlink !== false"
                color="warning"
                icon
                :loading="unlinkingId === service.id"
                size="small"
                variant="text"
                @click="emit('unlink', service.id!)"
              >
                <v-icon>mdi-link-off</v-icon>

                <v-tooltip
                  activator="parent"
                  location="top"
                >Desvincular (mantém o serviço)</v-tooltip>
              </v-btn>

              <v-btn
                color="error"
                icon
                :loading="deletingId === service.id"
                size="small"
                variant="text"
                @click="emit('delete', service.id!)"
              >
                <v-icon>mdi-delete</v-icon>

                <v-tooltip
                  activator="parent"
                  location="top"
                >Excluir serviço</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { Service } from '@/interfaces'

  import { computed } from 'vue'

  const props = defineProps<{
    services: Service[]
    appName?: string
    creating?: boolean
    linking?: boolean
    unlinkingId?: number | null
    deletingId?: number | null
    showUnlink?: boolean
  }>()

  const emit = defineEmits<{
    create: []
    link: []
    unlink: [serviceId: number]
    delete: [serviceId: number]
  }>()

  const hasLinkedServices = computed(() => props.services.length > 0)
  const hasPostgres = computed(() =>
    props.services.some(service => service.service_type === 'postgres'),
  )
</script>
