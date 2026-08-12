<template>
  <v-container class="px-10 py-2" fluid>
    <v-btn class="mb-4" prepend-icon="mdi-arrow-left" variant="text" @click="router.push(`/projects/${projectId}`)">
      Voltar para Projeto
    </v-btn>

    <v-progress-linear v-if="loading || projectStore.loading" indeterminate />

    <template v-if="projectStore.currentProject">
      <h1 class="text-h4 mb-4"><v-icon class="mr-2">mdi-database</v-icon>Serviços do Projeto</h1>
      <p class="text-body-2 text-medium-emphasis mb-6">Gerencie bancos de dados e outros serviços. Crie serviços standalone e vincule-os aos apps quando precisar.</p>

      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5">Serviços</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" :to="`/projects/${projectId}/services/new`">Novo Serviço</v-btn>
      </div>

      <v-progress-linear v-if="servicesLoading" indeterminate />

      <v-row v-else>
        <v-col
          v-for="service in services"
          :key="service.id"
          cols="12"
          lg="4"
          md="6"
        >
          <ServiceCard
            :deleting="deletingId === service.id"
            :ready="servicesState.isReady(service)"
            :service="service"
            @delete="handleDelete(service)"
            @link="openLinkDialog(service)"
            @unlink="handleUnlink(service)"
          />
        </v-col>

        <v-col v-if="services.length === 0" cols="12">
          <v-card class="text-center pa-8">
            <v-icon class="mb-4" color="grey" size="64">mdi-database-off</v-icon>
            <h3 class="text-h6 mb-2">Nenhum serviço neste projeto</h3>
            <p class="text-grey mb-4">Crie um PostgreSQL, PostGIS ou Redis para começar. Você pode vincular o serviço a qualquer app do projeto depois.</p>
            <v-btn color="primary" :to="`/projects/${projectId}/services/new`">Criar Serviço</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <ServiceLinkDialog
      v-model="linkDialog"
      v-model:selected-app="selectedAppId"
      :apps="projectApps"
      :error="serviceError || linkError"
      :loading="linking"
      @clear-error="clearLinkError"
      @confirm="confirmLink"
    />
  </v-container>
</template>

<script setup lang="ts">
  import type { App } from '@/modules/applications/domain/models'
  import type { Service } from '@/modules/services/domain/models'

  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import ServiceCard from '@/components/projects/ServiceCard.vue'
  import ServiceLinkDialog from '@/components/projects/ServiceLinkDialog.vue'
  import { appRepository } from '@/modules/applications'
  import { serviceRepository } from '@/modules/services'
  import { useProjectServices } from '@/modules/services/presentation/composables/use-project-services'
  import { useAppStore, useProjectStore } from '@/stores'

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''
  const projectStore = useProjectStore()
  const appStore = useAppStore()
  const loading = ref(true)
  const linkDialog = ref(false)
  const selectedService = ref<Service | null>(null)
  const selectedAppId = ref<number | null>(null)
  const linkError = ref('')
  const servicesState = useProjectServices({ serviceRepository, appRepository, projectId })
  const services = servicesState.services
  const servicesLoading = servicesState.loading
  const deletingId = servicesState.deletingId
  const linking = servicesState.linking
  const serviceError = servicesState.error
  const projectApps = computed<App[]>(() => appStore.apps.filter(app => app.is_owner !== false))

  onMounted(async () => {
    try {
      await projectStore.fetchProject(projectId)
      await appStore.fetchAppsByProject(projectId)
      await servicesState.fetch()
    } finally {
      loading.value = false
    }
  })

  function openLinkDialog (service: Service) {
    if (!servicesState.isReady(service)) {
      linkError.value = 'Aguarde o serviço terminar de provisionar antes de vincular.'
      return
    }
    selectedService.value = service
    selectedAppId.value = projectApps.value[0]?.id ?? null
    linkError.value = ''
    linkDialog.value = true
  }

  async function confirmLink () {
    if (!selectedService.value?.id || !selectedAppId.value) return
    try {
      const status = await servicesState.link(selectedService.value.id, selectedAppId.value)
      if (status?.state === 'FAILURE') {
        linkError.value = servicesState.error.value || 'Não foi possível vincular o serviço ao app.'
        return
      }
      const appId = selectedAppId.value
      linkDialog.value = false
      selectedService.value = null
      selectedAppId.value = null
      await appStore.fetchAppsByProject(projectId)
      await router.push(`/projects/${projectId}/${appId}`)
    } catch (error_) {
      console.error('Erro ao vincular serviço:', error_)
      linkError.value = servicesState.error.value || 'Não foi possível vincular o serviço ao app.'
    }
  }

  async function handleDelete (service: Service) {
    if (!service.id || !confirm('Excluir este serviço? Todos os dados serão perdidos.')) return
    try {
      await servicesState.remove(service)
    } catch (error_) {
      console.error('Erro ao excluir serviço:', error_)
    }
  }

  async function handleUnlink (service: Service) {
    if (!service.id || !confirm('Desvincular este serviço?')) return
    try {
      await servicesState.unlink(service)
      await appStore.fetchAppsByProject(projectId)
    } catch (error_) {
      console.error('Erro ao desvincular serviço:', error_)
    }
  }

  function clearLinkError () {
    linkError.value = ''
    servicesState.error.value = ''
  }
</script>
