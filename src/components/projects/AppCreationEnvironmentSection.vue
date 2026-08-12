<template>
  <v-card class="mb-6 app-card" variant="flat">
    <v-expansion-panels variant="accordion">
      <v-expansion-panel elevation="0">
        <v-expansion-panel-title class="pa-5">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary" size="small">mdi-key-variant</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Variáveis de Ambiente</span>
            <v-chip v-if="variables.length > 0" color="primary" size="x-small">{{ variables.length }}</v-chip>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="d-flex ga-2 mb-4">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              size="small"
              variant="tonal"
              @click="emit('add')"
            >Adicionar</v-btn>

            <v-btn prepend-icon="mdi-file-import" size="small" variant="tonal" @click="emit('import')">Importar .env</v-btn>
          </div>

          <v-table v-if="variables.length > 0" density="compact">
            <thead><tr><th>Chave</th><th>Valor</th><th class="text-right" width="60" /></tr></thead>

            <tbody>
              <tr v-for="(variable, index) in variables" :key="index">
                <td><code class="text-primary">{{ variable.key }}</code></td>
                <td class="text-medium-emphasis"><code>{{ mask(variable.value) }}</code></td>

                <td class="text-right"><v-btn
                  color="error"
                  icon
                  size="x-small"
                  variant="text"
                  @click="emit('remove', index)"
                ><v-icon size="small">mdi-delete</v-icon></v-btn></td>
              </tr>
            </tbody>
          </v-table>

          <div v-else class="text-center py-4">
            <v-icon class="mb-2" color="grey" size="32">mdi-variable</v-icon>
            <p class="text-body-2 text-medium-emphasis">Nenhuma variável adicionada ainda.</p>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup lang="ts">
  interface EnvironmentEntry { key: string, value: string }

  defineProps<{ variables: EnvironmentEntry[] }>()
  const emit = defineEmits<{
    add: []
    import: []
    remove: [index: number]
  }>()

  function mask (value: string) {
    if (value.length <= 4) return '••••'
    return value.slice(0, 4) + '••••••'
  }
</script>
