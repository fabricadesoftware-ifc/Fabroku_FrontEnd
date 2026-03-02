<template>
  <v-container class="documentation py-6" fluid>
    <!-- Header -->
    <div class="text-center mb-8">
      <v-icon class="mb-3" color="primary" size="56">mdi-console</v-icon>
      <h1 class="text-h3 font-weight-bold">Fabroku CLI</h1>
      <p class="text-grey mt-2" style="max-width: 600px; margin: 0 auto">
        Documentação completa da ferramenta de linha de comando para gerenciar
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

    <!-- Navegação rápida -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" size="20">mdi-compass</v-icon>
        Navegação rápida
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

    <!-- Instalação -->
    <section :id="'instalacao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-download</v-icon>
          Instalação
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

    <!-- Autenticação -->
    <section :id="'autenticacao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="warning">mdi-shield-key</v-icon>
          Autenticação
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            A CLI utiliza autenticação via <strong>GitHub OAuth</strong>. O
            login abre o navegador automaticamente e recebe o token via
            callback.
          </p>

          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku login</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-2">Autentica o usuário via GitHub OAuth.</p>
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
              <p>Encerra a sessão, limpando o token e dados do usuário.</p>
              <CodeBlock class="mt-2" code="fabroku logout" />
            </v-card-text>
          </v-card>

          <v-card variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku whoami</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-2">
                Exibe informações do usuário autenticado e verifica se o token é
                válido.
              </p>
              <CodeBlock :code="whoamiExample" />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </section>

    <!-- Verificação de Arquivos -->
    <section :id="'verificacao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="info">mdi-file-check</v-icon>
          Verificação de Arquivos
        </v-card-title>
        <v-card-text>
          <v-card class="mb-4" variant="tonal">
            <v-card-title class="text-subtitle-1">
              <code>fabroku verify</code>
            </v-card-title>
            <v-card-text>
              <p class="mb-3">
                Verifica se o projeto contém os arquivos necessários para deploy
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
                A auto-detecção identifica o tipo pelo
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
                Lista todos os apps do usuário na plataforma em formato tabular.
              </p>
              <FlagTable :flags="appsFlags" />
              <CodeBlock
                class="mt-3"
                :code="`fabroku apps\nfabroku apps --project 42`"
              />

              <p class="mt-3 font-weight-medium">Status possíveis:</p>
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

              <p class="font-weight-medium mb-2">Fluxo de execução:</p>
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
                Se <code>--app</code> não for especificado, a CLI detecta o app
                automaticamente comparando a URL do
                <code>git remote origin</code> com os apps registrados na
                plataforma.
              </v-alert>

              <CodeBlock
                class="mt-3"
                :code="`# Na raiz do repositório (auto-detecta o app)\nfabroku deploy\n\n# Especificando o app\nfabroku deploy --app meu-app\n\n# Pular verificação e não aguardar\nfabroku deploy --skip-verify --no-wait\n\n# Diretório específico\nfabroku deploy --dir ./meu-projeto`"
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

              <p class="font-weight-medium mb-2">Diagnósticos realizados:</p>
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
                :code="`# Listar apps disponíveis\nfabroku webhook\n\n# Diagnosticar app\nfabroku webhook 15\n\n# Criar/recriar webhook\nfabroku webhook 15 --setup\n\n# Testar commit status\nfabroku webhook 15 --test\n\n# Tudo junto\nfabroku webhook 15 --setup --test`"
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
            Passo a passo para fazer deploy de uma aplicação do zero:
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

    <!-- Configuração -->
    <section :id="'configuracao'" class="mb-6">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="grey">mdi-cog</v-icon>
          Arquivo de Configuração
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            A CLI armazena suas configurações em
            <code>~/.fabroku/config.json</code>. Este arquivo é criado
            automaticamente no primeiro uso.
          </p>
          <CodeBlock :code="configExample" />
          <v-alert
            class="mt-3"
            density="compact"
            type="warning"
            variant="tonal"
          >
            Nunca compartilhe o arquivo de configuração — ele contém seu token
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
                <th>Solução</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="issue in troubleshooting" :key="issue.problem">
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
            autenticação via header <code>Authorization: CLI {token}</code>):
          </p>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Método</th>
                <th>Endpoint</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ep in endpoints" :key="ep.endpoint">
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
                h('th', { style: thStyle }, 'Descrição'),
                ...(props.flags.some(f => f.default)
                  ? [h('th', { style: thStyle }, 'Padrão')]
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
                    ? [h('td', { style: tdStyle }, f.default || '—')]
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
    { id: 'instalacao', label: 'Instalação', icon: 'mdi-download' },
    { id: 'autenticacao', label: 'Autenticação', icon: 'mdi-shield-key' },
    { id: 'verificacao', label: 'Verificação', icon: 'mdi-file-check' },
    { id: 'apps', label: 'Apps', icon: 'mdi-view-list' },
    { id: 'deploy', label: 'Deploy', icon: 'mdi-rocket-launch' },
    { id: 'webhook', label: 'Webhook', icon: 'mdi-webhook' },
    { id: 'workflow', label: 'Workflow', icon: 'mdi-map-marker-path' },
    { id: 'configuracao', label: 'Configuração', icon: 'mdi-cog' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: 'mdi-lifebuoy' },
    { id: 'api', label: 'API', icon: 'mdi-api' },
  ]

  const loginFlags = [
    {
      flag: '--api-url <url>',
      desc: 'URL base da API Fabroku (sobrescreve o padrão)',
    },
  ]

  const loginSteps = [
    { text: 'Verifica se já existe sessão ativa', color: 'grey' },
    { text: 'Busca uma porta livre e abre o navegador', color: 'info' },
    { text: 'Servidor HTTP local aguarda callback OAuth', color: 'warning' },
    {
      text: 'Recebe o token e salva em ~/.fabroku/config.json',
      color: 'success',
    },
    { text: 'Timeout de 2 minutos se não receber callback', color: 'error' },
  ]

  const whoamiExample = `fabroku whoami
# 👤 Logado como: fulano
#    API: https://fabroku-api.fabricadesoftware.ifc.edu.br
#    Email: fulano@ifc.edu.br
#    🏭 Membro da Fábrica
#    ✅ Token válido`

  const verifyFlags = [
    {
      flag: '-d, --dir <path>',
      desc: 'Diretório do projeto',
      default: '. (atual)',
    },
    {
      flag: '-t, --type <type>',
      desc: 'Forçar tipo: frontend ou backend',
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
    { name: '.static', desc: 'Marcador de aplicação estática' },
    { name: 'static.json', desc: 'Configuração SPA (rotas, cache, root)' },
  ]

  const backendFiles = [
    { name: 'Procfile', desc: 'Comando de execução do servidor' },
    { name: 'requirements.txt', desc: 'Dependências Python' },
    { name: 'runtime.txt', desc: 'Versão do Python' },
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
      desc: 'Diretório do projeto',
      default: '. (atual)',
    },
    {
      flag: '--skip-verify',
      desc: 'Pular verificação de arquivos',
      default: 'false',
    },
    {
      flag: '--no-wait',
      desc: 'Não aguardar o deploy terminar',
      default: 'false',
    },
  ]

  const deploySteps = [
    { text: 'Verifica autenticação', color: 'grey' },
    { text: 'Identifica o app (por nome, ID ou git remote)', color: 'info' },
    { text: 'Roda fabroku verify (se não --skip-verify)', color: 'warning' },
    { text: 'Dispara redeploy via API', color: 'primary' },
    { text: 'Polling de progresso com barra em tempo real', color: 'success' },
    { text: 'Exibe resultado: URL do domínio ou erro', color: 'success' },
  ]

  const webhookFlags = [
    { flag: '--setup', desc: 'Criar/recriar o webhook automaticamente' },
    { flag: '--test', desc: 'Testar se commit status funciona' },
  ]

  const webhookChecks = [
    {
      name: 'backend_url_public',
      desc: 'URL do backend é pública (não localhost)',
    },
    { name: 'user_git_token', desc: 'Token GitHub do usuário é válido' },
    {
      name: 'project_git_token',
      desc: 'Pelo menos 1 membro do projeto tem token GitHub',
    },
    { name: 'git_url_parseable', desc: 'URL git do app é válida' },
    { name: 'webhook_exists', desc: 'Webhook existe no repositório GitHub' },
    { name: 'last_commit', desc: 'Último commit detectado no repositório' },
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
      desc: 'Faça login com sua conta GitHub.',
      code: 'fabroku login',
      color: 'warning',
    },
    {
      title: '3. Acessar o projeto',
      desc: 'Navegue até o diretório do seu projeto.',
      code: 'cd meu-projeto',
      color: 'info',
    },
    {
      title: '4. Verificar arquivos',
      desc: 'Verifique e gere os arquivos necessários para deploy.',
      code: 'fabroku verify --fix',
      color: 'info',
    },
    {
      title: '5. Commitar e push',
      desc: 'Envie as alterações para o GitHub.',
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

  const troubleshooting = [
    { problem: '❌ Não autenticado', solution: 'Execute fabroku login' },
    {
      problem: '❌ Token expirado ou inválido',
      solution: 'Execute fabroku login novamente',
    },
    {
      problem: '❌ Timeout na autenticação (2min)',
      solution: 'Verifique se o browser abriu e tente novamente',
    },
    {
      problem: '⚠️ Tipo de projeto não detectado',
      solution: 'Use --type frontend ou --type backend',
    },
    {
      problem: '❌ Arquivos faltando para deploy',
      solution: 'Use fabroku verify --fix',
    },
    {
      problem: 'requirements.txt faltando',
      solution: 'Crie manualmente: pip freeze > requirements.txt',
    },
    {
      problem: '❌ Nenhum app encontrado',
      solution: 'Verifique git remote -v ou use --app <nome>',
    },
    {
      problem: 'HTTP 409 no deploy',
      solution: 'Deploy já em andamento, aguarde',
    },
    {
      problem: 'Webhook não funciona',
      solution: 'Use fabroku webhook <id> --test para diagnosticar',
    },
    {
      problem: 'Deploy timeout (10min)',
      solution: 'Verifique os logs no painel web',
    },
  ]

  const endpoints = [
    {
      method: 'GET',
      endpoint: '/api/auth/check/',
      desc: 'Verifica autenticação',
    },
    {
      method: 'GET',
      endpoint: '/api/auth/users/me/',
      desc: 'Dados do usuário logado',
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
      endpoint: '/api/apps/apps/{id}/diagnose_webhook/',
      desc: 'Diagnóstico de webhook',
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
