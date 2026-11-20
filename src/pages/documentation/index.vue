<template>
  <v-container class="text-center py-12">
    <p>A documentação mudou para <a :href="DOCS_URL">{{ DOCS_URL }}</a>.</p>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'

  // A documentação agora é um site próprio (VitePress, repositório Fabroku_Docs).
  const DOCS_URL = 'https://docs.fabroku.fabricadesoftware.ifc.edu.br'

  onMounted(() => window.location.replace(DOCS_URL))
</script>
