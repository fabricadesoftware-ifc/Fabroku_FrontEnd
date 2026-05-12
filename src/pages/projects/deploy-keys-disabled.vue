<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-8" elevation="10" max-width="420" style="width: 100%">
      <div class="text-center mb-6">
        <v-avatar
          class="mb-3"
          color="warning"
          size="70"
          style="box-shadow: 0 2px 12px #ff9800a0"
        >
          <v-icon color="white" size="48">mdi-lock-alert</v-icon>
        </v-avatar>

        <h1 class="text-h5 font-weight-bold mb-2">
          Deploy keys desabilitadas no GitHub
        </h1>

        <p class="mb-4 text-grey-darken-1">
          O deploy automático não pôde ser realizado porque as
          <b>deploy keys</b> estão desabilitadas neste repositório ou organização.<br>
          Para continuar, ative as deploy keys nas configurações do repositório ou da organização no GitHub.
        </p>
      </div>

      <v-btn
        v-if="helpUrl"
        block
        class="mb-3"
        color="primary"
        :href="helpUrl"
        prepend-icon="mdi-open-in-new"
        target="_blank"
      >
        Ver documentação do GitHub
      </v-btn>

      <v-btn
        block
        color="secondary"
        variant="outlined"
        @click="$router.back()"
      >Voltar</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const helpUrl = computed(
    () =>
      (route.query.help_url as string)
      || 'https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/about-ssh-deploy-keys',
  )
</script>
