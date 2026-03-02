<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push('/admin')"
    >
      Voltar para Administração
    </v-btn>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="projectStore.currentProject">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4">{{ projectStore.currentProject.name }}</h1>
          <v-chip
            class="mt-2"
            :color="projectStore.currentProject.is_owner ? 'success' : 'grey'"
            :prepend-icon="
              projectStore.currentProject.is_owner
                ? 'mdi-account-check'
                : 'mdi-account'
            "
            size="small"
          >
            {{
              projectStore.currentProject.is_owner
                ? "Meu Projeto"
                : "Projeto de Outro Usuário"
            }}
          </v-chip>
        </div>
      </div>

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
          <div class="mt-3">
            <strong>Membros:</strong>
            <div class="d-flex flex-wrap ga-2 mt-1">
              <v-chip
                v-for="u in projectStore.currentProject.users_detail || []"
                :key="u.id"
                :prepend-avatar="u.avatar_url || undefined"
                size="small"
              >
                {{ u.name || u.email }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5">Apps deste Projeto</h2>
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
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" :color="getStatusColor(app.status)">
                  {{ getStatusIcon(app.status) }}
                </v-icon>
                {{ app.name }}
              </div>
              <v-chip
                :color="app.is_owner ? 'success' : 'grey'"
                :prepend-icon="
                  app.is_owner ? 'mdi-account-check' : 'mdi-account'
                "
                size="x-small"
              >
                {{ app.is_owner ? "Meu" : "Outro" }}
              </v-chip>
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
            <v-icon class="mb-4" color="grey" size="64"
              >mdi-application-outline</v-icon
            >
            <h3 class="text-h6 mb-2">Nenhum app neste projeto</h3>
            <p class="text-grey">Este projeto ainda não possui apps</p>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useAppStore, useProjectStore } from "@/stores";
import { formatStatus, getStatusColor, getStatusIcon } from "@/utils/status";

const route = useRoute();
const projectId = (route.params as { projectId: string }).projectId || "";

const projectStore = useProjectStore();
const appStore = useAppStore();

const loading = ref(true);

// Apps do projeto atual
const projectApps = computed(() => appStore.apps);

onMounted(async () => {
  try {
    await projectStore.fetchProject(projectId);
    await appStore.fetchAppsByProject(projectId);
  } finally {
    loading.value = false;
  }
});

function formatDate(dateString?: string) {
  if (!dateString) {
    return "-";
  }
  return new Date(dateString).toLocaleDateString("pt-BR");
}

// Helpers importados de @/utils/status
</script>
