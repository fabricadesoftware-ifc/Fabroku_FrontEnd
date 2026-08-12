<template>
  <v-dialog v-model="open" max-width="500" persistent>
    <v-card>
      <v-card-title>Vincular serviço ao app</v-card-title>

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
          v-model="selectedApp"
          item-title="name"
          item-value="id"
          :items="apps"
          label="Selecione o app"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:model-value', false)">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="emit('confirm')">Vincular</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { App } from '@/modules/applications/domain/models'

  defineProps<{ apps: App[], error: string, loading: boolean }>()
  const selectedApp = defineModel<number | null>('selectedApp', { required: true })
  const open = defineModel<boolean>()
  const emit = defineEmits<{ 'clear-error': [], 'confirm': [], 'update:model-value': [value: boolean] }>()
</script>
