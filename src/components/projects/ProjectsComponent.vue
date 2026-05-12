<template>
  <v-container class="px-10 py-2" fluid>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Meus Projetos</h1>

      <v-btn color="primary" prepend-icon="mdi-plus" to="/projects/new">
        Novo Projeto
      </v-btn>
    </div>

    <!-- Loading -->
    <v-progress-linear v-if="projectStore.loading" indeterminate />

    <!-- Error -->
    <v-alert v-if="projectStore.error" class="mb-4" type="error">
      {{ projectStore.error }}
    </v-alert>

    <!-- Lista de Projetos -->
    <v-row v-if="!projectStore.loading">
      <v-col v-for="project in myProjects" :key="project.id" cols="12" md="4">
        <v-card
          class="h-100"
          hover
          @click="$router.push(`/projects/${project.id}`)"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-folder</v-icon>
              {{ project.name }}
            </div>

            <v-btn
              color="error"
              icon
              size="small"
              variant="text"
              @click.stop="openDeleteDialog(project)"
            >
              <v-icon>mdi-delete</v-icon>

              <v-tooltip activator="parent" location="top">
                Deletar projeto
              </v-tooltip>
            </v-btn>
          </v-card-title>

          <v-card-subtitle>
            Criado em: {{ formatDate(project.created_at) }}
          </v-card-subtitle>

          <v-card-text>
            <v-chip class="mr-1" size="small">
              <v-icon size="small" start>mdi-account-multiple</v-icon>
              {{ project.users?.length || 0 }} usuários
            </v-chip>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              :to="`/projects/${project.id}`"
              variant="text"
            >
              Abrir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="myProjects.length === 0" cols="12">
        <v-card class="text-center pa-8">
          <v-icon
            class="mb-4"
            color="grey"
            size="64"
          >mdi-folder-outline</v-icon>

          <h3 class="text-h6 mb-2">Nenhum projeto ainda</h3>
          <p class="text-grey mb-4">Crie seu primeiro projeto para começar</p>
          <v-btn color="primary" to="/projects/new"> Criar Projeto </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Confirmar Exclusão de Projeto -->
    <v-dialog v-model="dialogDelete" max-width="450">
      <v-card>
        <v-card-title class="text-error">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Confirmar Exclusão
        </v-card-title>

        <v-card-text>
          <p class="mb-2">
            Tem certeza que deseja deletar o projeto
            <strong>{{ projectToDelete?.name }}</strong>?
          </p>

          <v-alert
            class="mt-3"
            color="error"
            density="compact"
            icon="mdi-alert-circle"
            variant="tonal"
          >
            <strong>Atenção:</strong> Todos os apps deste projeto também serão
            deletados. Esta ação não pode ser desfeita.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancelar</v-btn>

          <v-btn color="error" :loading="deleting" @click="handleDeleteProject">
            Deletar Projeto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { Project } from '@/interfaces'

  import { computed, onMounted, ref } from 'vue'

  import { useProjectStore } from '@/stores'

  const projectStore = useProjectStore()

  const dialogDelete = ref(false)
  const deleting = ref(false)
  const projectToDelete = ref<Project | null>(null)

  // Filtrar apenas projetos do usuário
  const myProjects = computed(() => {
    return projectStore.projects.filter(project => project.is_owner !== false)
  })

  onMounted(() => {
    projectStore.fetchProjects()
  })

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function openDeleteDialog (project: Project) {
    projectToDelete.value = project
    dialogDelete.value = true
  }

  function closeDeleteDialog () {
    dialogDelete.value = false
    projectToDelete.value = null
  }

  async function handleDeleteProject () {
    if (!projectToDelete.value?.id) return

    deleting.value = true
    try {
      await projectStore.deleteProject(projectToDelete.value.id)
      closeDeleteDialog()
    } catch (error_) {
      console.error('Erro ao deletar projeto:', error_)
    } finally {
      deleting.value = false
    }
  }
</script>
