<template>
  <div class="access-log-panel">
    <div class="access-log-panel__header">
      <div>
        <div class="access-log-panel__title">Acessos HTTP</div>

        <div class="access-log-panel__subtitle">
          Mock visual baseado em dokku nginx:access-logs
        </div>
      </div>

      <v-chip color="grey" density="compact" size="x-small" variant="tonal">
        mock
      </v-chip>
    </div>

    <div class="access-log-panel__toolbar">
      <v-text-field
        v-model="search"
        class="access-log-panel__search"
        clearable
        density="compact"
        hide-details
        placeholder="Buscar por rota, IP, navegador..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
      />

      <div class="access-log-panel__summary">
        <v-chip density="compact" size="small" variant="tonal">
          {{ filteredEntries.length }} request(s)
        </v-chip>

        <v-chip
          :color="errorCount ? 'error' : 'success'"
          density="compact"
          size="small"
          variant="tonal"
        >
          {{ errorCount }} erro(s)
        </v-chip>
      </div>
    </div>

    <div class="access-log-panel__list">
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="access-row"
        :class="`access-row--${entry.statusGroup}`"
        role="button"
        tabindex="0"
        @click="openEntry(entry)"
        @keydown.enter.prevent="openEntry(entry)"
        @keydown.space.prevent="openEntry(entry)"
      >
        <div class="access-row__status">
          <span>{{ entry.status }}</span>
        </div>

        <div class="access-row__main">
          <div class="access-row__topline">
            <v-chip
              class="access-row__method"
              density="compact"
              size="small"
              variant="tonal"
            >
              {{ entry.method }}
            </v-chip>

            <span class="access-row__path">{{ entry.path }}</span>
          </div>

          <div class="access-row__meta">
            <span>{{ entry.time }}</span>
            <span>{{ entry.protocol }}</span>
            <span>{{ formatBytes(entry.bytes) }}</span>
          </div>
        </div>

        <div class="access-row__preview">
          <span>{{ entry.origin }}</span>
          <v-icon size="16">mdi-chevron-right</v-icon>
        </div>
      </div>

      <div v-if="filteredEntries.length === 0" class="access-log-panel__empty">
        Nenhum acesso encontrado com o filtro atual.
      </div>
    </div>

    <transition name="access-details-slide">
      <div v-if="detailsOpen && selectedEntry" class="access-details-shell">
        <button
          aria-label="Fechar detalhes da request"
          class="access-details__scrim"
          type="button"
          @click="detailsOpen = false"
        />

        <aside aria-label="Detalhes da request" class="access-details">
          <div class="access-details__header">
            <div>
              <div class="access-details__eyebrow">Detalhes da request</div>

              <div class="access-details__title">
                {{ selectedEntry.method }} {{ selectedEntry.path }}
              </div>
            </div>

            <v-btn
              density="compact"
              icon="mdi-close"
              size="small"
              variant="text"
              @click="detailsOpen = false"
            />
          </div>

          <div class="access-details__status" :class="`access-details__status--${selectedEntry.statusGroup}`">
            <span>{{ selectedEntry.status }}</span>
            <strong>{{ getStatusLabel(selectedEntry.status) }}</strong>
          </div>

          <div class="access-details__section">
            <div class="access-details__section-title">Request</div>

            <dl class="access-details__grid">
              <div>
                <dt>Metodo</dt>
                <dd>{{ selectedEntry.method }}</dd>
              </div>

              <div>
                <dt>Protocolo</dt>
                <dd>{{ selectedEntry.protocol }}</dd>
              </div>

              <div>
                <dt>Horario</dt>
                <dd>{{ selectedEntry.time }}</dd>
              </div>

              <div>
                <dt>Tamanho</dt>
                <dd>{{ formatBytes(selectedEntry.bytes) }}</dd>
              </div>
            </dl>

            <div class="access-details__field">
              <span>Path</span>
              <code>{{ selectedEntry.path }}</code>
            </div>
          </div>

          <div class="access-details__section">
            <div class="access-details__section-title">Cliente</div>

            <dl class="access-details__grid">
              <div>
                <dt>IP</dt>
                <dd>{{ selectedEntry.ip }}</dd>
              </div>

              <div>
                <dt>Localizacao</dt>
                <dd>{{ selectedEntry.location }}</dd>
              </div>

              <div>
                <dt>Navegador</dt>
                <dd>{{ selectedEntry.browser }}</dd>
              </div>

              <div>
                <dt>Sistema</dt>
                <dd>{{ selectedEntry.os }}</dd>
              </div>
            </dl>
          </div>

          <div class="access-details__section">
            <div class="access-details__section-title">Origem</div>

            <div class="access-details__field">
              <span>Host de origem</span>
              <code>{{ selectedEntry.origin }}</code>
            </div>

            <div class="access-details__field">
              <span>Referrer</span>
              <code>{{ selectedEntry.referrer }}</code>
            </div>
          </div>

          <div class="access-details__section">
            <div class="access-details__section-title">User agent</div>

            <div class="access-details__field">
              <code>{{ selectedEntry.userAgent }}</code>
            </div>
          </div>

          <div class="access-details__section">
            <div class="access-details__section-title">Linha bruta</div>

            <div class="access-details__field">
              <code>{{ selectedEntry.raw }}</code>
            </div>
          </div>
        </aside>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  interface AccessEntry {
    id: number
    ip: string
    time: string
    method: string
    path: string
    protocol: string
    status: number
    bytes: number
    referrer: string
    userAgent: string
    browser: string
    os: string
    origin: string
    location: string
    statusGroup: 'success' | 'redirect' | 'warning' | 'error'
    raw: string
  }

  const search = ref('')
  const detailsOpen = ref(false)
  const selectedEntry = ref<AccessEntry | null>(null)

  const MOCK_ACCESS_LOGS = [
    '128.201.229.211 - - [15/Jun/2026:23:02:58 -0300] "GET /api/logs/app-runtime/?app=112&num=200 HTTP/2.0" 200 1905 "http://localhost:3000/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"',
    '128.201.229.211 - - [15/Jun/2026:23:03:01 -0300] "GET /api/apps/apps/112/ HTTP/2.0" 200 966 "https://fabroku.fabricadesoftware.ifc.edu.br/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"',
    '2804:14d:5c86:8a4d::12 - - [15/Jun/2026:23:03:05 -0300] "POST /api/apps/apps/112/redeploy/ HTTP/2.0" 202 111 "https://fabroku.fabricadesoftware.ifc.edu.br/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"',
    '45.224.18.90 - - [15/Jun/2026:23:03:10 -0300] "GET /api/projects/projects/ HTTP/2.0" 304 0 "https://fabroku.fabricadesoftware.ifc.edu.br/dashboard" "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15"',
    '187.33.200.17 - - [15/Jun/2026:23:03:18 -0300] "GET /api/logs/app-runtime/?app=112&num=200 HTTP/2.0" 500 682 "https://fabroku.fabricadesoftware.ifc.edu.br/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0"',
  ]

  const entries = computed(() => MOCK_ACCESS_LOGS.map(log => parseAccessLog(log)).filter(Boolean) as AccessEntry[])

  const filteredEntries = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return entries.value

    return entries.value.filter(entry => {
      const haystack = [
        entry.ip,
        entry.method,
        entry.path,
        entry.status,
        entry.origin,
        entry.browser,
        entry.os,
        entry.location,
      ].join(' ').toLowerCase()

      return haystack.includes(query)
    })
  })

  const errorCount = computed(() => entries.value.filter(entry => entry.status >= 500).length)

  function parseAccessLog (line: string, index: number): AccessEntry | null {
    const match = line.match(/^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]+?) HTTP\/([^"]+)" (\d{3}) (\d+) "([^"]*)" "([^"]*)"$/)
    if (!match) return null

    const [, ip, timestamp, method, path, protocol, statusText, bytesText, referrer, userAgent] = match
    const status = Number(statusText)

    return {
      id: index,
      ip,
      time: formatTimestamp(timestamp),
      method,
      path,
      protocol: `HTTP/${protocol}`,
      status,
      bytes: Number(bytesText),
      referrer,
      userAgent,
      browser: parseBrowser(userAgent),
      os: parseOs(userAgent),
      origin: parseOrigin(referrer),
      location: mockLocation(ip),
      statusGroup: getStatusGroup(status),
      raw: line,
    }
  }

  function openEntry (entry: AccessEntry) {
    selectedEntry.value = entry
    detailsOpen.value = true
  }

  function formatTimestamp (timestamp: string): string {
    const time = timestamp.match(/:(\d{2}:\d{2}:\d{2}) /)?.[1]
    return time || timestamp
  }

  function parseBrowser (userAgent: string): string {
    if (/firefox/i.test(userAgent)) return 'Firefox'
    if (/edg/i.test(userAgent)) return 'Edge'
    if (/chrome/i.test(userAgent)) return 'Chrome'
    if (/safari/i.test(userAgent)) return 'Safari'
    return 'Navegador desconhecido'
  }

  function parseOs (userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows'
    if (/mac os/i.test(userAgent)) return 'macOS'
    if (/linux/i.test(userAgent)) return 'Linux'
    if (/android/i.test(userAgent)) return 'Android'
    if (/iphone|ipad/i.test(userAgent)) return 'iOS'
    return 'SO desconhecido'
  }

  function parseOrigin (referrer: string): string {
    if (!referrer || referrer === '-') return 'Direto'

    try {
      return new URL(referrer).host
    } catch {
      return referrer
    }
  }

  function mockLocation (ip: string): string {
    if (ip.includes(':')) return 'IPv6, Brasil (mock)'
    if (ip.startsWith('128.201')) return 'Araquari, BR (mock)'
    return 'Brasil (mock)'
  }

  function getStatusGroup (status: number): AccessEntry['statusGroup'] {
    if (status >= 500) return 'error'
    if (status >= 400) return 'warning'
    if (status >= 300) return 'redirect'
    return 'success'
  }

  function formatBytes (bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  function getStatusLabel (status: number): string {
    if (status >= 500) return 'Erro do servidor'
    if (status >= 400) return 'Erro do cliente'
    if (status >= 300) return 'Redirecionamento/cache'
    if (status >= 200) return 'Sucesso'
    return 'Informativo'
  }
</script>

<style scoped lang="scss">
.access-log-panel {
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #c9d1d9;
  overflow: hidden;
  position: relative;

  &__header,
  &__toolbar {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  &__header {
    background: #161b22;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 10px 14px;
  }

  &__title {
    color: #8b949e;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__subtitle {
    color: #6e7681;
    font-size: 11px;
    margin-top: 2px;
  }

  &__toolbar {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    gap: 12px;
    padding: 8px 14px;
  }

  &__search {
    max-width: 360px;
  }

  &__search :deep(.v-field) {
    background: #161b22;
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: none;
    min-height: 34px;
  }

  &__search :deep(.v-field__input) {
    color: #c9d1d9;
    font-size: 12px;
    min-height: 34px;
    padding-bottom: 0;
    padding-top: 0;
  }

  &__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  &__list {
    display: grid;
    gap: 0;
  }

  &__empty {
    color: #6e7681;
    font-size: 12px;
    padding: 22px;
    text-align: center;
  }
}

.access-row {
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.045);
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 58px minmax(0, 1fr) minmax(120px, 0.22fr);
  padding: 10px 14px;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.035);
  }

  &:focus-visible {
    outline: 1px solid rgba(88, 166, 255, 0.6);
    outline-offset: -1px;
  }

  &__status {
    align-items: center;
    border-radius: 999px;
    display: flex;
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    font-weight: 700;
    justify-content: center;
    min-height: 28px;
  }

  &--success &__status {
    background: rgba(63, 185, 80, 0.12);
    color: #3fb950;
  }

  &--redirect &__status {
    background: rgba(88, 166, 255, 0.12);
    color: #58a6ff;
  }

  &--warning &__status {
    background: rgba(210, 153, 34, 0.12);
    color: #d29922;
  }

  &--error &__status {
    background: rgba(248, 81, 73, 0.12);
    color: #f85149;
  }

  &__main,
  &__preview {
    min-width: 0;
  }

  &__topline {
    align-items: center;
    display: flex;
    gap: 8px;
    min-width: 0;
  }

  &__method {
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  }

  &__path {
    color: #c9d1d9;
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta,
  &__client-line {
    color: #6e7681;
    font-size: 11px;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
  }

  &__preview {
    align-items: center;
    color: #6e7681;
    display: flex;
    font-size: 11px;
    gap: 6px;
    justify-content: flex-end;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.access-details-shell {
  inset: 0;
  overflow: hidden;
  position: absolute;
  z-index: 5;
}

.access-details {
  background: #0d1117 !important;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  bottom: 0;
  color: #c9d1d9;
  max-width: 100%;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 0;
  width: 420px;

  &__scrim {
    background: rgba(1, 4, 9, 0.42);
    border: 0;
    cursor: pointer;
    inset: 0;
    padding: 0;
    position: absolute;
    width: 100%;
  }

  &__header {
    align-items: flex-start;
    background: #161b22;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 16px;
  }

  &__eyebrow {
    color: #6e7681;
    font-size: 11px;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  &__title {
    color: #f0f6fc;
    font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
    font-size: 13px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  &__status {
    align-items: center;
    display: flex;
    gap: 10px;
    padding: 14px 16px;

    span {
      border-radius: 999px;
      font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
      font-size: 12px;
      font-weight: 700;
      min-width: 48px;
      padding: 6px 10px;
      text-align: center;
    }

    strong {
      font-size: 13px;
    }

    &--success span {
      background: rgba(63, 185, 80, 0.12);
      color: #3fb950;
    }

    &--redirect span {
      background: rgba(88, 166, 255, 0.12);
      color: #58a6ff;
    }

    &--warning span {
      background: rgba(210, 153, 34, 0.12);
      color: #d29922;
    }

    &--error span {
      background: rgba(248, 81, 73, 0.12);
      color: #f85149;
    }
  }

  &__section {
    border-top: 1px solid rgba(255, 255, 255, 0.055);
    padding: 16px;
  }

  &__section-title {
    color: #8b949e;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  &__grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 0;

    div {
      min-width: 0;
    }

    dt {
      color: #6e7681;
      font-size: 11px;
      margin-bottom: 3px;
    }

    dd {
      color: #c9d1d9;
      font-size: 12px;
      margin: 0;
      overflow-wrap: anywhere;
    }
  }

  &__field {
    display: grid;
    gap: 6px;
    margin-top: 12px;

    &:first-child {
      margin-top: 0;
    }

    span {
      color: #6e7681;
      font-size: 11px;
    }

    code {
      background: #161b22;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 6px;
      color: #c9d1d9;
      display: block;
      font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
      font-size: 11px;
      line-height: 1.55;
      overflow-wrap: anywhere;
      padding: 9px 10px;
      white-space: pre-wrap;
    }
  }
}

.access-details-slide-enter-active,
.access-details-slide-leave-active {
  transition: opacity 160ms ease;

  .access-details {
    transition: transform 180ms ease;
  }
}

.access-details-slide-enter-from,
.access-details-slide-leave-to {
  opacity: 0;

  .access-details {
    transform: translateX(24px);
  }
}

@media (max-width: 880px) {
  .access-log-panel {
    &__toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    &__search {
      max-width: none;
    }

    &__summary {
      justify-content: flex-start;
    }
  }

  .access-row {
    align-items: flex-start;
    grid-template-columns: 48px 1fr;

    &__preview {
      grid-column: 2;
      justify-content: flex-start;
    }
  }

  .access-details {
    width: min(360px, 92%);
  }
}
</style>
