<template>
  <v-app>
    <v-navigation-drawer class="sidebar-container" permanent>
      <div>
        <v-sheet class="d-flex align-center pr-5" elevation="0">
          <v-card
            class="d-flex align-center px-4 py-2 mt-3"
            elevation="0"
            rounded="lg"
          >
            <v-avatar
              :image="authStore.user?.avatar_url ?? undefined"
              :name="authStore.user?.name"
            />
            <div class="ml-2">
              <div class="text-subtitle-2 font-weight-medium text-capitalize">
                {{ authStore.user?.name || "Usuário" }}
              </div>
            </div>
          </v-card>
        </v-sheet>
        <v-list class="d-flex flex-column align-center px-2">
          <v-list-item
            class="menu-item"
            link
            prepend-icon="mdi-view-dashboard"
            rounded="lg"
            title="Dashboard"
            to="/dashboard"
          />
          <v-list-item
            class="menu-item"
            link
            prepend-icon="mdi-folder"
            rounded="lg"
            title="Projetos"
            to="/projects"
          />
          <v-list-item
            v-if="authStore.user?.is_superuser"
            class="menu-item"
            link
            prepend-icon="mdi-shield-crown"
            rounded="lg"
            title="Administração"
            to="/admin"
          />
          <v-list-item
            v-if="authStore.user?.is_superuser"
            class="menu-item"
            link
            prepend-icon="mdi-book-open-variant-outline"
            rounded="lg"
            title="Documentação"
            to="/documentation"
          />
        </v-list>
      </div>

      <v-spacer />

      <v-list class="d-flex flex-column align-center px-2">
        <v-list-item
          class="menu-item logout-button"
          link
          prepend-icon="mdi-logout"
          rounded="lg"
          title="Sair"
          @click="handleLogout"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="mt-4 mx-4">
      <RouterView />
    </v-main>
    <p class="text-background">Peraza esteve aqui (;</p>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/stores'
  const authStore = useAuthStore()

  onMounted(() => {
    authStore.checkAuth()
  })

  async function handleLogout () {
    await authStore.logout()
  }
</script>

<style scoped>
.sidebar-container {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

.sidebar-container :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-item {
  width: 100%;
  margin-bottom: 12px;
  height: 10px;
}

/* Reduz a margem do ícone */
.menu-item :deep(.v-list-item__spacer) {
  width: 16px !important;
}

/* Estilo do botão de logout */
.logout-button:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.logout-button :deep(.v-list-item-title) {
  color: rgb(244, 67, 54);
}
</style>
