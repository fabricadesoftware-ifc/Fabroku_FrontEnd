<template>
  <v-dialog v-model="open" max-width="500" persistent>
    <v-card>
      <v-card-title>Vincular serviço existente</v-card-title>

      <v-card-text>
        <v-alert
          v-if="error"
          class="mb-4"
          closable
          density="compact"
          type="error"
          variant="tonal"
          @click:close="emit('clear-error')"
        >
          {{ error }}
        </v-alert>

        <v-select
          :item-title="formatOption"
          item-value="id"
          :items="services"
          label="Selecione o serviço"
          :model-value="selectedService"
          variant="outlined"
          @update:model-value="emit('update:selected-service', $event)"
        />

        <v-alert
          v-if="services.length === 0"
          class="mt-3"
          color="info"
          density="compact"
          variant="tonal"
        >
          Nenhum serviço disponível. Crie um em
          <router-link :to="servicesRoute">Serviços do projeto</router-link>.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:model-value', false)">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!selectedService" :loading="loading" @click="emit('confirm')">Vincular</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Service } from '@/modules/services/domain/models'

  defineProps<{
    services: Service[]
    selectedService: number | null
    error: string
    loading: boolean
    servicesRoute: string
    formatOption: (service: Service) => string
  }>()

  const open = defineModel<boolean>()
  const emit = defineEmits<{
    'clear-error': []
    'confirm': []
    'update:selected-service': [value: number | null]
    'update:model-value': [value: boolean]
  }>()
</script>
