<template>
  <v-card class="mb-4 app-card" variant="flat">
    <v-card-title class="pa-5 pb-3 text-subtitle-1 font-weight-bold">Resumo</v-card-title>
    <v-divider />

    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between mb-3"><span class="text-body-2 text-medium-emphasis">Repositório</span><span class="text-body-2 font-weight-medium text-truncate ml-3">{{ repo }}</span></div>
      <div class="d-flex justify-space-between mb-3"><span class="text-body-2 text-medium-emphasis">Branch</span><span class="text-body-2 font-weight-medium"><v-icon size="x-small">mdi-source-branch</v-icon> {{ branch }}</span></div>
      <div class="d-flex justify-space-between mb-3"><span class="text-body-2 text-medium-emphasis">Visibilidade</span><span class="text-body-2 font-weight-medium"><v-icon size="x-small">{{ visibilityIcon }}</v-icon> {{ visibility }}</span></div>
      <div v-if="variablesCount > 0" class="d-flex justify-space-between mb-3"><span class="text-body-2 text-medium-emphasis">Variáveis</span><span class="text-body-2 font-weight-medium">{{ variablesCount }} configurada(s)</span></div>
      <div v-if="customName" class="d-flex justify-space-between mb-3"><span class="text-body-2 text-medium-emphasis">Nome Dokku</span><span class="text-body-2 font-weight-medium"><v-icon color="amber" size="x-small">mdi-star</v-icon> {{ customName }}</span></div>
      <div class="d-flex justify-space-between"><span class="text-body-2 text-medium-emphasis">Projeto</span><span class="text-body-2 font-weight-medium text-truncate ml-3">{{ project }}</span></div>
    </v-card-text>

    <v-divider />

    <v-card-text class="pa-5">
      <v-alert
        v-if="quotaError"
        class="mb-3"
        closable
        density="compact"
        type="error"
        variant="tonal"
        @click:close="emit('clear-error')"
      >{{ quotaError }}</v-alert>

      <v-btn
        block
        color="primary"
        :disabled="!canDeploy"
        :loading="loading"
        prepend-icon="mdi-rocket-launch"
        size="large"
        @click="emit('deploy')"
      >Deploy App</v-btn>

      <p class="text-caption text-medium-emphasis text-center mt-3">Ao clicar em Deploy, você concorda com as <a class="text-primary" href="#">regras de uso</a> da plataforma.</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  defineProps<{
    repo: string
    branch: string
    visibility: string
    visibilityIcon: string
    variablesCount: number
    customName: string
    project: string
    quotaError: string
    canDeploy: boolean
    loading: boolean
  }>()

  const emit = defineEmits<{ 'clear-error': [], 'deploy': [] }>()
</script>

<style scoped>
.app-card { background-color: #1a1a2e !important; border: none !important; }
</style>
