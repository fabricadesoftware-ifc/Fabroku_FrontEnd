<template>
  <v-card class="mb-6 app-card" variant="flat">
    <v-card-title class="d-flex align-center justify-space-between pa-5 pb-1">
      <div class="d-flex align-center ga-2"><v-icon color="primary" size="small">mdi-github</v-icon>Integração GitHub</div>

      <v-chip
        v-if="repos.length > 0 || selectedRepo"
        color="success"
        prepend-icon="mdi-check-circle"
        size="small"
        variant="flat"
      >Conectado</v-chip>
    </v-card-title>

    <v-card-text class="pa-5 pt-4">
      <v-btn-toggle
        v-model="sourceMode"
        class="mb-5"
        color="primary"
        density="comfortable"
        mandatory
        rounded="lg"
        variant="outlined"
      >
        <v-btn value="github"><v-icon class="mr-1" size="small">mdi-github</v-icon>Repositório GitHub</v-btn>
        <v-btn value="manual"><v-icon class="mr-1" size="small">mdi-link-variant</v-icon>URL Manual</v-btn>
      </v-btn-toggle>

      <template v-if="sourceMode === 'github'">
        <div class="text-body-2 text-medium-emphasis mb-1">Repositório</div>

        <v-autocomplete
          v-model="selectedRepo"
          chips
          clearable
          density="comfortable"
          hide-details
          item-title="full_name"
          :items="repos"
          :loading="loading"
          no-data-text="Nenhum repositório encontrado"
          placeholder="Buscar repositório..."
          prepend-inner-icon="mdi-source-repository"
          return-object
          variant="outlined"
          @update:search="emit('search')"
        >
          <template #chip="{ item }"><v-icon class="mr-1" size="small">mdi-source-repository</v-icon>{{ item.full_name }}</template>

          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps">
              <template #prepend><v-icon :color="item.private ? 'warning' : 'success'" size="small">{{ item.private ? 'mdi-lock' : 'mdi-source-repository' }}</v-icon></template>
              <template #append><v-chip size="x-small" variant="outlined">{{ item.default_branch }}</v-chip></template>
            </v-list-item>
          </template>
        </v-autocomplete>

        <div class="text-body-2 text-medium-emphasis mt-5 mb-1">Branch de Produção</div>

        <v-select
          v-model="selectedBranch"
          density="comfortable"
          hide-details
          :items="branchOptions"
          prepend-inner-icon="mdi-source-branch"
          variant="outlined"
        />

        <div class="text-caption text-medium-emphasis mt-1">Esta branch será usada para builds automáticos em cada push.</div>
      </template>

      <template v-else>
        <div class="text-body-2 text-medium-emphasis mb-1">URL do Repositório Git</div>

        <v-text-field
          v-model="manualGit"
          density="comfortable"
          hide-details
          placeholder="https://github.com/user/repo.git"
          prepend-inner-icon="mdi-link-variant"
          variant="outlined"
        />

        <div class="text-body-2 text-medium-emphasis mt-5 mb-1">Branch</div>

        <v-text-field
          v-model="manualBranch"
          density="comfortable"
          hide-details
          placeholder="main"
          prepend-inner-icon="mdi-source-branch"
          variant="outlined"
        />

        <div class="text-caption text-medium-emphasis mt-1">Deixe vazio para usar a branch padrão.</div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { GitRepo } from '@/modules/git/domain/models'

  defineProps<{
    repos: GitRepo[]
    loading: boolean
    branchOptions: string[]
  }>()
  const sourceMode = defineModel<'github' | 'manual'>('sourceMode', { required: true })
  const selectedRepo = defineModel<GitRepo | null>('selectedRepo', { required: true })
  const selectedBranch = defineModel<string>('selectedBranch', { required: true })
  const manualGit = defineModel<string>('manualGit', { required: true })
  const manualBranch = defineModel<string>('manualBranch', { required: true })
  const emit = defineEmits<{ search: [] }>()
</script>
