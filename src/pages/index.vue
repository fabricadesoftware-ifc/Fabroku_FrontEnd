<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <v-app>
    <v-main class="bg-dark">
      <v-container class="pa-0" fluid>
        <v-row no-gutters>
          <v-col class="d-flex flex-column" cols="12">

            <!-- Main Content -->
            <v-container
              class="flex-grow-1 d-flex align-center justify-center main-area"
            >
              <v-sheet
                class="text-center px-4"
                color="transparent"
                max-width="800"
                width="100%"
              >
                <!-- Icon Cloud -->
                <div class="icon-cloud-wrapper mb-6">
                  <IconCloudDemo />
                </div>

                <h1 class="text-h3 font-weight-bold text-white mb-4">
                  Bem-vindo ao Fabroku
                </h1>

                <p class="text-body-1 text-grey-lighten-2 mb-8">
                  Hospede e gerencie seus projetos do Tecnico
                </p>

                <v-btn
                  block
                  class="text-none font-weight-bold mb-4"
                  color="#1313ec"
                  elevation="0"
                  prepend-icon="mdi-code-tags"
                  rounded="lg"
                  size="x-large"
                  style="max-width: 400px; margin: 0 auto"
                  @click="login"
                >
                  Entrar com GitHub
                </v-btn>

                <p class="text-body-2" style="color: #9d9db9">
                  O acesso é 100% via sua conta do GitHub.
                </p>
              </v-sheet>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- FOOTER COLADO NO FUNDO -->
    <v-footer app color="transparent">
      <v-container>
        <v-row justify="center">
          <v-col class="text-center" cols="12">
            <p class="text-body-2 ma-0" style="color: #9d9db9">
              © {{ new Date().getFullYear() }} Fábrica De Software. Todos os
              direitos reservados.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
  import IconCloudDemo from '@/components/demo/IconCloudDemo.vue'
  import { useAuthStore } from '@/stores'
  const authStore = useAuthStore()

  function login () {
    authStore.login()
  }
</script>

<style scoped>

.main-area {
  min-height: calc(100vh - 256px);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.gap-2 {
  gap: 8px;
}

/* Icon Cloud Wrapper */
.icon-cloud-wrapper {
  max-width: 100vw;
  margin: 0 auto;
}

/* Hover effect nos links do footer */
.footer-link:hover {
  color: white !important;
  transition: color 0.2s;
}

/* Garantir que o texto do botão seja branco */
.v-btn :deep(.v-btn__content) {
  color: white !important;
}
</style>
