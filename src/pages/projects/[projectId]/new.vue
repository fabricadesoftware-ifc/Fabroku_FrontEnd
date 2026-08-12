<template>
  <v-container class="py-6" fluid>
    <v-breadcrumbs class="px-0 mb-2" :items="breadcrumbs">
      <template #divider>
        <v-icon size="small">mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <h1 class="text-h4 font-weight-bold mb-1">Criar Novo App</h1>

    <p class="text-body-2 text-medium-emphasis mb-8">
      Configure os detalhes do seu aplicativo para iniciar o deploy automatizado
      nos servidores configurados para esta instalação.
    </p>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="mb-6 app-card" variant="flat">
          <v-card-title class="d-flex align-center ga-2 pa-5 pb-1">
            <v-icon
              color="primary"
              size="small"
            >mdi-card-account-details-outline</v-icon>
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
                  :placeholder="'meu-tcc-' + new Date().getFullYear()"
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
                <span class="text-body-2 text-medium-emphasis">
                  {{ platformStore.appDomainSuffix }}
                </span>
              </v-col>
            </v-row>

            <div class="text-caption text-medium-emphasis mt-1">
              Use apenas letras minúsculas, números e hífens.
            </div>

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

        <AppCreationSourceCard
          v-model:manual-branch="newApp.branch"
          v-model:manual-git="newApp.git"
          v-model:selected-branch="selectedBranch"
          v-model:selected-repo="selectedRepo"
          v-model:source-mode="sourceMode"
          :branch-options="branchOptions"
          :loading="gitStore.loading"
          :repos="gitStore.repos"
          @search="handleRepoSearch"
        />

        <AppCreationEnvironmentSection
          :variables="envVars"
          @add="openAddEnvDialog"
          @import="dialogImportEnv = true"
          @remove="envVars.splice($event, 1)"
        />

        <v-card v-if="false" class="mb-6 app-card" variant="flat">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title class="pa-5">
                <div class="d-flex align-center ga-2">
                  <v-icon color="primary" size="small">mdi-cog-outline</v-icon>
                  <span class="text-subtitle-1 font-weight-medium">Configurações de Build (Opcional)</span>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="5">
                    <div class="text-overline text-medium-emphasis mb-1">
                      Framework Preset
                    </div>

                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="sticky-sidebar">
          <AppCreationSummary
            :branch="summaryBranch"
            :can-deploy="canDeploy"
            :custom-name="canCustomize ? customDokkuName.trim() : ''"
            :loading="creating"
            :project="projectStore.currentProject?.name || projectId"
            :quota-error="quotaError"
            :repo="summaryRepo"
            :variables-count="envVars.length"
            :visibility="summaryVisibility"
            :visibility-icon="summaryVisibilityIcon"
            @clear-error="quotaError = ''"
            @deploy="handleDeploy"
          />

        </div>
      </v-col>
    </v-row>

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

          <v-btn
            variant="text"
            @click="dialogAddEnvVar = false"
          >Cancelar</v-btn>

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

          <v-btn
            variant="text"
            @click="dialogImportEnv = false"
          >Cancelar</v-btn>

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
  import type { GitRepo } from '@/modules/git/domain/models'

  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import AppCreationEnvironmentSection from '@/components/projects/AppCreationEnvironmentSection.vue'
  import AppCreationSourceCard from '@/components/projects/AppCreationSourceCard.vue'
  import AppCreationSummary from '@/components/projects/AppCreationSummary.vue'
  import { appRepository } from '@/modules/applications'
  import { useApplicationCreation } from '@/modules/applications/presentation/composables/use-application-creation'
  import { getHttpErrorData } from '@/shared/errors/http-error'
  import {
    useAuthStore,
    useGitStore,
    usePlatformStore,
    useProjectStore,
  } from '@/stores'

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''

  const authStore = useAuthStore()
  const gitStore = useGitStore()
  const platformStore = usePlatformStore()
  const projectStore = useProjectStore()
  const applicationCreation = useApplicationCreation(appRepository)

  const canCustomize = computed(() => {
    return authStore.user?.is_fabric || authStore.user?.is_superuser || false
  })

  const sourceMode = ref<'github' | 'manual'>('github')
  const creating = applicationCreation.creating
  const quotaError = applicationCreation.quotaError
  const customDokkuName = ref('')
  const newApp = ref({ name: '', git: '', branch: '' })
  const selectedRepo = ref<GitRepo | null>(null)
  const selectedBranch = ref('')

  const nameChecking = ref(false)
  const nameAvailable = ref<boolean | null>(null)
  const nameError = ref('')
  let nameCheckTimer: ReturnType<typeof setTimeout> | null = null

  const nameCheckColor = computed(() => {
    if (nameChecking.value) return 'primary'
    if (nameAvailable.value === true) return 'success'
    if (nameAvailable.value === false) return 'error'
    return undefined
  })

  function onNameInput (value: string) {
    if (nameCheckTimer) clearTimeout(nameCheckTimer)
    nameAvailable.value = null
    nameError.value = ''

    const name = (value || '').trim().toLowerCase()
    if (!name) {
      nameChecking.value = false
      return
    }
    if (name.length < 2) {
      nameError.value = 'Nome deve ter pelo menos 2 caracteres.'
      nameAvailable.value = false
      return
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
      nameError.value = 'Use apenas letras minúsculas, números e hífens.'
      nameAvailable.value = false
      return
    }

    nameChecking.value = true
    nameCheckTimer = setTimeout(async () => {
      try {
        const result = await applicationCreation.checkName(name)
        if (newApp.value.name.trim().toLowerCase() === name) {
          nameAvailable.value = result.available
          nameError.value = result.available
            ? ''
            : result.reason || 'Nome já está em uso.'
        }
      } catch {
        nameAvailable.value = null
        nameError.value = ''
      } finally {
        nameChecking.value = false
      }
    }, 400)
  }

  onUnmounted(() => {
    if (nameCheckTimer) clearTimeout(nameCheckTimer)
  })

  const buildPreset = ref('Node.js')
  const _buildCommand = ref('')
  const _frameworkPresets = [
    'Node.js',
    'Python',
    'Django',
    'React',
    'Vue.js',
    'Next.js',
    'Nuxt.js',
    'Outro',
  ]

  const _buildCommandPlaceholder = computed(() => {
    const map: Record<string, string> = {
      'Node.js': 'npm run build',
      'Python': 'pip install -r requirements.txt',
      'Django': 'python manage.py collectstatic --noinput',
      'React': 'npm run build',
      'Vue.js': 'npm run build',
      'Next.js': 'npm run build',
      'Nuxt.js': 'npm run build',
      'Outro': '',
    }
    return map[buildPreset.value] || ''
  })

  const envVars = ref<Array<{ key: string, value: string }>>([])
  const dialogAddEnvVar = ref(false)
  const tempEnvVar = ref({ key: '', value: '' })
  const dialogImportEnv = ref(false)
  const envFileContent = ref('')
  const importError = ref('')

  const breadcrumbs = computed(() => [
    { title: 'Dashboard', to: '/dashboard' },
    { title: 'Projetos', to: '/projects' },
    {
      title: projectStore.currentProject?.name || 'Projeto',
      to: `/projects/${projectId}`,
    },
    { title: 'Novo App', disabled: true },
  ])

  const branchOptions = computed(() => {
    if (selectedRepo.value?.default_branch) {
      return [selectedRepo.value.default_branch]
    }
    return ['main', 'master', 'develop']
  })

  const summaryRepo = computed(() => {
    if (sourceMode.value === 'github' && selectedRepo.value) {
      return selectedRepo.value.full_name
    }
    if (sourceMode.value === 'manual' && newApp.value.git) {
      try {
        const url = new URL(newApp.value.git)
        return url.pathname.replace(/^\//, '').replace(/\.git$/, '')
      } catch {
        return newApp.value.git
      }
    }
    return '—'
  })

  const summaryBranch = computed(() => {
    if (sourceMode.value === 'github') {
      return selectedBranch.value || selectedRepo.value?.default_branch || 'main'
    }
    return newApp.value.branch || 'main'
  })

  const summaryVisibility = computed(() => {
    if (sourceMode.value === 'github' && selectedRepo.value) {
      return selectedRepo.value.private ? 'Privado' : 'Público'
    }
    return 'Público'
  })

  const summaryVisibilityIcon = computed(() => {
    if (sourceMode.value === 'github' && selectedRepo.value?.private) {
      return 'mdi-lock'
    }
    return 'mdi-earth'
  })

  const canDeploy = computed(() => {
    if (!newApp.value.name.trim()) return false
    if (nameAvailable.value !== true || nameChecking.value || !!nameError.value)
      return false
    if (sourceMode.value === 'github') return !!selectedRepo.value
    return !!newApp.value.git.trim()
  })

  onMounted(async () => {
    platformStore.fetchConfig()
    if (!projectStore.currentProject) {
      await projectStore.fetchProject(projectId)
    }
    if (gitStore.repos.length === 0) {
      gitStore.fetchRepos()
    }
  })

  function handleRepoSearch () {
    if (gitStore.repos.length === 0) {
      gitStore.fetchRepos()
    }
  }

  function openAddEnvDialog () {
    dialogAddEnvVar.value = true
    tempEnvVar.value = { key: '', value: '' }
  }

  function buildVariables (): Record<string, string> | undefined {
    if (envVars.value.length === 0) return undefined
    const variables: Record<string, string> = {}
    for (const envVar of envVars.value) {
      variables[envVar.key] = envVar.value
    }
    return variables
  }

  function confirmAddEnvVar () {
    if (!tempEnvVar.value.key || !tempEnvVar.value.value) return
    envVars.value.push({ ...tempEnvVar.value })
    dialogAddEnvVar.value = false
    tempEnvVar.value = { key: '', value: '' }
  }

  function importEnvFile () {
    importError.value = ''
    if (!envFileContent.value.trim()) {
      importError.value = 'Por favor, cole o conteúdo do arquivo .env'
      return
    }

    try {
      const lines = envFileContent.value.split('\n')
      let importedCount = 0

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const equalIndex = trimmed.indexOf('=')
        if (equalIndex === -1) continue

        const key = trimmed.slice(0, equalIndex).trim()
        let value = trimmed.slice(equalIndex + 1).trim()

        if (
          (value.startsWith('\'') && value.endsWith('\''))
          || (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1)
        }

        if (key && value) {
          const existingIndex = envVars.value.findIndex(v => v.key === key)
          if (existingIndex === -1) {
            envVars.value.push({ key, value })
          } else {
            const existing = envVars.value[existingIndex]
            if (existing) existing.value = value
          }
          importedCount++
        }
      }

      if (importedCount === 0) {
        importError.value
          = 'Nenhuma variável válida encontrada no formato KEY=VALUE'
        return
      }

      dialogImportEnv.value = false
      envFileContent.value = ''
    } catch (error_) {
      importError.value = 'Erro ao processar arquivo .env'
      console.error('Erro ao importar .env:', error_)
    }
  }

  watch(selectedRepo, repo => {
    if (repo) {
      if (!newApp.value.name) {
        newApp.value.name = repo.name
        onNameInput(repo.name)
      }
      newApp.value.git = repo.clone_url
      selectedBranch.value = repo.default_branch
    }
  })

  async function handleDeploy () {
    const name = newApp.value.name.trim()
    if (!name) return

    let git = ''
    let branch: string | undefined

    if (sourceMode.value === 'github' && selectedRepo.value) {
      git = selectedRepo.value.clone_url
      branch = selectedBranch.value || selectedRepo.value.default_branch
    } else {
      git = newApp.value.git.trim()
      branch = newApp.value.branch || undefined
    }

    if (!git) return

    creating.value = true
    try {
      const { app, status } = await applicationCreation.create({
        name,
        git,
        branch,
        project: projectId,
        variables: buildVariables(),
        ...(canCustomize.value && customDokkuName.value.trim()
          ? { name_dokku: customDokkuName.value.trim() }
          : {}),
      })

      if (app?.id) {
        try {
          if (
            status?.state === 'FAILURE'
            && (status as any).error_type === 'DeployKeysDisabled'
          ) {
            router.push({
              path: '/projects/deploy-keys-disabled',
              query: { help_url: (status as any).help_url || undefined },
            })
            return
          }
          if (
            status?.state === 'FAILURE'
            && (status as any).error_type === 'OrgPermissionDenied'
          ) {
            router.push({
              path: '/projects/org-permission-denied',
              query: { help_url: (status as any).help_url || undefined },
            })
            return
          }
        } catch {
        // Se falhar ao buscar status, apenas segue fluxo normal
        }
        router.push(`/projects/${projectId}/${app.id}`)
      } else {
        router.push(`/projects/${projectId}`)
      }
    } catch (error_) {
      const data = getHttpErrorData(error_)
      if (data && typeof data !== 'string' && data.quota) {
        quotaError.value = `Limite de apps atingido: você possui ${data.current} de ${data.limit} apps permitidos.`
      } else {
        console.error('Erro ao criar app:', error_)
      }
    } finally {
      creating.value = false
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
