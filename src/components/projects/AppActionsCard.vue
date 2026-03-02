<template>
  <v-card class="mb-4">
    <v-card-title>Ações</v-card-title>
    <v-card-text>
      <!-- Alerta quando está deletando -->
      <v-alert
        v-if="status === 'DELETING'"
        class="mb-4"
        color="pink"
        icon="mdi-delete-clock"
        type="warning"
        variant="tonal"
      >
        Este app está sendo deletado...
      </v-alert>

      <!-- Botão Iniciar/Parar -->
      <v-btn
        v-if="status === 'STOPPED'"
        block
        class="mb-2"
        color="success"
        :loading="starting"
        prepend-icon="mdi-play"
        @click="emit('start')"
      >
        Iniciar
      </v-btn>
      <v-btn
        v-else
        block
        class="mb-2"
        color="warning"
        :disabled="status === 'DELETING'"
        :loading="stopping"
        prepend-icon="mdi-stop"
        @click="emit('stop')"
      >
        Parar
      </v-btn>

      <!-- Botão Reiniciar -->
      <v-btn
        block
        class="mb-2"
        color="info"
        :disabled="status !== 'RUNNING'"
        :loading="restarting"
        prepend-icon="mdi-restart"
        @click="emit('restart')"
      >
        Reiniciar
      </v-btn>

      <!-- Botão Diagnosticar (só quando há erro) -->
      <v-btn
        v-if="status === 'ERROR' || status === 'FAILED'"
        block
        class="mb-2"
        color="warning"
        prepend-icon="mdi-lifebuoy"
        variant="tonal"
        @click="emit('diagnose')"
      >
        Diagnosticar problema
      </v-btn>

      <v-divider class="my-3" />

      <!-- Botão Deletar -->
      <v-btn
        block
        color="error"
        :disabled="status === 'DELETING'"
        prepend-icon="mdi-delete"
        variant="outlined"
        @click="confirmDelete = true"
      >
        Deletar App
      </v-btn>
    </v-card-text>
  </v-card>

  <!-- Acesso Rápido -->
  <v-card v-if="domain">
    <v-card-title>Acesso Rápido</v-card-title>
    <v-card-text>
      <v-btn
        block
        color="primary"
        :href="getAppUrl(domain)"
        prepend-icon="mdi-open-in-new"
        target="_blank"
        variant="tonal"
      >
        Abrir App
      </v-btn>
    </v-card-text>
  </v-card>

  <!-- Dialog Confirmar Exclusão -->
  <v-dialog v-model="confirmDelete" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-error">
        <v-icon class="mr-2">mdi-alert</v-icon>
        Confirmar Exclusão
      </v-card-title>
      <v-card-text>
        <p class="mb-3">
          Para deletar o app <strong>{{ appName }}</strong>, digite o nome abaixo:
        </p>
        <v-text-field
          v-model="deleteConfirmName"
          density="compact"
          hide-details
          placeholder="Nome do app"
          variant="outlined"
          @keyup.enter="canConfirmDelete && handleDelete()"
        />
        <p class="text-error text-caption mt-2">
          Esta ação não pode ser desfeita.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeDeleteDialog">Cancelar</v-btn>
        <v-btn
          color="error"
          :disabled="!canConfirmDelete"
          :loading="deleting"
          @click="handleDelete"
        >
          Deletar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  const props = defineProps<{
    status?: string
    domain?: string | null
    appName?: string
    starting?: boolean
    stopping?: boolean
    restarting?: boolean
    deleting?: boolean
  }>()

  const emit = defineEmits<{
    start: []
    stop: []
    restart: []
    delete: []
    diagnose: []
  }>()

  const confirmDelete = ref(false)
  const deleteConfirmName = ref('')

  const canConfirmDelete = computed(() => {
    return props.appName
      ? deleteConfirmName.value.trim() === props.appName
      : false
  })

  function closeDeleteDialog () {
    confirmDelete.value = false
    deleteConfirmName.value = ''
  }

  watch(confirmDelete, open => {
    if (open) deleteConfirmName.value = ''
  })

  function handleDelete () {
    if (!canConfirmDelete.value) return
    emit('delete')
    closeDeleteDialog()
  }

  function getAppUrl (domain?: string | null): string {
    if (!domain) return ''
    if (domain.startsWith('http://') || domain.startsWith('https://'))
      return domain
    return `https://${domain}`
  }
</script>
