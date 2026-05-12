<template>
  <v-container class="py-10 text-center">
    <v-icon color="error" size="x-large">mdi-account-lock</v-icon>

    <h1 class="text-h4 font-weight-bold mt-4 mb-2">
      Permissão insuficiente para acessar organização
    </h1>

    <p class="mb-4">
      O deploy automático não pôde ser realizado porque seu token do GitHub não possui permissão para acessar esta organização.<br>
      Para corrigir, reautorize o token e garanta que ele tenha acesso à organização desejada.<br>
      <b>Se for uma organização privada, verifique as configurações de deploy keys e permissões de OAuth.</b>
    </p>

    <v-img
      alt="Configuração de deploy keys na organização GitHub"
      class="mx-auto mb-4"
      max-width="600"
      src="../../assets/deploy-keys-org.png"
    />

    <v-btn
      v-if="helpUrl"
      class="mb-2"
      color="primary"
      :href="helpUrl"
      prepend-icon="mdi-open-in-new"
      target="_blank"
    >
      Reautorizar token no GitHub
    </v-btn>

    <v-btn color="secondary" @click="$router.back()">Voltar</v-btn>
  </v-container>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const helpUrl = computed(
    () =>
      (route.query.help_url as string)
      || 'https://github.com/settings/tokens',
  )
</script>
