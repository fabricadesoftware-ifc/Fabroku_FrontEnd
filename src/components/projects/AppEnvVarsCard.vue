<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Variáveis de Ambiente</span>
      <div class="d-flex ga-2">
        <v-btn
          prepend-icon="mdi-file-import"
          size="small"
          variant="tonal"
          @click="dialogImportEnv = true"
        >
          Importar .env
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="small"
          variant="tonal"
          @click="openAddDialog"
        >
          Adicionar
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text>
      <v-table
        v-if="variables && Object.keys(variables).length > 0"
        density="compact"
      >
        <thead>
          <tr>
            <th>Chave</th>
            <th>Valor</th>
            <th width="80">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in variables" :key="key">
            <td>
              <code>{{ key }}</code>
            </td>
            <td>
              <code>{{ showSecrets ? value : "••••••••" }}</code>
            </td>
            <td>
              <v-btn
                color="error"
                icon
                size="small"
                variant="text"
                @click="emit('remove', String(key))"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else class="text-center py-4 text-grey">
        <v-icon class="mb-2" size="32">mdi-variable</v-icon>
        <p>Nenhuma variável configurada</p>
      </div>
      <v-switch
        v-if="variables && Object.keys(variables).length > 0"
        v-model="showSecrets"
        class="mt-2"
        density="compact"
        hide-details
        label="Mostrar valores"
      />
    </v-card-text>
  </v-card>

  <!-- Dialog Adicionar Variáveis (suporta múltiplas) -->
  <v-dialog v-model="dialogEnvVar" max-width="600">
    <v-card>
      <v-card-title>Adicionar Variáveis de Ambiente</v-card-title>
      <v-card-text>
        <div
          v-for="(entry, index) in newEnvVars"
          :key="index"
          class="d-flex ga-3 align-center mb-3"
        >
          <v-text-field
            v-model="entry.key"
            :autofocus="index === 0"
            density="compact"
            hide-details
            label="Chave"
            placeholder="DATABASE_URL"
            variant="outlined"
          />
          <v-text-field
            v-model="entry.value"
            density="compact"
            hide-details
            label="Valor"
            placeholder="postgres://..."
            variant="outlined"
          />
          <v-btn
            v-if="newEnvVars.length > 1"
            color="error"
            icon
            size="small"
            variant="text"
            @click="newEnvVars.splice(index, 1)"
          >
            <v-icon size="small">mdi-close</v-icon>
          </v-btn>
        </div>
        <v-btn
          class="mt-1"
          prepend-icon="mdi-plus"
          size="small"
          variant="text"
          @click="newEnvVars.push({ key: '', value: '' })"
        >
          Mais uma variável
        </v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogEnvVar = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!hasValidEntries"
          :loading="saving"
          @click="handleAddMultiple"
        >
          Salvar {{ validCount > 1 ? `(${validCount})` : "" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Importar .env -->
  <v-dialog v-model="dialogImportEnv" max-width="600">
    <v-card>
      <v-card-title>Importar Variáveis do .env</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="envFileContent"
          autofocus
          hint="Cole o conteúdo do seu arquivo .env aqui"
          label="Conteúdo do .env"
          placeholder="DATABASE_URL=postgres://...
API_KEY=sk-...
PORT=3000"
          rows="10"
          variant="outlined"
        />
        <v-alert
          v-if="importError"
          class="mt-2"
          closable
          color="error"
          type="error"
          @click:close="importError = ''"
        >
          {{ importError }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogImportEnv = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!envFileContent"
          :loading="saving"
          @click="handleImportEnv"
        >
          Importar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  defineProps<{
    variables?: Record<string, string>
    saving?: boolean
  }>()

  const emit = defineEmits<{
    'add': [envVar: { key: string, value: string }]
    'add-multiple': [envVars: Array<{ key: string, value: string }>]
    'remove': [key: string]
  }>()

  const showSecrets = ref(false)
  const dialogEnvVar = ref(false)
  const dialogImportEnv = ref(false)
  const newEnvVars = ref<Array<{ key: string, value: string }>>([
    { key: '', value: '' },
  ])
  const envFileContent = ref('')
  const importError = ref('')

  const validEntries = computed(() =>
    newEnvVars.value.filter(e => e.key.trim() && e.value.trim()),
  )

  const hasValidEntries = computed(() => validEntries.value.length > 0)
  const validCount = computed(() => validEntries.value.length)

  function openAddDialog () {
    newEnvVars.value = [{ key: '', value: '' }]
    dialogEnvVar.value = true
  }

  function handleAddMultiple () {
    const entries = validEntries.value.map(e => ({
      key: e.key.trim(),
      value: e.value.trim(),
    }))
    if (entries.length === 0) return

    if (entries.length === 1 && entries[0]) {
      emit('add', entries[0])
    } else {
      emit('add-multiple', entries)
    }
    dialogEnvVar.value = false
    newEnvVars.value = [{ key: '', value: '' }]
  }

  function parseEnvContent (
    content: string,
  ): Array<{ key: string, value: string }> {
    const results: Array<{ key: string, value: string }> = []
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const equalIndex = trimmed.indexOf('=')
      if (equalIndex === -1) continue

      const key = trimmed.slice(0, equalIndex).trim()
      let value = trimmed.slice(equalIndex + 1).trim()

      if (
        (value.startsWith('\'') && value.endsWith('\''))
        || (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1)
      }

      if (key && value) {
        results.push({ key, value })
      }
    }
    return results
  }

  function handleImportEnv () {
    importError.value = ''
    if (!envFileContent.value.trim()) {
      importError.value = 'Por favor, cole o conteúdo do arquivo .env'
      return
    }

    const parsed = parseEnvContent(envFileContent.value)

    if (parsed.length === 0) {
      importError.value
        = 'Nenhuma variável válida encontrada no formato KEY=VALUE'
      return
    }

    emit('add-multiple', parsed)
    dialogImportEnv.value = false
    envFileContent.value = ''
  }
</script>
