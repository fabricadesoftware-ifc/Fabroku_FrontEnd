<template>
  <v-container class="py-6" fluid>
    <!-- Breadcrumb -->
    <v-breadcrumbs class="px-0 mb-2" :items="breadcrumbs">
      <template #divider>
        <v-icon size="small">mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <!-- Título -->
    <h1 class="text-h4 font-weight-bold mb-1">Criar Novo App</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Configure os detalhes do seu aplicativo para iniciar o deploy automatizado
      nos servidores da Fábrica de Software.
    </p>

    <v-row>
      <!-- ========== COLUNA ESQUERDA — FORMULÁRIO ========== -->
      <v-col cols="12" lg="8">
        <!-- Seção 1 — Identificação do App -->
        <v-card class="mb-6 app-card" variant="flat">
          <v-card-title class="d-flex align-center ga-2 pa-5 pb-1">
            <v-icon color="primary" size="small"
              >mdi-card-account-details-outline</v-icon
            >
            Identificação do App
          </v-card-title>
          <v-card-text class="pa-5 pt-4">
            <div class="text-body-2 text-medium-emphasis mb-1">
              Nome do Aplicativo
            </div>
            <v-row align="center" no-gutters>
              <v-col>
                <v-text-field
                  v-model="newApp.name"
                  autofocus
                  :color="nameCheckColor"
                  density="comfortable"
                  :error-messages="nameError ? [nameError] : []"
                  :loading="nameChecking"
                  placeholder="meu-tcc-2024"
                  variant="outlined"
                  @update:model-value="onNameInput"
                >
                  <template
                    v-if="nameAvailable === true && !nameChecking && !nameError"
                    #append-inner
                  >
                    <v-icon color="success" size="20">mdi-check-circle</v-icon>
                  </template>
                  <template
                    v-else-if="nameAvailable === false && !nameChecking"
                    #append-inner
                  >
                    <v-icon color="error" size="20">mdi-close-circle</v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col class="pl-3" cols="auto">
                <span class="text-body-2 text-medium-emphasis"
                  >.class.fabricadesoftware.ifc.edu.br</span
                >
              </v-col>
            </v-row>
            <div class="text-caption text-medium-emphasis mt-1">
              Use apenas letras minúsculas, números e hífens.
            </div>

            <!-- Nome personalizado — apenas fabric/admin -->
            <template v-if="canCustomize">
              <v-divider class="my-5" />
              <div class="text-body-2 text-medium-emphasis mb-1">
                Nome Personalizado no Dokku
              </div>
              <v-text-field
                v-model="customDokkuName"
                density="comfortable"
                hide-details
                placeholder="meu-app-custom"
                prepend-inner-icon="mdi-rename"
                variant="outlined"
              />
              <div class="text-caption text-medium-emphasis mt-1">
                Deixe vazio para usar o nome padrão:
                <code>{{ newApp.name || "nome-do-app" }}</code>
              </div>
            </template>
          </v-card-text>
        </v-card>

        <!-- Seção 2 — Integração GitHub -->
        <v-card class="mb-6 app-card" variant="flat">
          <v-card-title
            class="d-flex align-center justify-space-between pa-5 pb-1"
          >
            <div class="d-flex align-center ga-2">
              <v-icon color="primary" size="small">mdi-github</v-icon>
              Integração GitHub
            </div>
            <v-chip
              v-if="gitStore.repos.length > 0 || selectedRepo"
              color="success"
              prepend-icon="mdi-check-circle"
              size="small"
              variant="flat"
            >
              Conectado
            </v-chip>
          </v-card-title>
          <v-card-text class="pa-5 pt-4">
            <!-- Toggle manual / github -->
            <v-btn-toggle
              v-model="sourceMode"
              class="mb-5"
              color="primary"
              density="comfortable"
              mandatory
              rounded="lg"
              variant="outlined"
            >
              <v-btn value="github">
                <v-icon class="mr-1" size="small">mdi-github</v-icon>
                Repositório GitHub
              </v-btn>
              <v-btn value="manual">
                <v-icon class="mr-1" size="small">mdi-link-variant</v-icon>
                URL Manual
              </v-btn>
            </v-btn-toggle>

            <template v-if="sourceMode === 'github'">
              <div class="text-body-2 text-medium-emphasis mb-1">
                Repositório
              </div>
              <v-autocomplete
                v-model="selectedRepo"
                chips
                clearable
                density="comfortable"
                hide-details
                item-title="full_name"
                :items="gitStore.repos"
                :loading="gitStore.loading"
                no-data-text="Nenhum repositório encontrado"
                placeholder="Buscar repositório..."
                prepend-inner-icon="mdi-source-repository"
                return-object
                variant="outlined"
                @update:search="handleRepoSearch"
              >
                <template #chip="{ item }">
                  <v-icon class="mr-1" size="small"
                    >mdi-source-repository</v-icon
                  >
                  {{ item.raw.full_name }}
                </template>
                <template #item="{ item, props: itemProps }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-icon
                        :color="item.raw.private ? 'warning' : 'success'"
                        size="small"
                      >
                        {{
                          item.raw.private
                            ? "mdi-lock"
                            : "mdi-source-repository"
                        }}
                      </v-icon>
                    </template>
                    <template #append>
                      <v-chip size="x-small" variant="outlined">{{
                        item.raw.default_branch
                      }}</v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <div class="text-body-2 text-medium-emphasis mt-5 mb-1">
                Branch de Produção
              </div>
              <v-select
                v-model="selectedBranch"
                density="comfortable"
                hide-details
                :items="branchOptions"
                prepend-inner-icon="mdi-source-branch"
                variant="outlined"
              />
              <div class="text-caption text-medium-emphasis mt-1">
                Esta branch será usada para builds automáticos em cada push.
              </div>
            </template>

            <template v-else>
              <div class="text-body-2 text-medium-emphasis mb-1">
                URL do Repositório Git
              </div>
              <v-text-field
                v-model="newApp.git"
                density="comfortable"
                hide-details
                placeholder="https://github.com/user/repo.git"
                prepend-inner-icon="mdi-link-variant"
                variant="outlined"
              />

              <div class="text-body-2 text-medium-emphasis mt-5 mb-1">
                Branch
              </div>
              <v-text-field
                v-model="newApp.branch"
                density="comfortable"
                hide-details
                placeholder="main"
                prepend-inner-icon="mdi-source-branch"
                variant="outlined"
              />
              <div class="text-caption text-medium-emphasis mt-1">
                Deixe vazio para usar a branch padrão.
              </div>
            </template>
          </v-card-text>
        </v-card>

        <!-- Seção 3 — Variáveis de Ambiente (expansível) -->
        <v-card class="mb-6 app-card" variant="flat">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title class="pa-5">
                <div class="d-flex align-center ga-2">
                  <v-icon color="primary" size="small">mdi-key-variant</v-icon>
                  <span class="text-subtitle-1 font-weight-medium"
                    >Variáveis de Ambiente</span
                  >
                  <v-chip
                    v-if="envVars.length > 0"
                    color="primary"
                    size="x-small"
                  >
                    {{ envVars.length }}
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="d-flex ga-2 mb-4">
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    size="small"
                    variant="tonal"
                    @click="
                      dialogAddEnvVar = true;
                      tempEnvVar = { key: '', value: '' };
                    "
                  >
                    Adicionar
                  </v-btn>
                  <v-btn
                    prepend-icon="mdi-file-import"
                    size="small"
                    variant="tonal"
                    @click="dialogImportEnv = true"
                  >
                    Importar .env
                  </v-btn>
                </div>

                <v-table v-if="envVars.length > 0" density="compact">
                  <thead>
                    <tr>
                      <th>Chave</th>
                      <th>Valor</th>
                      <th class="text-right" width="60" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(envVar, index) in envVars" :key="index">
                      <td>
                        <code class="text-primary">{{ envVar.key }}</code>
                      </td>
                      <td class="text-medium-emphasis">
                        <code>{{ maskValue(envVar.value) }}</code>
                      </td>
                      <td class="text-right">
                        <v-btn
                          color="error"
                          icon
                          size="x-small"
                          variant="text"
                          @click="envVars.splice(index, 1)"
                        >
                          <v-icon size="small">mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <div v-else class="text-center py-4">
                  <v-icon class="mb-2" color="grey" size="32"
                    >mdi-variable</v-icon
                  >
                  <p class="text-body-2 text-medium-emphasis">
                    Nenhuma variável adicionada ainda.
                  </p>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>

        <!-- Seção 4 — Configurações de Build (expansível) -->
        <v-card class="mb-6 app-card" variant="flat">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title class="pa-5">
                <div class="d-flex align-center ga-2">
                  <v-icon color="primary" size="small">mdi-cog-outline</v-icon>
                  <span class="text-subtitle-1 font-weight-medium"
                    >Configurações de Build (Opcional)</span
                  >
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="5">
                    <div class="text-overline text-medium-emphasis mb-1">
                      Framework Preset
                    </div>
                    <v-select
                      v-model="buildPreset"
                      density="comfortable"
                      hide-details
                      :items="frameworkPresets"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="7">
                    <div class="text-overline text-medium-emphasis mb-1">
                      Comando de Build
                    </div>
                    <v-text-field
                      v-model="buildCommand"
                      density="comfortable"
                      hide-details
                      :placeholder="buildCommandPlaceholder"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>

      <!-- ========== COLUNA DIREITA — RESUMO ========== -->
      <v-col cols="12" lg="4">
        <div class="sticky-sidebar">
          <!-- Card Resumo -->
          <v-card class="mb-4 app-card" variant="flat">
            <v-card-title class="pa-5 pb-3 text-subtitle-1 font-weight-bold">
              Resumo
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-5">
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2 text-medium-emphasis"
                  >Repositório</span
                >
                <span
                  class="text-body-2 font-weight-medium text-truncate ml-3"
                  style="max-width: 180px"
                >
                  {{ summaryRepo }}
                </span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2 text-medium-emphasis">Branch</span>
                <span class="text-body-2 font-weight-medium">
                  <v-icon size="x-small">mdi-source-branch</v-icon>
                  {{ summaryBranch }}
                </span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2 text-medium-emphasis"
                  >Visibilidade</span
                >
                <span class="text-body-2 font-weight-medium">
                  <v-icon size="x-small">{{ summaryVisibilityIcon }}</v-icon>
                  {{ summaryVisibility }}
                </span>
              </div>
              <div
                v-if="envVars.length > 0"
                class="d-flex justify-space-between mb-3"
              >
                <span class="text-body-2 text-medium-emphasis">Variáveis</span>
                <span class="text-body-2 font-weight-medium"
                  >{{ envVars.length }} configurada(s)</span
                >
              </div>
              <div
                v-if="canCustomize && customDokkuName.trim()"
                class="d-flex justify-space-between mb-3"
              >
                <span class="text-body-2 text-medium-emphasis">Nome Dokku</span>
                <span class="text-body-2 font-weight-medium">
                  <v-icon color="amber" size="x-small">mdi-star</v-icon>
                  {{ customDokkuName.trim() }}
                </span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Projeto</span>
                <span
                  class="text-body-2 font-weight-medium text-truncate ml-3"
                  style="max-width: 180px"
                >
                  {{ projectStore.currentProject?.name || projectId }}
                </span>
              </div>
            </v-card-text>
            <v-divider />
            <v-card-text class="pa-5">
              <v-btn
                block
                color="primary"
                :disabled="!canDeploy"
                :loading="creating"
                prepend-icon="mdi-rocket-launch"
                size="large"
                @click="handleDeploy"
              >
                Deploy App
              </v-btn>
              <p class="text-caption text-medium-emphasis text-center mt-3">
                Ao clicar em Deploy, você concorda com as
                <a class="text-primary" href="#">regras de uso</a> da Fábrica.
              </p>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog Adicionar Variável -->
    <v-dialog v-model="dialogAddEnvVar" max-width="500">
      <v-card>
        <v-card-title>Adicionar Variável</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="tempEnvVar.key"
            autofocus
            class="mb-4"
            hint="Ex: DATABASE_URL, API_KEY"
            label="Chave"
            placeholder="DATABASE_URL"
            variant="outlined"
          />
          <v-text-field
            v-model="tempEnvVar.value"
            hint="Ex: postgres://..., sk-..."
            label="Valor"
            placeholder="postgres://..."
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogAddEnvVar = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            :disabled="!tempEnvVar.key || !tempEnvVar.value"
            @click="confirmAddEnvVar"
          >
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Importar .env -->
    <v-dialog v-model="dialogImportEnv" max-width="600">
      <v-card>
        <v-card-title>Importar Variáveis do .env</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="envFileContent"
            autofocus
            hint="Cole o conteúdo do seu arquivo .env aqui"
            label="Conteúdo do .env"
            placeholder="DATABASE_URL=postgres://...
API_KEY=sk-...
PORT=3000"
            rows="10"
            variant="outlined"
          />
          <v-alert
            v-if="importError"
            class="mt-2"
            closable
            color="error"
            type="error"
            @click:close="importError = ''"
          >
            {{ importError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogImportEnv = false"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            :disabled="!envFileContent"
            @click="importEnvFile"
          >
            Importar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { GitRepo } from "@/interfaces";

import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppsService from "@/services/apps";
import {
  useAppStore,
  useAuthStore,
  useGitStore,
  useProjectStore,
} from "@/stores";

const route = useRoute();
const router = useRouter();
const projectId = (route.params as { projectId: string }).projectId || "";

const appStore = useAppStore();
const authStore = useAuthStore();
const gitStore = useGitStore();
const projectStore = useProjectStore();

// Permissão de nome personalizado
const canCustomize = computed(() => {
  return authStore.user?.is_fabric || authStore.user?.is_superuser || false;
});

// Estado principal
const sourceMode = ref<"github" | "manual">("github");
const creating = ref(false);
const customDokkuName = ref("");
const newApp = ref({ name: "", git: "", branch: "" });
const selectedRepo = ref<GitRepo | null>(null);
const selectedBranch = ref("");

// --- Verificação de nome em tempo real ---
const nameChecking = ref(false);
const nameAvailable = ref<boolean | null>(null);
const nameError = ref("");
let nameCheckTimer: ReturnType<typeof setTimeout> | null = null;

const nameCheckColor = computed(() => {
  if (nameChecking.value) return "primary";
  if (nameAvailable.value === true) return "success";
  if (nameAvailable.value === false) return "error";
  return undefined;
});

function onNameInput(value: string) {
  // Limpa timer anterior (debounce)
  if (nameCheckTimer) clearTimeout(nameCheckTimer);
  nameAvailable.value = null;
  nameError.value = "";

  const name = (value || "").trim().toLowerCase();
  if (!name) {
    nameChecking.value = false;
    return;
  }
  // Validação local rápida
  if (name.length < 2) {
    nameError.value = "Nome deve ter pelo menos 2 caracteres.";
    nameAvailable.value = false;
    return;
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
    nameError.value = "Use apenas letras minúsculas, números e hífens.";
    nameAvailable.value = false;
    return;
  }

  // Debounce de 400ms antes de chamar o backend
  nameChecking.value = true;
  nameCheckTimer = setTimeout(async () => {
    try {
      const result = await AppsService.checkName(name);
      // Só atualiza se ainda for o mesmo nome digitado
      if (newApp.value.name.trim().toLowerCase() === name) {
        nameAvailable.value = result.available;
        nameError.value = result.available
          ? ""
          : result.reason || "Nome já está em uso.";
      }
    } catch {
      // Se falhar, não bloqueia o usuário
      nameAvailable.value = null;
      nameError.value = "";
    } finally {
      nameChecking.value = false;
    }
  }, 400);
}

onUnmounted(() => {
  if (nameCheckTimer) clearTimeout(nameCheckTimer);
});

// Build
const buildPreset = ref("Node.js");
const buildCommand = ref("");
const frameworkPresets = [
  "Node.js",
  "Python",
  "Django",
  "React",
  "Vue.js",
  "Next.js",
  "Nuxt.js",
  "Outro",
];

const buildCommandPlaceholder = computed(() => {
  const map: Record<string, string> = {
    "Node.js": "npm run build",
    Python: "pip install -r requirements.txt",
    Django: "python manage.py collectstatic --noinput",
    React: "npm run build",
    "Vue.js": "npm run build",
    "Next.js": "npm run build",
    "Nuxt.js": "npm run build",
    Outro: "",
  };
  return map[buildPreset.value] || "";
});

// Variáveis de ambiente
const envVars = ref<Array<{ key: string; value: string }>>([]);
const dialogAddEnvVar = ref(false);
const tempEnvVar = ref({ key: "", value: "" });
const dialogImportEnv = ref(false);
const envFileContent = ref("");
const importError = ref("");

// Breadcrumbs
const breadcrumbs = computed(() => [
  { title: "Dashboard", to: "/dashboard" },
  { title: "Projetos", to: "/projects" },
  {
    title: projectStore.currentProject?.name || "Projeto",
    to: `/projects/${projectId}`,
  },
  { title: "Novo App", disabled: true },
]);

// Branch options (quando repo selecionado)
const branchOptions = computed(() => {
  if (selectedRepo.value?.default_branch) {
    return [selectedRepo.value.default_branch];
  }
  return ["main", "master", "develop"];
});

// Resumo computado
const summaryRepo = computed(() => {
  if (sourceMode.value === "github" && selectedRepo.value) {
    return selectedRepo.value.full_name;
  }
  if (sourceMode.value === "manual" && newApp.value.git) {
    try {
      const url = new URL(newApp.value.git);
      return url.pathname.replace(/^\//, "").replace(/\.git$/, "");
    } catch {
      return newApp.value.git;
    }
  }
  return "—";
});

const summaryBranch = computed(() => {
  if (sourceMode.value === "github") {
    return selectedBranch.value || selectedRepo.value?.default_branch || "main";
  }
  return newApp.value.branch || "main";
});

const summaryVisibility = computed(() => {
  if (sourceMode.value === "github" && selectedRepo.value) {
    return selectedRepo.value.private ? "Privado" : "Público";
  }
  return "Público";
});

const summaryVisibilityIcon = computed(() => {
  if (sourceMode.value === "github" && selectedRepo.value?.private) {
    return "mdi-lock";
  }
  return "mdi-earth";
});

const canDeploy = computed(() => {
  if (!newApp.value.name.trim()) return false;
  if (nameAvailable.value !== true || nameChecking.value || !!nameError.value)
    return false;
  if (sourceMode.value === "github") return !!selectedRepo.value;
  return !!newApp.value.git.trim();
});

// Carregar dados iniciais
onMounted(async () => {
  if (!projectStore.currentProject) {
    await projectStore.fetchProject(projectId);
  }
  if (gitStore.repos.length === 0) {
    gitStore.fetchRepos();
  }
});

// Sincronizar branch quando selecionar repo
function handleRepoSearch() {
  if (gitStore.repos.length === 0) {
    gitStore.fetchRepos();
  }
}

// Mascarar valor de variável
function maskValue(value: string) {
  if (value.length <= 4) return "••••";
  return value.slice(0, 4) + "••••••";
}

// Env vars
function buildVariables(): Record<string, string> | undefined {
  if (envVars.value.length === 0) return undefined;
  const variables: Record<string, string> = {};
  for (const envVar of envVars.value) {
    variables[envVar.key] = envVar.value;
  }
  return variables;
}

function confirmAddEnvVar() {
  if (!tempEnvVar.value.key || !tempEnvVar.value.value) return;
  envVars.value.push({ ...tempEnvVar.value });
  dialogAddEnvVar.value = false;
  tempEnvVar.value = { key: "", value: "" };
}

function importEnvFile() {
  importError.value = "";
  if (!envFileContent.value.trim()) {
    importError.value = "Por favor, cole o conteúdo do arquivo .env";
    return;
  }

  try {
    const lines = envFileContent.value.split("\n");
    let importedCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalIndex = trimmed.indexOf("=");
      if (equalIndex === -1) continue;

      const key = trimmed.slice(0, equalIndex).trim();
      let value = trimmed.slice(equalIndex + 1).trim();

      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1);
      }

      if (key && value) {
        const existingIndex = envVars.value.findIndex((v) => v.key === key);
        if (existingIndex === -1) {
          envVars.value.push({ key, value });
        } else {
          const existing = envVars.value[existingIndex];
          if (existing) existing.value = value;
        }
        importedCount++;
      }
    }

    if (importedCount === 0) {
      importError.value =
        "Nenhuma variável válida encontrada no formato KEY=VALUE";
      return;
    }

    dialogImportEnv.value = false;
    envFileContent.value = "";
  } catch (error_) {
    importError.value = "Erro ao processar arquivo .env";
    console.error("Erro ao importar .env:", error_);
  }
}

// Watch do selectedRepo para preencher campos
watch(selectedRepo, (repo) => {
  if (repo) {
    if (!newApp.value.name) newApp.value.name = repo.name;
    newApp.value.git = repo.clone_url;
    selectedBranch.value = repo.default_branch;
  }
});

// Deploy
async function handleDeploy() {
  const name = newApp.value.name.trim();
  if (!name) return;

  let git = "";
  let branch: string | undefined;

  if (sourceMode.value === "github" && selectedRepo.value) {
    git = selectedRepo.value.clone_url;
    branch = selectedBranch.value || selectedRepo.value.default_branch;
  } else {
    git = newApp.value.git.trim();
    branch = newApp.value.branch || undefined;
  }

  if (!git) return;

  creating.value = true;
  try {
    const app = await appStore.createApp({
      name,
      git,
      branch,
      project: projectId,
      variables: buildVariables(),
      ...(canCustomize.value && customDokkuName.value.trim()
        ? { name_dokku: customDokkuName.value.trim() }
        : {}),
    });

    // Após criar, buscar status da task para checar erro de deploy key ou permissão de org
    if (app?.id) {
      try {
        const status = await appStore.fetchAppStatus(String(app.id));
        // Detecta erro de deploy keys desabilitadas pelo error_type
        if (
          status?.state === "FAILURE" &&
          (status as any).error_type === "DeployKeysDisabled"
        ) {
          router.push({
            path: "/projects/deploy-keys-disabled",
            query: { help_url: (status as any).help_url || undefined },
          });
          return;
        }
        // Detecta erro de permissão de organização
        if (
          status?.state === "FAILURE" &&
          (status as any).error_type === "OrgPermissionDenied"
        ) {
          router.push({
            path: "/projects/org-permission-denied",
            query: { help_url: (status as any).help_url || undefined },
          });
          return;
        }
      } catch {
        // Se falhar ao buscar status, apenas segue fluxo normal
      }
      router.push(`/projects/${projectId}/${app.id}`);
    } else {
      router.push(`/projects/${projectId}`);
    }
  } catch (error_) {
    console.error("Erro ao criar app:", error_);
  } finally {
    creating.value = false;
  }
}
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 80px;
}

.app-card {
  background-color: #1a1a2e !important;
  border: none !important;
}
</style>
