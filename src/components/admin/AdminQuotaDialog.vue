<template>
  <v-dialog max-width="450" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center"><v-icon class="mr-2" color="primary">mdi-tune</v-icon>Limites de {{ user?.name || user?.email }}</v-card-title>

      <v-card-text>
        <p class="text-caption text-medium-emphasis mb-4">
          Defina limites personalizados. Deixe vazio para usar o padrão ({{ user?.is_fabric ? `5 apps / 3 serviços - ${privilegedRoleLabel}` : `3 apps / 2 serviços - ${regularRoleLabel}` }}).
        </p>

        <v-text-field
          v-model.number="form.max_apps"
          clearable
          density="compact"
          hint="Padrão depende do tipo de usuário"
          label="Limite de Apps"
          min="0"
          persistent-hint
          type="number"
          variant="outlined"
        />

        <v-text-field
          v-model.number="form.max_services"
          class="mt-3"
          clearable
          density="compact"
          hint="Padrão depende do tipo de usuário"
          label="Limite de Serviços"
          min="0"
          persistent-hint
          type="number"
          variant="outlined"
        />

        <v-alert
          v-if="user"
          class="mt-3"
          density="compact"
          type="info"
          variant="tonal"
        >Uso atual: {{ user.apps_count ?? 0 }} apps, {{ user.services_count ?? 0 }} serviços</v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" variant="elevated" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { AdminUser } from '@/modules/administration/domain/models'
  import { ref, watch } from 'vue'

  const props = defineProps<{
    loading: boolean
    modelValue: boolean
    privilegedRoleLabel: string
    regularRoleLabel: string
    user: AdminUser | null
  }>()

  const emit = defineEmits<{
    'save': [quota: { max_apps: number | null, max_services: number | null }]
    'update:modelValue': [value: boolean]
  }>()

  const form = ref({ max_apps: null as number | null, max_services: null as number | null })

  watch(() => props.user, user => {
    form.value = {
      max_apps: user?.custom_max_apps ?? null,
      max_services: user?.custom_max_services ?? null,
    }
  }, { immediate: true })

  function save () {
    emit('save', { ...form.value })
  }
</script>
