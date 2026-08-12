<template>
  <v-container class="px-10 py-2" fluid>
    <v-btn class="mb-4" prepend-icon="mdi-arrow-left" variant="text" @click="router.push(`/projects/${projectId}/services`)">
      Voltar para Serviços
    </v-btn>

    <h1 class="text-h4 mb-2">Criar Novo Serviço</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">Crie um serviço standalone. Depois você pode vincular o serviço a qualquer app do projeto.</p>

    <ServiceCreationForm
      v-model:name="name"
      v-model:service-type="serviceType"
      :error="creation.error.value"
      :loading="creation.creating.value"
      :options="serviceTypeOptions"
      @cancel="router.push(`/projects/${projectId}/services`)"
      @clear-error="creation.clearError"
      @submit="handleCreate"
    />

    <ServiceProvisionProgress
      :loading="creation.creating.value"
      :service="creation.createdService.value"
      :status="creation.taskStatus.value"
    />
  </v-container>
</template>

<script setup lang="ts">
  import type { ServiceType } from '@/modules/services/domain/models'

  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import ServiceCreationForm from '@/components/projects/ServiceCreationForm.vue'
  import ServiceProvisionProgress from '@/components/projects/ServiceProvisionProgress.vue'
  import { serviceRepository } from '@/modules/services'
  import { useServiceCreation } from '@/modules/services/presentation/composables/use-service-creation'
  import { useProjectStore } from '@/stores'

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''
  const projectStore = useProjectStore()
  const creation = useServiceCreation(serviceRepository)
  const serviceType = ref<ServiceType>('postgres')
  const name = ref('')
  const serviceTypeOptions: Array<{ value: ServiceType, label: string, disabled?: boolean }> = [
    { value: 'postgres', label: 'PostgreSQL' },
    { value: 'postgis', label: 'PostGIS (geoespacial)' },
    { value: 'redis', label: 'Redis' },
  ]

  onMounted(() => projectStore.fetchProject(projectId))

  async function handleCreate () {
    if (!projectStore.currentProject?.id) return
    try {
      const result = await creation.create({
        project: projectStore.currentProject.id,
        service_type: serviceType.value,
        name: name.value || undefined,
      })
      if (result.status?.state === 'FAILURE') {
        return
      }
      if (result.service.task_id && !result.status) {
        return
      }
      await router.push(`/projects/${projectId}/services`)
    } catch (error_) {
      console.error('Erro ao criar serviço:', error_)
    }
  }
</script>
