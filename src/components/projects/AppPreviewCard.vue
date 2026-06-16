<template>
  <v-card v-if="app.domain" class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>
        <v-icon class="mr-2">mdi-web</v-icon>
        Preview da Aplicação
      </span>
    </v-card-title>

    <v-card-text>
      <div class="app-preview">
        <div class="app-preview__bar">
          <div aria-hidden="true" class="app-preview__dots">
            <span class="app-preview__dot app-preview__dot--red" />
            <span class="app-preview__dot app-preview__dot--yellow" />
            <span class="app-preview__dot app-preview__dot--green" />
          </div>

          <div class="app-preview__url">
            <v-icon :color="isRunning ? 'success' : 'grey'" size="14">
              {{ isRunning ? 'mdi-lock' : 'mdi-web-off' }}
            </v-icon>

            <span>{{ app.domain }}</span>
          </div>

          <div class="app-preview__actions">
            <v-btn
              v-if="isRunning"
              density="compact"
              icon
              size="small"
              variant="text"
              @click="reloadPreview"
            >
              <v-icon color="grey-lighten-1" size="14">mdi-refresh</v-icon>

              <v-tooltip activator="parent" location="top">
                Recarregar preview
              </v-tooltip>
            </v-btn>

            <v-btn
              density="compact"
              icon
              size="small"
              variant="text"
              @click="copyUrl"
            >
              <v-icon color="grey-lighten-1" size="14">
                {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
              </v-icon>

              <v-tooltip activator="parent" location="top">
                {{ copied ? 'Copiado!' : 'Copiar URL' }}
              </v-tooltip>
            </v-btn>

            <v-btn
              density="compact"
              :href="previewUrl"
              icon
              rel="noopener noreferrer"
              size="small"
              target="_blank"
              variant="text"
            >
              <v-icon color="grey-lighten-1" size="14">mdi-open-in-new</v-icon>

              <v-tooltip activator="parent" location="top">
                Abrir em nova aba
              </v-tooltip>
            </v-btn>
          </div>
        </div>

        <div
          ref="previewViewport"
          class="app-preview__viewport"
          :class="{ 'app-preview__viewport--offline': !isRunning }"
        >
          <template v-if="isRunning">
            <iframe
              :key="iframeKey"
              allow="clipboard-read; clipboard-write; fullscreen"
              class="app-preview__iframe"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              scrolling="no"
              :src="previewUrl"
              :style="previewFrameStyle"
              :title="`Preview de ${app.name}`"
              @load="previewLoading = false"
            />

            <div v-if="previewLoading" class="app-preview__overlay">
              <v-progress-circular color="primary" indeterminate size="28" width="3" />
              <span>Carregando preview...</span>
            </div>
          </template>

          <div v-else class="app-preview__placeholder">
            <v-icon color="grey" size="48">mdi-web-off</v-icon>

            <div class="app-preview__text">
              <span class="app-preview__label text-grey">App não está rodando</span>
              <span class="app-preview__domain text-grey">{{ app.domain }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { App } from '@/interfaces'

  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  const props = defineProps<{
    app: App
  }>()

  const DESIGN_WIDTH = 1920
  const DESIGN_HEIGHT = 1080

  const previewViewport = ref<HTMLElement | null>(null)
  const previewScale = ref(1)
  const previewOffsetX = ref(0)
  const previewOffsetY = ref(0)

  let resizeObserver: ResizeObserver | null = null

  const copied = ref(false)
  const iframeKey = ref(0)
  const previewLoading = ref(false)

  const isRunning = computed(() => props.app.status === 'RUNNING')
  const previewUrl = computed(() => getAppUrl(props.app.domain))

  watch(
    () => [props.app.domain, props.app.status],
    async () => {
      previewLoading.value = isRunning.value
      iframeKey.value += 1

      await nextTick()
      updatePreviewScale()
    },
    { immediate: true },
  )

  function getAppUrl (domain?: string | null): string {
    if (!domain) return ''
    if (domain.startsWith('http://') || domain.startsWith('https://'))
      return domain
    return `https://${domain}`
  }

  async function copyUrl () {
    const url = previewUrl.value
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch {
      // O navegador pode bloquear clipboard fora de contexto seguro.
    }
  }

  function reloadPreview () {
    if (!isRunning.value) return
    previewLoading.value = true
    iframeKey.value += 1
  }

  function updatePreviewScale () {
    const viewport = previewViewport.value
    if (!viewport) return

    const viewportWidth = viewport.clientWidth
    const viewportHeight = viewport.clientHeight

    if (!viewportWidth || !viewportHeight) return

    const scale = Math.min(
      viewportWidth / DESIGN_WIDTH,
      viewportHeight / DESIGN_HEIGHT,
    )

    previewScale.value = scale
    previewOffsetX.value = (viewportWidth - DESIGN_WIDTH * scale) / 2
    previewOffsetY.value = (viewportHeight - DESIGN_HEIGHT * scale) / 2
  }

  const previewFrameStyle = computed(() => ({
    width: `${DESIGN_WIDTH}px`,
    height: `${DESIGN_HEIGHT}px`,
    transform: `translate(${previewOffsetX.value}px, ${previewOffsetY.value}px) scale(${previewScale.value})`,
  }))

  onMounted(async () => {
    await nextTick()

    updatePreviewScale()

    if (previewViewport.value) {
      resizeObserver = new ResizeObserver(() => {
        updatePreviewScale()
      })

      resizeObserver.observe(previewViewport.value)
    }

    window.addEventListener('resize', updatePreviewScale)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', updatePreviewScale)
  })
</script>

<style scoped lang="scss">
.app-preview {
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), 0.14), transparent 34%),
    rgba(var(--v-theme-surface), 0.98);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  border-radius: 10px;
  overflow: hidden;

  &__bar {
    align-items: center;
    background:
      linear-gradient(90deg, rgba(var(--v-theme-primary), 0.14), transparent 52%),
      rgba(var(--v-theme-background), 0.72);
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.14);
    display: flex;
    gap: 10px;
    padding: 8px 12px;
  }

  &__dots {
    display: flex;
    gap: 5px;
  }

  &__dot {
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
    height: 8px;
    width: 8px;

    &--red {
      background: #ff5f57;
    }

    &--yellow {
      background: #febc2e;
    }

    &--green {
      background: #28c840;
    }
  }

  &__url {
    align-items: center;
    background: rgba(var(--v-theme-background), 0.62);
    border: 1px solid rgba(var(--v-theme-primary), 0.12);
    border-radius: 999px;
    color: rgba(var(--v-theme-on-surface), 0.74);
    display: flex;
    flex: 1;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 12px;
    gap: 6px;
    overflow: hidden;
    padding: 5px 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: 2px;
  }

  &__viewport {
    background: #f7f7fb;
    aspect-ratio: 16 / 9;
    height: auto;
    max-height: 500px;
    min-height: 320px;
    overflow: hidden;
    position: relative;
    width: 100%;

    &--offline {
      align-items: center;
      background: rgba(var(--v-theme-background), 0.48);
      display: flex;
      justify-content: center;
      height: auto;
      min-height: 260px;
    }
  }

  &__iframe {
    background: #fff;
    border: 0;
    display: block;
    left: 0;
    overflow: hidden;
    position: absolute;
    top: 0;
    transform-origin: top left;
  }

/*Socorro */

  &__overlay {
    align-items: center;
    backdrop-filter: blur(8px);
    background: rgba(var(--v-theme-surface), 0.78);
    color: rgba(var(--v-theme-on-surface), 0.72);
    display: flex;
    flex-direction: column;
    font-size: 13px;
    gap: 10px;
    inset: 0;
    justify-content: center;
    position: absolute;
    z-index: 2;
  }

  &__placeholder {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 28px 16px;
    text-align: center;
  }

  &__text {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    color: rgba(var(--v-theme-on-surface), 0.82);
    font-size: 14px;
    font-weight: 600;
  }

  &__domain {
    color: rgb(var(--v-theme-primary));
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 12px;
  }

  &__hint {
    background: rgba(var(--v-theme-surface), 0.92);
    border-left: 3px solid rgba(var(--v-theme-primary), 0.48);
    bottom: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    color: rgba(var(--v-theme-on-surface), 0.7);
    font-size: 11px;
    left: 12px;
    max-width: min(420px, calc(100% - 24px));
    padding: 8px 10px;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }
}

@media (max-width: 760px) {
  .app-preview {
    &__bar {
      align-items: stretch;
      flex-wrap: wrap;
    }

    &__url {
      order: 3;
      width: 100%;
    }

    &__actions {
      margin-left: auto;
    }

    &__hint {
      display: none;
    }
  }
}
</style>
