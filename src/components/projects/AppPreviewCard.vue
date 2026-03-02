<template>
  <v-card v-if="app.domain" class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>
        <v-icon class="mr-2">mdi-web</v-icon>
        URL da Aplicação
      </span>
    </v-card-title>
    <v-card-text>
      <div class="preview-link">
        <div class="preview-link__bar">
          <div class="preview-link__dots">
            <span /><span /><span />
          </div>
          <div class="preview-link__url">
            <v-icon color="green" size="14">mdi-lock</v-icon>
            <span>{{ app.domain }}</span>
          </div>
          <div class="preview-link__actions">
            <v-btn
              density="compact"
              icon
              size="x-small"
              variant="text"
              @click="copyUrl"
            >
              <v-icon color="grey-lighten-1" size="14">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
              <v-tooltip activator="parent" location="top">
                {{ copied ? 'Copiado!' : 'Copiar URL' }}
              </v-tooltip>
            </v-btn>
          </div>
        </div>
        <a
          class="preview-link__body"
          :class="{ 'preview-link__body--offline': app.status !== 'RUNNING' }"
          :href="getAppUrl(app.domain)"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div v-if="app.status === 'RUNNING'" class="preview-link__content">
            <v-icon color="success" size="48">mdi-open-in-new</v-icon>
            <div class="preview-link__text">
              <span class="preview-link__label">Abrir aplicação</span>
              <span class="preview-link__domain">{{ app.domain }}</span>
            </div>
          </div>
          <div v-else class="preview-link__content">
            <v-icon color="grey" size="48">mdi-web-off</v-icon>
            <div class="preview-link__text">
              <span class="preview-link__label text-grey">App não está rodando</span>
              <span class="preview-link__domain text-grey">{{ app.domain }}</span>
            </div>
          </div>
        </a>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { App } from '@/interfaces'

  import { ref } from 'vue'

  const props = defineProps<{
    app: App
  }>()

  const copied = ref(false)

  function getAppUrl (domain?: string | null): string {
    if (!domain) return ''
    if (domain.startsWith('http://') || domain.startsWith('https://'))
      return domain
    return `https://${domain}`
  }

  async function copyUrl () {
    const url = getAppUrl(props.app.domain)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch {
      // fallback
    }
  }
</script>

<style scoped lang="scss">
.preview-link {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0d1117;

  &__bar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #161b22;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    gap: 10px;
  }

  &__dots {
    display: flex;
    gap: 5px;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
    }
  }

  &__url {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    padding: 4px 10px;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 12px;
    color: #8b949e;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__actions {
    flex-shrink: 0;
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    text-decoration: none;
    transition: background 0.15s;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    &--offline {
      cursor: default;
      opacity: 0.6;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: #c9d1d9;
  }

  &__domain {
    font-size: 12px;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    color: #58a6ff;
  }
}
</style>
