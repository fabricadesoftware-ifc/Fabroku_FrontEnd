<template>
  <v-container class="documentation py-6" fluid>
    <!-- Header -->
    <div class="text-center mb-8">
      <v-icon class="mb-3" color="primary" size="56">mdi-console</v-icon>
      <h1 class="text-h3 font-weight-bold">Fabroku CLI</h1>
      <p class="text-grey mt-2" style="max-width: 600px; margin: 0 auto">
        DocumentaÃ§Ã£o completa da ferramenta de linha de comando para gerenciar
        seus apps na plataforma Fabroku.
      </p>
      <div class="mt-4 d-flex justify-center ga-3">
        <v-chip color="primary" prepend-icon="mdi-npm" variant="outlined">
          v0.1.4
        </v-chip>
        <v-chip color="success" prepend-icon="mdi-nodejs" variant="outlined">
          Node.js 18+
        </v-chip>
        <v-chip color="info" prepend-icon="mdi-license" variant="outlined">
          MIT
        </v-chip>
      </div>
    </div>

    <!-- NavegaÃ§Ã£o rÃ¡pida -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" size="20">mdi-compass</v-icon>
        NavegaÃ§Ã£o rÃ¡pida
      </v-card-title>
      <v-card-text>
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            v-for="section in navSections"
            :key="section.id"
            :prepend-icon="section.icon"
            size="small"
            variant="tonal"
            @click="scrollTo(section.id)"
          >
            {{ section.label }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- InstalaÃ§Ã£o -->
    <section :id="'instalacao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-download</v-icon>
          InstalaÃ§Ã£o
        </v-card-title>
        <v-card-text>
          <p class="mb-3">Instale a CLI globalmente via npm:</p>
          <CodeBlock code="npm i -g fabroku" />

          <v-divider class="my-4" />

          <p class="font-weight-medium mb-2">Desenvolvimento local:</p>
          <CodeBlock
            :code="`cd Fabroku_CLI\nnpm install\nnpm link\nfabroku --help`"
          />
          <v-alert class="mt-3" density="compact" type="info" variant="tonal">
            O comando <code>npm link</code> registra a CLI globalmente em modo
            de desenvolvimento.
          </v-alert>
        </v-card-text>
      </v-card>
    </section>

    <!-- AutenticaÃ§Ã£o -->
    <section :id="'autenticacao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="warning">mdi-shield-key</v-icon>
          AutenticaÃ§Ã£o
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            A CLI utiliza autenticaÃ§Ã£o via <strong>GitHub OAuth</strong>. O
            login abre o navegador automaticamente e recebe o token via
            callback.
          </p>

          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku login</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-2">Autentica o usuÃ¡rio via GitHub OAuth.</p>
              <FlagTable :flags="loginFlags" />
              <p class="mt-3 font-weight-medium">Como funciona:</p>
              <v-timeline class="mt-2" density="compact" side="end">
                <v-timeline-item
                  v-for="(step, i) in loginSteps"
                  :key="i"
                  :dot-color="step.color"
                  size="x-small"
                >
                  <span class="text-body-2">{{ step.text }}</span>
                </v-timeline-item>
              </v-timeline>
              <CodeBlock
                class="mt-3"
                :code="`fabroku login\nfabroku login --api-url http://localhost:8000`"
              />
            </v-card-text>
          </v-card>

          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku logout</code>
            </v-card-title>
            <v-card-text>
              <p>Encerra a sessÃ£o, limpando o token e dados do usuÃ¡rio.</p>
              <CodeBlock class="mt-2" code="fabroku logout" />
            </v-card-text>
          </v-card>

          <v-card variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku whoami</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-2">
                Exibe informaÃ§Ãµes do usuÃ¡rio autenticado e verifica se o token Ã©
                vÃ¡lido.
              </p>
              <CodeBlock :code="whoamiExample" />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- VerificaÃ§Ã£o de Arquivos -->
    <section :id="'verificacao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="info">mdi-file-check</v-icon>
          VerificaÃ§Ã£o de Arquivos
        </v-card-title>
        <v-card-text>
          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku verify</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Verifica se o projeto contÃ©m os arquivos necessÃ¡rios para deploy
                no Dokku.
              </p>
              <FlagTable :flags="verifyFlags" />

              <v-divider class="my-4" />

              <p class="font-weight-medium mb-2">
                Arquivos requeridos por tipo:
              </p>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle-2">
                      <v-icon class="mr-1" size="18">mdi-vuejs</v-icon>
                      Frontend (SPA)
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item
                          v-for="f in frontendFiles"
                          :key="f.name"
                          :prepend-icon="'mdi-file-document-outline'"
                        >
                          <v-list-item-title>
                            <code>{{ f.name }}</code>
                          </v-list-item-title>
                          <v-list-item-subtitle>{{
                            f.desc
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle-2">
                      <v-icon
                        class="mr-1"
                        size="18"
                      >mdi-language-python</v-icon>
                      Backend (Django)
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item
                          v-for="f in backendFiles"
                          :key="f.name"
                          :prepend-icon="'mdi-file-document-outline'"
                        >
                          <v-list-item-title>
                            <code>{{ f.name }}</code>
                          </v-list-item-title>
                          <v-list-item-subtitle>{{
                            f.desc
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert
                class="mt-3"
                density="compact"
                type="info"
                variant="tonal"
              >
                A auto-detecÃ§Ã£o identifica o tipo pelo
                <code>package.json</code> (frontend) ou <code>manage.py</code>,
                <code>requirements.txt</code>,
                <code>pyproject.toml</code> (backend).
              </v-alert>

              <CodeBlock
                class="mt-3"
                :code="`fabroku verify\nfabroku verify --fix\nfabroku verify --dir ./meu-projeto --type frontend --fix`"
              />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- Listar Apps -->
    <section :id="'apps'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="purple">mdi-view-list</v-icon>
          Listar Apps
        </v-card-title>
        <v-card-text>
          <v-card variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku apps</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Lista todos os apps do usuÃ¡rio na plataforma em formato tabular.
              </p>
              <FlagTable :flags="appsFlags" />
              <CodeBlock
                class="mt-3"
                :code="`fabroku apps\nfabroku apps --project 42`"
              />

              <p class="mt-3 font-weight-medium">Status possÃ­veis:</p>
              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-chip
                  v-for="s in statusList"
                  :key="s.label"
                  :color="s.color"
                  size="small"
                >
                  {{ s.label }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- Deploy -->
    <section :id="'deploy'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-rocket-launch</v-icon>
          Deploy
        </v-card-title>
        <v-card-text>
          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku deploy</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Dispara o redeploy de um app. Comando principal da CLI.
              </p>
              <FlagTable :flags="deployFlags" />

              <v-divider class="my-4" />

              <p class="font-weight-medium mb-2">Fluxo de execuÃ§Ã£o:</p>
              <v-timeline class="mt-2" density="compact" side="end">
                <v-timeline-item
                  v-for="(step, i) in deploySteps"
                  :key="i"
                  :dot-color="step.color"
                  size="x-small"
                >
                  <span class="text-body-2">{{ step.text }}</span>
                </v-timeline-item>
              </v-timeline>

              <v-alert
                class="mt-3"
                density="compact"
                type="info"
                variant="tonal"
              >
                Se <code>--app</code> nÃ£o for especificado, a CLI detecta o app
                automaticamente comparando a URL do
                <code>git remote origin</code> com os apps registrados na
                plataforma.
              </v-alert>

              <CodeBlock
                class="mt-3"
                :code="`# Na raiz do repositÃ³rio (auto-detecta o app)\nfabroku deploy\n\n# Especificando o app\nfabroku deploy --app meu-app\n\n# Pular verificaÃ§Ã£o e nÃ£o aguardar\nfabroku deploy --skip-verify --no-wait\n\n# DiretÃ³rio especÃ­fico\nfabroku deploy --dir ./meu-projeto`"
              />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- Run -->
    <section :id="'run'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="teal">mdi-database-sync</v-icon>
          Importar e Exportar Dados
        </v-card-title>
        <v-card-text>
          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku run loaddata</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Envia um fixture JSON local para o backend e executa
                <code>loaddata</code> dentro do container do app Django.
              </p>
              <FlagTable :flags="runLoaddataFlags" />

              <v-alert
                class="mt-3"
                density="compact"
                type="info"
                variant="tonal"
              >
                Nesta versao, o fluxo e exclusivo para Django e exige a flag
                <code>--django</code>. O arquivo deve ser JSON UTF-8 e ter atÃ©
                <code>50 MB</code>.
              </v-alert>

              <CodeBlock
                class="mt-3"
                :code="`# Fixture na raiz do projeto\nfabroku run loaddata --django ./my_data.json\n\n# Especificando o app manualmente\nfabroku run loaddata --django ./my_data.json --app minha-api\n\n# manage.py fora da raiz do container\nfabroku run loaddata --django ./fixtures/users.json --dir ./backend --manage src/manage.py`"
              />
            </v-card-text>
          </v-card>

          <v-card variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku run dumpdata</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Executa <code>dumpdata</code> no app Django, gera o JSON no
                container e baixa o resultado para o caminho local informado em
                <code>--output</code>.
              </p>
              <FlagTable :flags="runDumpdataFlags" />

              <v-alert
                class="mt-3"
                density="compact"
                type="info"
                variant="tonal"
              >
                Os argumentos do Django devem vir depois de <code>--</code>,
                para nao conflitar com as flags da CLI. O arquivo de saida local
                e obrigatorio.
              </v-alert>

              <CodeBlock
                class="mt-3"
                :code="`# Dump completo para arquivo local\nfabroku run dumpdata --django --output ./dump.json\n\n# Com filtros e flags do Django apÃ³s --\nfabroku run dumpdata --django --output ./users.json -- --indent 2 auth.User\n\n# Usando app detectado por git remote e manage.py customizado\nfabroku run dumpdata --django --dir ./backend --manage src/manage.py --output ./backups/auth.json -- auth.User`"
              />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- Webhook -->
    <section :id="'webhook'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="orange">mdi-webhook</v-icon>
          Webhook
        </v-card-title>
        <v-card-text>
          <v-card variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku webhook [appId]</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Diagnostica e configura webhooks do GitHub para commit status.
              </p>
              <FlagTable :flags="webhookFlags" />

              <v-divider class="my-4" />

              <p class="font-weight-medium mb-2">DiagnÃ³sticos realizados:</p>
              <v-list density="compact">
                <v-list-item
                  v-for="check in webhookChecks"
                  :key="check.name"
                  :prepend-icon="'mdi-check-circle-outline'"
                >
                  <v-list-item-title>
                    <code>{{ check.name }}</code>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ check.desc }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <CodeBlock
                class="mt-3"
                :code="`# Listar apps disponÃ­veis\nfabroku webhook\n\n# Diagnosticar app\nfabroku webhook 15\n\n# Criar/recriar webhook\nfabroku webhook 15 --setup\n\n# Testar commit status\nfabroku webhook 15 --test\n\n# Tudo junto\nfabroku webhook 15 --setup --test`"
              />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- Workflow Completo -->
    <section :id="'workflow'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-map-marker-path</v-icon>
          Workflow Completo de Deploy
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            Passo a passo para fazer deploy de uma aplicaÃ§Ã£o do zero:
          </p>
          <v-timeline density="compact" side="end">
            <v-timeline-item
              v-for="(step, i) in workflowSteps"
              :key="i"
              :dot-color="step.color"
              size="small"
            >
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-2">
                  {{ step.title }}
                </v-card-title>
                <v-card-text>
                  <p class="text-body-2 mb-2">{{ step.desc }}</p>
                  <CodeBlock v-if="step.code" :code="step.code" />
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </section>

    <!-- ConfiguraÃ§Ã£o -->
    <section :id="'configuracao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="grey">mdi-cog</v-icon>
          Arquivo de ConfiguraÃ§Ã£o
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            A CLI armazena suas configuraÃ§Ãµes em
            <code>~/.fabroku/config.json</code>. Este arquivo Ã© criado
            automaticamente no primeiro uso.
          </p>
          <CodeBlock :code="configExample" />
          <v-alert
            class="mt-3"
            density="compact"
            type="warning"
            variant="tonal"
          >
            Nunca compartilhe o arquivo de configuraÃ§Ã£o â€” ele contÃ©m seu token
            de acesso.
          </v-alert>
        </v-card-text>
      </v-card>
    </section>

    <!-- Troubleshooting -->
    <section :id="'troubleshooting'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="error">mdi-lifebuoy</v-icon>
          Troubleshooting
        </v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Problema</th>
                <th>SoluÃ§Ã£o</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="issue in troubleshootingRows" :key="issue.problem">
                <td>
                  <code>{{ issue.problem }}</code>
                </td>
                <td>{{ issue.solution }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </section>

    <!-- Endpoints API -->
    <section :id="'api'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="cyan">mdi-api</v-icon>
          Endpoints da API
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            Endpoints consumidos internamente pela CLI (timeout de 15s,
            autenticaÃ§Ã£o via header <code>Authorization: CLI {token}</code>):
          </p>
          <v-table density="compact">
            <thead>
              <tr>
                <th>MÃ©todo</th>
                <th>Endpoint</th>
                <th>DescriÃ§Ã£o</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ep in apiEndpoints" :key="ep.endpoint">
                <td>
                  <v-chip
                    :color="ep.method === 'GET' ? 'success' : 'warning'"
                    size="x-small"
                  >
                    {{ ep.method }}
                  </v-chip>
                </td>
                <td>
                  <code>{{ ep.endpoint }}</code>
                </td>
                <td>{{ ep.desc }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </section>
  </v-container>
</template>

<script setup lang="ts">
  import { defineComponent, h } from 'vue'

  // ---- CodeBlock sub-component (inline) ----
  const CodeBlock = defineComponent({
    props: { code: { type: String, required: true } },
    setup (props) {
      return () =>
        h(
          'pre',
          {
            style: {
              background: '#0d1117',
              color: '#c9d1d9',
              padding: '14px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.6',
              overflowX: 'auto',
              fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
              border: '1px solid rgba(255,255,255,0.06)',
            },
          },
          h('code', null, props.code),
        )
    },
  })

  // ---- FlagTable sub-component (inline) ----
  const FlagTable = defineComponent({
    props: {
      flags: {
        type: Array as () => { flag: string, desc: string, default?: string }[],
        required: true,
      },
    },
    setup (props) {
      return () =>
        h(
          'table',
          {
            class: 'flag-table',
            style: {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '8px',
            },
          },
          [
            h('thead', null, [
              h('tr', null, [
                h('th', { style: thStyle }, 'Flag'),
                h('th', { style: thStyle }, 'DescriÃ§Ã£o'),
                ...(props.flags.some(f => f.default)
                  ? [h('th', { style: thStyle }, 'PadrÃ£o')]
                  : []),
              ]),
            ]),
            h(
              'tbody',
              null,
              props.flags.map(f =>
                h('tr', null, [
                  h('td', { style: tdStyle }, h('code', null, f.flag)),
                  h('td', { style: tdStyle }, f.desc),
                  ...(props.flags.some(ff => ff.default)
                    ? [h('td', { style: tdStyle }, f.default || 'â€”')]
                    : []),
                ]),
              ),
            ),
          ],
        )
    },
  })

  const thStyle = {
    textAlign: 'left' as const,
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    fontSize: '13px',
    color: '#8b949e',
  }
  const tdStyle = {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '13px',
  }

  // ---- Data ----
  const navSections = [
    { id: 'instalacao', label: 'InstalaÃ§Ã£o', icon: 'mdi-download' },
    { id: 'autenticacao', label: 'AutenticaÃ§Ã£o', icon: 'mdi-shield-key' },
    { id: 'verificacao', label: 'VerificaÃ§Ã£o', icon: 'mdi-file-check' },
    { id: 'apps', label: 'Apps', icon: 'mdi-view-list' },
    { id: 'deploy', label: 'Deploy', icon: 'mdi-rocket-launch' },
    { id: 'run', label: 'Run', icon: 'mdi-database-sync' },
    { id: 'webhook', label: 'Webhook', icon: 'mdi-webhook' },
    { id: 'workflow', label: 'Workflow', icon: 'mdi-map-marker-path' },
    { id: 'configuracao', label: 'ConfiguraÃ§Ã£o', icon: 'mdi-cog' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: 'mdi-lifebuoy' },
    { id: 'api', label: 'API', icon: 'mdi-api' },
  ]

  const loginFlags = [
    {
      flag: '--api-url <url>',
      desc: 'URL base da API Fabroku (sobrescreve o padrÃ£o)',
    },
  ]

  const loginSteps = [
    { text: 'Verifica se jÃ¡ existe sessÃ£o ativa', color: 'grey' },
    { text: 'Busca uma porta livre e abre o navegador', color: 'info' },
    { text: 'Servidor HTTP local aguarda callback OAuth', color: 'warning' },
    {
      text: 'Recebe o token e salva em ~/.fabroku/config.json',
      color: 'success',
    },
    { text: 'Timeout de 2 minutos se nÃ£o receber callback', color: 'error' },
  ]

  const whoamiExample = `fabroku whoami
# Logado como: fulano
#    API: https://fabroku-api.fabricadesoftware.ifc.edu.br
#    Email: fulano@ifc.edu.br
# Membro da Fabrica
# Token valido`

  const verifyFlags = [
    {
      flag: '-d, --dir <path>',
      desc: 'DiretÃ³rio do projeto',
      default: '. (atual)',
    },
    {
      flag: '-t, --type <type>',
      desc: 'ForÃ§ar tipo: frontend ou backend',
      default: 'auto-detecta',
    },
    {
      flag: '--fix',
      desc: 'Gerar arquivos faltantes automaticamente',
      default: 'false',
    },
  ]

  const frontendFiles = [
    { name: '.buildpacks', desc: 'Buildpacks Node.js + Nginx' },
    { name: '.static', desc: 'Marcador de aplicaÃ§Ã£o estÃ¡tica' },
    { name: 'static.json', desc: 'ConfiguraÃ§Ã£o SPA (rotas, cache, root)' },
  ]

  const backendFiles = [
    { name: 'Procfile', desc: 'Comando de execuÃ§Ã£o do servidor' },
    { name: 'requirements.txt', desc: 'DependÃªncias Python' },
    { name: 'runtime.txt', desc: 'VersÃ£o do Python' },
  ]

  const appsFlags = [
    { flag: '-p, --project <id>', desc: 'Filtrar por ID do projeto' },
  ]

  const statusList = [
    { label: 'RUNNING', color: 'success' },
    { label: 'STOPPED', color: 'error' },
    { label: 'ERROR', color: 'error' },
    { label: 'STARTING', color: 'warning' },
    { label: 'DEPLOYING', color: 'info' },
    { label: 'DELETING', color: 'pink' },
    { label: 'RESTARTING', color: 'info' },
  ]

  const deployFlags = [
    {
      flag: '-a, --app <name>',
      desc: 'Nome ou ID do app',
      default: 'auto-detecta via git',
    },
    {
      flag: '-d, --dir <path>',
      desc: 'DiretÃ³rio do projeto',
      default: '. (atual)',
    },
    {
      flag: '--skip-verify',
      desc: 'Pular verificaÃ§Ã£o de arquivos',
      default: 'false',
    },
    {
      flag: '--no-wait',
      desc: 'NÃ£o aguardar o deploy terminar',
      default: 'false',
    },
  ]

  const deploySteps = [
    { text: 'Verifica autenticaÃ§Ã£o', color: 'grey' },
    { text: 'Identifica o app (por nome, ID ou git remote)', color: 'info' },
    { text: 'Roda fabroku verify (se nÃ£o --skip-verify)', color: 'warning' },
    { text: 'Dispara redeploy via API', color: 'primary' },
    { text: 'Polling de progresso com barra em tempo real', color: 'success' },
    { text: 'Exibe resultado: URL do domÃ­nio ou erro', color: 'success' },
  ]

  const runLoaddataFlags = [
    {
      flag: '--django',
      desc: 'Ativa o fluxo Django para loaddata',
      default: 'obrigatorio',
    },
    {
      flag: '-a, --app <name>',
      desc: 'Nome ou ID do app',
      default: 'auto-detecta via git',
    },
    {
      flag: '-d, --dir <path>',
      desc: 'Diretorio local usado para detectar o app',
      default: '. (atual)',
    },
    {
      flag: '--manage <path>',
      desc: 'Caminho relativo do manage.py dentro do app',
      default: 'manage.py',
    },
  ]

  const runDumpdataFlags = [
    {
      flag: '--django',
      desc: 'Ativa o fluxo Django para dumpdata',
      default: 'obrigatorio',
    },
    {
      flag: '-o, --output <path>',
      desc: 'Arquivo JSON local onde o dump sera salvo',
      default: 'obrigatorio',
    },
    {
      flag: '-a, --app <name>',
      desc: 'Nome ou ID do app',
      default: 'auto-detecta via git',
    },
    {
      flag: '-d, --dir <path>',
      desc: 'Diretorio local usado para detectar o app',
      default: '. (atual)',
    },
    {
      flag: '--manage <path>',
      desc: 'Caminho relativo do manage.py dentro do app',
      default: 'manage.py',
    },
    {
      flag: '-- [args]',
      desc: 'Argumentos repassados diretamente ao Django dumpdata',
    },
  ]

  const webhookFlags = [
    { flag: '--setup', desc: 'Criar/recriar o webhook automaticamente' },
    { flag: '--test', desc: 'Testar se commit status funciona' },
  ]

  const webhookChecks = [
    {
      name: 'backend_url_public',
      desc: 'URL do backend Ã© pÃºblica (nÃ£o localhost)',
    },
    { name: 'user_git_token', desc: 'Token GitHub do usuÃ¡rio Ã© vÃ¡lido' },
    {
      name: 'project_git_token',
      desc: 'Pelo menos 1 membro do projeto tem token GitHub',
    },
    { name: 'git_url_parseable', desc: 'URL git do app Ã© vÃ¡lida' },
    { name: 'webhook_exists', desc: 'Webhook existe no repositÃ³rio GitHub' },
    { name: 'last_commit', desc: 'Ãšltimo commit detectado no repositÃ³rio' },
  ]

  const workflowSteps = [
    {
      title: '1. Instalar a CLI',
      desc: 'Instale globalmente via npm.',
      code: 'npm i -g fabroku',
      color: 'grey',
    },
    {
      title: '2. Autenticar',
      desc: 'FaÃ§a login com sua conta GitHub.',
      code: 'fabroku login',
      color: 'warning',
    },
    {
      title: '3. Acessar o projeto',
      desc: 'Navegue atÃ© o diretÃ³rio do seu projeto.',
      code: 'cd meu-projeto',
      color: 'info',
    },
    {
      title: '4. Verificar arquivos',
      desc: 'Verifique e gere os arquivos necessÃ¡rios para deploy.',
      code: 'fabroku verify --fix',
      color: 'info',
    },
    {
      title: '5. Commitar e push',
      desc: 'Envie as alteraÃ§Ãµes para o GitHub.',
      code: 'git add . && git commit -m "prepare deploy"\ngit push origin main',
      color: 'primary',
    },
    {
      title: '6. Fazer deploy',
      desc: 'Dispare o deploy e acompanhe o progresso.',
      code: 'fabroku deploy',
      color: 'success',
    },
    {
      title: '7. Configurar webhook (opcional)',
      desc: 'Se precisar de commit status no GitHub.',
      code: 'fabroku webhook <appId> --setup',
      color: 'orange',
    },
  ]

  const configExample = `{
  "api_url": "https://fabroku-api.fabricadesoftware.ifc.edu.br",
  "token": "ghp_...",
  "user": "seu-usuario"
}`

  const _troubleshooting = [
    { problem: 'Nao autenticado', solution: 'Execute fabroku login' },
    {
      problem: 'Token expirado ou invalido',
      solution: 'Execute fabroku login novamente',
    },
    {
      problem: 'Timeout na autenticacao (2min)',
      solution: 'Verifique se o browser abriu e tente novamente',
    },
    {
      problem: 'Tipo de projeto nao detectado',
      solution: 'Use --type frontend ou --type backend',
    },
    {
      problem: 'Arquivos faltando para deploy',
      solution: 'Use fabroku verify --fix',
    },
    {
      problem: 'Fixture JSON invalido ou maior que 50 MB',
      solution: 'Revise o arquivo e reduza o tamanho antes de usar fabroku run loaddata',
    },
    {
      problem: 'dumpdata sem --output',
      solution: 'Informe um caminho local com --output ./arquivo.json',
    },
    {
      problem: 'requirements.txt faltando',
      solution: 'Crie manualmente: pip freeze > requirements.txt',
    },
    {
      problem: 'Nenhum app encontrado',
      solution: 'Verifique git remote -v ou use --app <nome>',
    },
    {
      problem: 'HTTP 409 no deploy',
      solution: 'Deploy jÃ¡ em andamento, aguarde',
    },
    {
      problem: 'Webhook nÃ£o funciona',
      solution: 'Use fabroku webhook <id> --test para diagnosticar',
    },
    {
      problem: 'Deploy timeout (10min)',
      solution: 'Verifique os logs no painel web',
    },
  ]

  const _endpoints = [
    {
      method: 'GET',
      endpoint: '/api/auth/check/',
      desc: 'Verifica autenticaÃ§Ã£o',
    },
    {
      method: 'GET',
      endpoint: '/api/auth/users/me/',
      desc: 'Dados do usuÃ¡rio logado',
    },
    { method: 'GET', endpoint: '/api/apps/apps/', desc: 'Lista apps' },
    {
      method: 'GET',
      endpoint: '/api/projects/projects/',
      desc: 'Lista projetos',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/redeploy/',
      desc: 'Dispara redeploy',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/get_app_status/',
      desc: 'Status/progresso do deploy',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/run_loaddata/',
      desc: 'Upload do fixture e execuÃƒÂ§ÃƒÂ£o do loaddata',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/run_dumpdata/',
      desc: 'ExecuÃƒÂ§ÃƒÂ£o do dumpdata com geraÃƒÂ§ÃƒÂ£o de artefato',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/artifacts/{artifact_id}/download/',
      desc: 'Download do dump gerado pela CLI',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/diagnose_webhook/',
      desc: 'DiagnÃ³stico de webhook',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/setup_webhook/',
      desc: 'Criar/recriar webhook',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/test_commit_status/',
      desc: 'Testar commit status',
    },
  ]

  const troubleshootingRows = [
    { problem: 'Nao autenticado', solution: 'Execute fabroku login' },
    {
      problem: 'Token expirado ou invalido',
      solution: 'Execute fabroku login novamente',
    },
    {
      problem: 'Timeout na autenticacao (2min)',
      solution: 'Verifique se o browser abriu e tente novamente',
    },
    {
      problem: 'Tipo de projeto nao detectado',
      solution: 'Use --type frontend ou --type backend',
    },
    {
      problem: 'Arquivos faltando para deploy',
      solution: 'Use fabroku verify --fix',
    },
    {
      problem: 'Fixture JSON invalido ou maior que 50 MB',
      solution: 'Revise o arquivo e reduza o tamanho antes de usar fabroku run loaddata',
    },
    {
      problem: 'dumpdata sem --output',
      solution: 'Informe um caminho local com --output ./arquivo.json',
    },
    {
      problem: 'requirements.txt faltando',
      solution: 'Crie manualmente: pip freeze > requirements.txt',
    },
    {
      problem: 'Nenhum app encontrado',
      solution: 'Verifique git remote -v ou use --app <nome>',
    },
    {
      problem: 'HTTP 409 no deploy',
      solution: 'Deploy ja em andamento, aguarde',
    },
    {
      problem: 'Webhook nao funciona',
      solution: 'Use fabroku webhook <id> --test para diagnosticar',
    },
    {
      problem: 'Deploy timeout (10min)',
      solution: 'Verifique os logs no painel web',
    },
  ]

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/auth/check/',
      desc: 'Verifica autenticacao',
    },
    {
      method: 'GET',
      endpoint: '/api/auth/users/me/',
      desc: 'Dados do usuario logado',
    },
    { method: 'GET', endpoint: '/api/apps/apps/', desc: 'Lista apps' },
    {
      method: 'GET',
      endpoint: '/api/projects/projects/',
      desc: 'Lista projetos',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/redeploy/',
      desc: 'Dispara redeploy',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/get_app_status/',
      desc: 'Status e progresso do deploy',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/run_loaddata/',
      desc: 'Upload do fixture e execucao do loaddata',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/run_dumpdata/',
      desc: 'Execucao do dumpdata com geracao de artefato',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/artifacts/{artifact_id}/download/',
      desc: 'Download do dump gerado pela CLI',
    },
    {
      method: 'GET',
      endpoint: '/api/apps/apps/{id}/diagnose_webhook/',
      desc: 'Diagnostico de webhook',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/setup_webhook/',
      desc: 'Criar ou recriar webhook',
    },
    {
      method: 'POST',
      endpoint: '/api/apps/apps/{id}/test_commit_status/',
      desc: 'Testar commit status',
    },
  ]

  function scrollTo (id: string) {
    document
      .querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<style scoped lang="scss">
.documentation {
  max-width: 900px;
  margin: 0 auto;

  code {
    background: rgba(110, 118, 129, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  }
}
</style>
