<template>
  <v-card class="h-100" variant="outlined">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-database</v-icon>
      {{ service.name }}
    </v-card-title>

    <v-card-subtitle>
      <v-chip color="blue" size="small" variant="tonal">{{ serviceTypeLabel(service.service_type) }}</v-chip>
      <span v-if="service.app" class="ml-2 text-caption">Vinculado ao app</span>
      <span v-else-if="ready" class="ml-2 text-caption text-grey">Disponível para vincular</span>
      <span v-else class="ml-2 text-caption text-primary">Provisionando</span>
    </v-card-subtitle>

    <v-card-text>
      <p v-if="service.container_name" class="text-caption mb-1">Contêiner: <code>{{ service.container_name }}</code></p>
      <p v-if="service.env_key" class="text-caption mb-1">Variável: <code>{{ service.env_key }}</code></p>
      <p v-if="service.image" class="text-caption mb-1">Imagem: <code>{{ service.image }}<template v-if="service.image_version">:{{ service.image_version }}</template></code></p>
      <p v-if="service.task_id" class="text-caption text-primary">Provisionando...</p>
      <p v-else-if="!ready" class="text-caption text-warning">Provisionamento ainda não concluído. Aguarde ou recrie o serviço.</p>
    </v-card-text>

    <v-card-actions>
      <v-btn
        v-if="!service.app && ready"
        color="primary"
        size="small"
        variant="text"
        @click="emit('link')"
      >Vincular a um App</v-btn>

      <v-btn v-else-if="!service.app" disabled size="small" variant="text">Aguardando provisionamento</v-btn>

      <v-btn
        color="error"
        :loading="deleting"
        size="small"
        variant="text"
        @click="emit('delete')"
      >Excluir</v-btn>

      <v-btn
        v-if="service.app"
        color="warning"
        size="small"
        variant="text"
        @click="emit('unlink')"
      >Desvincular do app</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { Service, ServiceType } from '@/modules/services/domain/models'

  defineProps<{ service: Service, ready: boolean, deleting: boolean }>()
  const emit = defineEmits<{ link: [], delete: [], unlink: [] }>()

  function serviceTypeLabel (serviceType: ServiceType) {
    const labels: Record<ServiceType, string> = {
      postgres: 'PostgreSQL',
      postgis: 'PostGIS',
      redis: 'Redis',
      rabbitmq: 'RabbitMQ',
    }
    return labels[serviceType]
  }
</script>
