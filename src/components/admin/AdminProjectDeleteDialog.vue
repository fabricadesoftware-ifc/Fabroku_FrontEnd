<template>
  <v-dialog max-width="450" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center"><v-icon class="mr-2" color="error">mdi-alert</v-icon>Apagar Projeto</v-card-title>

      <v-card-text>
        <p>Tem certeza que deseja apagar o projeto <strong>{{ project?.name }}</strong>?</p>
        <p class="text-error text-caption mt-2">Esta ação não pode ser desfeita. Todos os apps e serviços associados serão removidos.</p>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="error" :loading="loading" variant="elevated" @click="emit('confirm')">Apagar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Project } from '@/modules/projects/domain/models'

  defineProps<{
    loading: boolean
    modelValue: boolean
    project: Project | null
  }>()

  const emit = defineEmits<{
    'confirm': []
    'update:modelValue': [value: boolean]
  }>()
</script>
