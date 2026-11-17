<route lang="yaml">
meta:
  layout: false
</route>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores'

  const router = useRouter()
  const authStore = useAuthStore()
  const error = ref<string | null>(null)
  const loading = ref(true)

  const errorCode = ref<string | null>(null)

  function getDefaultErrorMessage (errorCode: string): string {
    const errorMessages: Record<string, string> = {
      auth_failed: 'Falha ao obter token de acesso do GitHub.',
      user_info_failed: 'Falha ao obter informações do usuário do GitHub.',
      email_failed: 'Falha ao obter email do usuário do GitHub.',
      invalid_email: 'O email do usuário não é válido.',
      user_disabled:
        'Sua conta foi desabilitada pelo administrador. Entre em contato com o suporte.',
      unexpected_error: 'Erro inesperado durante a autenticação.',
    }
    return errorMessages[errorCode] || 'Erro desconhecido na autenticação.'
  }

  function getErrorIcon (code: string | null): string {
    const icons: Record<string, string> = {
      user_disabled: 'mdi-account-lock',
      invalid_email: 'mdi-email-off',
      auth_failed: 'mdi-key-remove',
      user_info_failed: 'mdi-account-alert',
      email_failed: 'mdi-email-alert',
    }
    return icons[code || ''] || 'mdi-alert-circle'
  }

  function getErrorColor (code: string | null): string {
    if (code === 'user_disabled') return 'warning'
    return 'error'
  }

  onMounted(async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    const messageParam = urlParams.get('message')

    if (errorParam) {
      errorCode.value = errorParam
      error.value = messageParam || getDefaultErrorMessage(errorParam)
      loading.value = false
      return
    }

    try {
      const isAuthenticated = await authStore.checkAuth()

      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        error.value = 'Falha na autenticação. Tente novamente.'
        loading.value = false
      }
    } catch (error_) {
      error.value
        = error_ instanceof Error
          ? error_.message
          : 'Erro ao processar autenticação'
      loading.value = false
    }
  })
</script>

<template>
  <div class="callback-container">
    <v-card class="callback-card text-center" max-width="400" rounded="lg" width="100%">
      <div v-if="loading" class="callback-state">
        <v-progress-circular color="primary" indeterminate size="48" width="4" />
        <h2 class="text-h6">Processando autenticação...</h2>
        <p class="text-body-2 text-medium-emphasis">Aguarde enquanto validamos suas credenciais</p>
      </div>

      <div v-else-if="error" class="callback-state">
        <v-icon :color="getErrorColor(errorCode)" size="64">{{
          getErrorIcon(errorCode)
        }}</v-icon>

        <h2 v-if="errorCode === 'user_disabled'" class="text-h6 text-warning">
          Conta Desabilitada
        </h2>

        <h2 v-else-if="errorCode === 'invalid_email'" class="text-h6">Email Não Permitido</h2>
        <h2 v-else class="text-h6">Erro na autenticação</h2>

        <p class="text-body-2 text-medium-emphasis">{{ error }}</p>

        <v-btn class="mt-2" color="primary" @click="router.push('/')">
          Voltar ao início
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.callback-card {
  padding: 3rem;
}

.callback-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
