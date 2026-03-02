<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push('/projects')"
    >
      Voltar para Projetos
    </v-btn>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="projectStore.currentProject">
      <h1 class="text-h4 mb-4">{{ projectStore.currentProject.name }}</h1>

      <v-card class="mb-6">
        <v-card-title>Detalhes do Projeto</v-card-title>
        <v-card-text>
          <p><strong>ID:</strong> {{ projectStore.currentProject.id }}</p>
          <p>
            <strong>Criado em:</strong>
            {{ formatDate(projectStore.currentProject.created_at) }}
          </p>
          <p>
            <strong>Atualizado em:</strong>
            {{ formatDate(projectStore.currentProject.updated_at) }}
          </p>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <h2 class="text-h5">Apps deste Projeto</h2>
        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-database"
            :to="`/projects/${projectId}/services`"
            variant="tonal"
          >
            Serviços
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            :to="`/projects/${projectId}/new`"
          >
            Novo App
          </v-btn>
        </div>
      </div>

      <!-- Loading Apps -->
      <v-progress-linear v-if="appStore.loading" indeterminate />

      <v-row v-if="!appStore.loading">
        <!-- Lista de apps do projeto -->
        <v-col v-for="app in projectApps" :key="app.id" cols="12" md="4">
          <v-card
            class="h-100"
            hover
            @click="$router.push(`/projects/${projectId}/${app.id}`)"
          >
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" :color="getStatusColor(app.status)">
                {{ getStatusIcon(app.status) }}
              </v-icon>
              {{ app.name }}
            </v-card-title>
            <v-card-subtitle>{{ app.git }}</v-card-subtitle>
            <v-card-text>
              <v-chip :color="getStatusColor(app.status)" size="small">
                {{ formatStatus(app.status) }}
              </v-chip>
              <span v-if="app.domain" class="ml-2 text-caption">
                {{ app.domain }}
              </span>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :to="`/projects/${projectId}/${app.id}`"
                variant="text"
              >
                Abrir App
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Empty State -->
        <v-col v-if="projectApps.length === 0" cols="12">
          <v-card class="text-center pa-8">
            <v-icon
              class="mb-4"
              color="grey"
              size="64"
            >mdi-application-outline</v-icon>
            <h3 class="text-h6 mb-2">Nenhum app neste projeto</h3>
            <p class="text-grey mb-4">Crie seu primeiro app para começar</p>
            <v-btn color="primary" :to="`/projects/${projectId}/new`">
              Criar App
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'

  import { useAppStore, useProjectStore } from '@/stores'
  import { formatStatus, getStatusColor, getStatusIcon } from '@/utils/status'

  const route = useRoute()
  const projectId = (route.params as { projectId: string }).projectId || ''

  const projectStore = useProjectStore()
  const appStore = useAppStore()

  const loading = ref(true)

  const projectApps = computed(() => {
    return appStore.apps.filter(app => app.is_owner !== false)
  })

  onMounted(async () => {
    try {
      await projectStore.fetchProject(projectId)
      await appStore.fetchAppsByProject(projectId)
    } finally {
      loading.value = false
    }
  })

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

// Helpers importados de @/utils/status
</script>
