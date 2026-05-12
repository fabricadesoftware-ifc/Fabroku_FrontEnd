<template>
  <v-card :loading="loading">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Selecionar Repositório</span>

      <v-btn
        icon
        :loading="loading"
        variant="text"
        @click="loadRepos"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-text-field
        v-model="search"
        class="mb-4"
        clearable
        density="compact"
        hide-details
        label="Buscar repositório"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
      />

      <div
        v-if="filteredRepos.length === 0 && !loading"
        class="text-center py-4 text-grey"
      >
        <v-icon class="mb-2" size="48">mdi-source-repository</v-icon>

        <p>
          {{
            search
              ? "Nenhum repositório encontrado"
              : "Nenhum repositório disponível"
          }}
        </p>
      </div>

      <v-list class="repos-list" lines="two">
        <v-list-item
          v-for="repo in filteredRepos"
          :key="repo.id"
          :class="{ 'v-list-item--active': selectedRepo?.id === repo.id }"
          @click="selectRepo(repo)"
        >
          <template #prepend>
            <v-icon :color="repo.private ? 'warning' : 'success'">
              {{ repo.private ? "mdi-lock" : "mdi-source-repository" }}
            </v-icon>
          </template>

          <v-list-item-title>{{ repo.name }}</v-list-item-title>

          <v-list-item-subtitle>
            {{ repo.description || "Sem descrição" }}
          </v-list-item-subtitle>

          <template #append>
            <v-chip
              v-if="repo.default_branch"
              size="x-small"
              variant="outlined"
            >
              {{ repo.default_branch }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-divider />

    <v-card-text v-if="selectedRepo" class="bg-surface-variant">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-check-circle</v-icon>

        <div>
          <div class="font-weight-medium">{{ selectedRepo.full_name }}</div>
          <div class="text-caption text-grey">{{ selectedRepo.clone_url }}</div>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="$emit('cancel')">Cancelar</v-btn>

      <v-btn
        color="primary"
        :disabled="!selectedRepo"
        @click="confirmSelection"
      >
        Selecionar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { GitRepo } from '@/interfaces'
  import { computed, onMounted, ref } from 'vue'
  import { useGitStore } from '@/stores'

  const emit = defineEmits<{
    cancel: []
    select: [repo: GitRepo]
  }>()

  const gitStore = useGitStore()
  const search = ref('')
  const selectedRepo = ref<GitRepo | null>(null)

  const loading = computed(() => gitStore.loading)

  const filteredRepos = computed(() => {
    if (!search.value) {
      return gitStore.repos
    }
    const query = search.value.toLowerCase()
    return gitStore.repos.filter(
      repo =>
        repo.name.toLowerCase().includes(query)
        || repo.full_name.toLowerCase().includes(query)
        || repo.description?.toLowerCase().includes(query),
    )
  })

  onMounted(() => {
    if (gitStore.repos.length === 0) {
      loadRepos()
    }
  })

  async function loadRepos () {
    await gitStore.fetchRepos()
  }

  function selectRepo (repo: GitRepo) {
    selectedRepo.value = repo
  }

  function confirmSelection () {
    if (selectedRepo.value) {
      emit('select', selectedRepo.value)
    }
  }
</script>

<style scoped>
.repos-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
