<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push(`/projects/${projectId}/services`)"
    >
      Voltar para Serviços
    </v-btn>

    <h1 class="text-h4 mb-2">Criar Novo Serviço</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Crie um banco de dados PostgreSQL standalone. Depois você pode vincular o
      serviço a qualquer app do projeto.
    </p>

    <v-card max-width="600" variant="outlined">
      <v-card-title>Banco PostgreSQL</v-card-title>
      <v-card-text>
        <v-alert
          v-if="quotaError"
          class="mb-4"
          closable
          density="compact"
          type="error"
          variant="tonal"
          @click:close="quotaError = ''"
        >
          {{ quotaError }}
        </v-alert>
        <v-select
          v-model="serviceType"
          item-disabled="disabled"
          item-title="label"
          item-value="value"
          :items="serviceTypeOptions"
          label="Tipo de serviço"
          variant="outlined"
        />
        <v-text-field
          v-model="name"
          class="mt-4"
          hint="Deixe vazio para gerar automaticamente"
          label="Nome do serviço (opcional)"
          persistent-hint
          placeholder="meu-banco"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          @click="$router.push(`/projects/${projectId}/services`)"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="creating" @click="handleCreate">
          Criar Serviço
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Progresso da criação -->
    <v-card
      v-if="creating && createdService"
      class="mt-4"
      color="primary"
      variant="tonal"
    >
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2 mdi-spin">mdi-loading</v-icon>
        Provisionando banco de dados...
      </v-card-title>
      <v-card-text>
        <div v-if="taskStatus" class="mb-2">
          <div class="d-flex justify-space-between mb-1">
            <span>{{ taskStatus.status || "Processando..." }}</span>
            <span v-if="taskStatus.current != null"
              >{{ taskStatus.current }}%</span
            >
          </div>
          <v-progress-linear
            v-if="taskStatus.current != null"
            color="primary"
            height="8"
            :model-value="taskStatus.current"
            rounded
          />
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import type { Service, TaskStatus } from "@/interfaces";

import axios from "axios";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import ServicesService from "@/services/services";
import { useProjectStore } from "@/stores";

const route = useRoute();
const router = useRouter();
const projectId = (route.params as { projectId: string }).projectId || "";

const projectStore = useProjectStore();

const serviceTypeOptions = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "redis", label: "Redis", disabled: true },
];
const serviceType = ref("postgres");
const name = ref("");
const creating = ref(false);
const quotaError = ref("");
const createdService = ref<Service | null>(null);
const taskStatus = ref<TaskStatus | null>(null);
let pollInterval: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await projectStore.fetchProject(projectId);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

async function handleCreate() {
  if (!projectStore.currentProject?.id) return;
  creating.value = true;
  createdService.value = null;
  taskStatus.value = null;
  try {
    const service = await ServicesService.createService({
      project: projectStore.currentProject.id,
      service_type: serviceType.value,
      name: name.value || undefined,
    });
    createdService.value = service;
    if (service.task_id) {
      pollInterval = setInterval(pollStatus, 2000);
      await pollStatus();
    } else {
      creating.value = false;
      router.push(`/projects/${projectId}/services`);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.quota) {
      const data = error.response.data;
      quotaError.value = `Limite de serviços atingido: você possui ${data.current} de ${data.limit} serviços permitidos.`;
    }
    creating.value = false;
  }
}

async function pollStatus() {
  if (!createdService.value?.id) return;
  try {
    const status = await ServicesService.getServiceStatus(
      createdService.value.id,
    );
    taskStatus.value = status;
    if (status.state === "SUCCESS") {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      creating.value = false;
      router.push(`/projects/${projectId}/services`);
    } else if (status.state === "FAILURE") {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      creating.value = false;
    }
  } catch {
    // ignora erros de polling
  }
}
</script>
