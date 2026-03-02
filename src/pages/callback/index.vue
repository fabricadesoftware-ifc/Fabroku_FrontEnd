<route lang="yaml">
meta:
  layout: false
</route>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";

const router = useRouter();
const authStore = useAuthStore();
const error = ref<string | null>(null);
const loading = ref(true);

const errorCode = ref<string | null>(null);

function getDefaultErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    auth_failed: "Falha ao obter token de acesso do GitHub.",
    user_info_failed: "Falha ao obter informações do usuário do GitHub.",
    email_failed: "Falha ao obter email do usuário do GitHub.",
    invalid_email: "O email do usuário não é válido.",
    user_disabled:
      "Sua conta foi desabilitada pelo administrador. Entre em contato com o suporte.",
    unexpected_error: "Erro inesperado durante a autenticação.",
  };
  return errorMessages[errorCode] || "Erro desconhecido na autenticação.";
}

function getErrorIcon(code: string | null): string {
  const icons: Record<string, string> = {
    user_disabled: "mdi-account-lock",
    invalid_email: "mdi-email-off",
    auth_failed: "mdi-key-remove",
    user_info_failed: "mdi-account-alert",
    email_failed: "mdi-email-alert",
  };
  return icons[code || ""] || "mdi-alert-circle";
}

function getErrorColor(code: string | null): string {
  if (code === "user_disabled") return "warning";
  return "error";
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get("error");
  const messageParam = urlParams.get("message");

  if (errorParam) {
    errorCode.value = errorParam;
    error.value = messageParam
      ? decodeURIComponent(messageParam)
      : getDefaultErrorMessage(errorParam);
    loading.value = false;
    return;
  }

  try {
    // Com cookies httpOnly, o backend já setou os cookies
    // Apenas verificamos se a autenticação funcionou
    const isAuthenticated = await authStore.checkAuth();

    if (isAuthenticated) {
      // Redireciona para o dashboard
      router.push("/dashboard");
    } else {
      error.value = "Falha na autenticação. Tente novamente.";
      loading.value = false;
    }
  } catch (error_) {
    error.value =
      error_ instanceof Error
        ? error_.message
        : "Erro ao processar autenticação";
    loading.value = false;
  }
});
</script>

<template>
  <div class="callback-container">
    <div class="callback-card">
      <div v-if="loading" class="loading">
        <div class="spinner" />
        <h2>Processando autenticação...</h2>
        <p>Aguarde enquanto validamos suas credenciais</p>
      </div>

      <div v-else-if="error" class="error">
        <v-icon :color="getErrorColor(errorCode)" size="64">{{
          getErrorIcon(errorCode)
        }}</v-icon>

        <h2 v-if="errorCode === 'user_disabled'" class="text-warning">
          Conta Desabilitada
        </h2>
        <h2 v-else-if="errorCode === 'invalid_email'">Email Não Permitido</h2>
        <h2 v-else>Erro na autenticação</h2>

        <p>{{ error }}</p>

        <button class="retry-button" @click="router.push('/')">
          Voltar ao início
        </button>
      </div>
    </div>
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
  background: var(--color-background-soft);
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-heading);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  color: var(--color-heading);
  margin: 0;
}

p {
  color: var(--color-text);
  margin: 0;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-heading);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.3s ease;
}

.retry-button:hover {
  opacity: 0.8;
}
</style>
