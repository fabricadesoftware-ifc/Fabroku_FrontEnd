<template>
  <v-card max-width="600" variant="outlined">
    <v-card-title>Serviço do Projeto</v-card-title>

    <v-card-text>
      <v-alert
        v-if="error"
        class="mb-4"
        closable
        density="compact"
        type="error"
        variant="tonal"
        @click:close="emit('clear-error')"
      >{{ error }}</v-alert>

      <v-select
        v-model="serviceType"
        item-disabled="disabled"
        item-title="label"
        item-value="value"
        :items="options"
        label="Tipo de serviço"
        variant="outlined"
      />

      <v-text-field
        v-model="name"
        class="mt-4"
        hint="Deixe vazio para gerar automaticamente"
        label="Nome do serviço (opcional)"
        persistent-hint
        placeholder="meu-servico"
        variant="outlined"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn variant="text" @click="emit('cancel')">Cancelar</v-btn>
      <v-spacer />
      <v-btn color="primary" :loading="loading" @click="emit('submit')">Criar Serviço</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { ServiceType } from '@/modules/services/domain/models'

  defineProps<{
    options: Array<{ value: ServiceType, label: string, disabled?: boolean }>
    error: string
    loading: boolean
  }>()
  const serviceType = defineModel<ServiceType>('serviceType', { required: true })
  const name = defineModel<string>('name', { required: true })
  const emit = defineEmits<{ 'clear-error': [], 'cancel': [], 'submit': [] }>()
</script>
