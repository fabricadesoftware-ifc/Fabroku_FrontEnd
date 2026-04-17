<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push(`/projects/${projectId}`)"
    >
      Voltar para Projeto
    </v-btn>

    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="projectStore.currentProject">
      <h1 class="text-h4 mb-4">
        <v-icon class="mr-2">mdi-database</v-icon>
        Serviços do Projeto
      </h1>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Gerencie bancos de dados e outros serviços. Crie serviços standalone e
        vincule-os aos apps quando precisar.
      </p>

      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5">Serviços</h2>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          :to="`/projects/${projectId}/services/new`"
        >
          Novo Serviço
        </v-btn>
      </div>

      <v-progress-linear v-if="loadingServices" indeterminate />

      <v-row v-if="!loadingServices">
        <v-col
          v-for="service in services"
          :key="service.id"
          cols="12"
          lg="4"
          md="6"
        >
          <v-card class="h-100" variant="outlined">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-database</v-icon>
              {{ service.name }}
            </v-card-title>
            <v-card-subtitle>
              <v-chip color="blue" size="small" variant="tonal">
                {{ service.service_type }}
              </v-chip>
              <span v-if="service.app" class="ml-2 text-caption">
                Vinculado ao app
              </span>
              <span v-else class="ml-2 text-caption text-grey">
                Disponível para vincular
              </span>
            </v-card-subtitle>
            <v-card-text>
              <p v-if="service.container_name" class="text-caption mb-1">
                Contêiner: <code>{{ service.container_name }}</code>
              </p>
              <p v-else-if="service.task_id" class="text-caption text-primary">
                Provisionando...
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                v-if="!service.app"
                color="primary"
                size="small"
                variant="text"
                @click="openLinkDialog(service)"
              >
                Vincular a um App
              </v-btn>
              <v-btn
                color="error"
                :loading="deletingId === service.id"
                size="small"
                variant="text"
                @click="handleDelete(service)"
              >
                Excluir
              </v-btn>
              <v-btn
                v-if="service.app"
                color="warning"
                size="small"
                variant="text"
                @click="handleUnlink(service)"
              >
                Desvincular do app
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="services.length === 0" cols="12">
          <v-card class="text-center pa-8">
            <v-icon class="mb-4" color="grey" size="64">mdi-database-off</v-icon>
            <h3 class="text-h6 mb-2">Nenhum serviço neste projeto</h3>
            <p class="text-grey mb-4">
              Crie um banco PostgreSQL para começar. Você pode vincular o serviço
              a qualquer app do projeto depois.
            </p>
            <v-btn color="primary" :to="`/projects/${projectId}/services/new`">
              Criar Serviço
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Dialog para vincular serviço a um app -->
    <v-dialog v-model="linkDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Vincular serviço ao app</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedAppId"
            item-title="name"
            item-value="id"
            :items="projectApps"
            label="Selecione o app"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="linkDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="linking"
            @click="confirmLink"
          >
            Vincular
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { App, Service } from '@/interfaces'

  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import ServicesService from '@/services/services'
  import { useAppStore, useProjectStore } from '@/stores'

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''

  const projectStore = useProjectStore()
  const appStore = useAppStore()

  const loading = ref(true)
  const loadingServices = ref(true)
  const services = ref<Service[]>([])
  const deletingId = ref<number | null>(null)
  const linkDialog = ref(false)
  const selectedService = ref<Service | null>(null)
  const selectedAppId = ref<number | null>(null)
  const linking = ref(false)

  const projectApps = computed<App[]>(() => {
    return appStore.apps.filter(app => app.is_owner !== false)
  })

  onMounted(async () => {
    try {
      await projectStore.fetchProject(projectId)
      await appStore.fetchAppsByProject(projectId)
      await fetchServices()
    } finally {
      loading.value = false
    }
  })

  async function fetchServices () {
    loadingServices.value = true
    try {
      const response = await ServicesService.getServicesByProject(projectId)
      services.value = response.results
    } finally {
      loadingServices.value = false
    }
  }

  function openLinkDialog (service: Service) {
    selectedService.value = service
    selectedAppId.value = projectApps.value[0]?.id ?? null
    linkDialog.value = true
  }

  async function confirmLink () {
    if (!selectedService.value?.id || !selectedAppId.value) return
    const appId = selectedAppId.value
    linking.value = true
    try {
      await ServicesService.linkService(selectedService.value.id, appId)
      linkDialog.value = false
      selectedService.value = null
      selectedAppId.value = null
      await fetchServices()
      router.push(`/projects/${projectId}/${appId}`)
    } finally {
      linking.value = false
    }
  }

  async function handleDelete (service: Service) {
    if (!service.id || !confirm('Excluir este serviço? Todos os dados serão perdidos.')) return
    deletingId.value = service.id
    try {
      await ServicesService.deleteService(service.id)
      await fetchServices()
    } finally {
      deletingId.value = null
    }
  }

  async function handleUnlink (service: Service) {
    if (!service.id || !confirm('Desvincular este serviço?')) return
    try {
      await ServicesService.unlinkService(service.id)
      await fetchServices()
    } catch (error) {
      console.error('Erro ao desvincular serviço:', error)
    }
  }
</script>
