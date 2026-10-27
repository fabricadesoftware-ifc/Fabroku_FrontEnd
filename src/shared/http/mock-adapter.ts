/**
 * Adapter axios de demonstração (somente com `npm run dev:mock`).
 * Responde todas as rotas usadas pelo frontend com dados fictícios,
 * permitindo validar as telas e a responsividade sem o backend.
 */
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'

const now = new Date().toISOString()
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString()

const me = {
  id: 1,
  username: 'danielhinsching',
  email: 'daniel@exemplo.com',
  name: 'Daniel Hinsching',
  avatar_url: null,
  is_superuser: true,
  is_fabric: true,
  is_active: true,
  date_joined: ago(60 * 24 * 90),
  last_login: ago(5),
  max_apps: 10,
  max_services: 10,
  apps_count: 3,
  services_count: 2,
}

const users = [
  me,
  { ...me, id: 2, username: 'maria', email: 'maria@exemplo.com', name: 'Maria Souza', is_superuser: false, apps_count: 2, services_count: 1 },
  { ...me, id: 3, username: 'joao', email: 'joao@exemplo.com', name: 'João Pereira', is_superuser: false, is_active: false, apps_count: 0, services_count: 0 },
]

const projectUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, avatar_url: null }))

const projects = [
  { id: 'p1', name: 'Portal do Aluno', users: [1, 2], users_detail: projectUsers.slice(0, 2), created_at: ago(60 * 24 * 30), updated_at: ago(60), is_owner: true },
  { id: 'p2', name: 'Sistema de Estágios', users: [1, 3], users_detail: [projectUsers[0], projectUsers[2]], created_at: ago(60 * 24 * 12), updated_at: ago(300), is_owner: true },
  { id: 'p3', name: 'Feira de Ciências', users: [2], users_detail: [projectUsers[1]], created_at: ago(60 * 24 * 3), updated_at: ago(900), is_owner: false },
]

const services = [
  { id: 1, name: 'portal-db', service_type: 'postgres', app: 1, project: 'p1', container_name: 'dokku.postgres.portal-db', env_key: 'DATABASE_URL', image: 'postgres', image_version: '16', host: 'dokku-postgres-portal-db', port: 5432, created_at: ago(5000), updated_at: ago(100) },
  { id: 2, name: 'portal-cache', service_type: 'redis', app: null, project: 'p1', container_name: 'dokku.redis.portal-cache', env_key: 'REDIS_URL', image: 'redis', image_version: '7', host: 'dokku-redis-portal-cache', port: 6379, created_at: ago(4000), updated_at: ago(100) },
  { id: 3, name: 'estagios-db', service_type: 'postgis', app: 3, project: 'p2', container_name: 'dokku.postgis.estagios-db', env_key: 'DATABASE_URL', image: 'postgis/postgis', image_version: '16', host: 'dokku-postgis-estagios-db', port: 5432, created_at: ago(3000), updated_at: ago(100) },
]

const apps = [
  { id: 1, name: 'portal-api', git: 'https://github.com/exemplo/portal-api', branch: 'main', project: 'p1', created_at: ago(60 * 24 * 20), updated_at: ago(30), status: 'RUNNING', domain: 'portal-api.exemplo.com.br', port: 5000, variables: { DEBUG: 'false', SECRET_KEY: '••••••••', ALLOWED_HOSTS: '*' }, task_id: null, name_dokku: 'portal-api', is_owner: true, services: [services[0]], last_commit_sha: 'a1b2c3d4e5f6' },
  { id: 2, name: 'portal-web', git: 'https://github.com/exemplo/portal-web', branch: 'main', project: 'p1', created_at: ago(60 * 24 * 18), updated_at: ago(120), status: 'STOPPED', domain: 'portal.exemplo.com.br', port: 3000, variables: { VITE_API: 'https://portal-api.exemplo.com.br' }, task_id: null, name_dokku: 'portal-web', is_owner: true, services: [], last_commit_sha: 'f6e5d4c3b2a1' },
  { id: 3, name: 'estagios-api', git: 'https://github.com/exemplo/estagios-api', branch: 'develop', project: 'p2', created_at: ago(60 * 24 * 9), updated_at: ago(15), status: 'DEPLOYING', domain: null, port: null, variables: {}, task_id: 'task-demo', name_dokku: 'estagios-api', is_owner: true, services: [services[2]], last_commit_sha: '0123456789ab' },
  { id: 4, name: 'feira-site', git: 'https://github.com/exemplo/feira-site', branch: 'main', project: 'p3', created_at: ago(60 * 24 * 2), updated_at: ago(600), status: 'FAILED', domain: null, port: null, variables: {}, task_id: null, name_dokku: 'feira-site', is_owner: false, services: [], last_commit_sha: 'abcdef012345' },
]

const logLevels = ['INFO', 'SUCCESS', 'DOKKU', 'WARNING', 'ERROR', 'DEBUG']
const logCategories = ['DEPLOY', 'SYSTEM', 'GIT', 'CONFIG', 'DATABASE', 'DOMAIN', 'SSL', 'CREATE']
const logs = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  app: (i % 4) + 1,
  task_id: 'task-demo',
  message: ['Clonando repositório...', 'Build iniciado', 'Instalando dependências', 'Configurando domínio', 'Certificado SSL emitido', 'Aplicação iniciada'][i % 6],
  level: logLevels[i % logLevels.length],
  category: logCategories[i % logCategories.length],
  metadata: {},
  progress: Math.min(100, (i + 1) * 4),
  created_at: ago(60 - i * 2),
}))

const page = <T>(results: T[]) => ({ count: results.length, next: null, previous: null, results })

type Handler = (config: InternalAxiosRequestConfig, match: RegExpMatchArray) => unknown

const routes: Array<[string, RegExp, Handler]> = [
  ['GET', /^\/auth\/check\/$/, () => ({ user: me })],
  ['GET', /^\/auth\/users\/me\/$/, () => me],
  ['POST', /^\/auth\/logout\/$/, () => ({})],
  ['GET', /^\/auth\/users\/admin_list\/$/, () => users],
  ['GET', /^\/auth\/users\/my_quota\/$/, () => ({ max_apps: 10, max_services: 10, apps_count: 3, services_count: 2, can_create_app: true, can_create_service: true })],
  ['GET', /^\/auth\/users\/$/, () => page(users)],
  ['GET', /^\/auth\/users\/(\d+)\/$/, (_c, m) => users.find(u => u.id === Number(m[1])) ?? me],
  ['POST', /^\/auth\/users\/(\d+)\/(toggle_active|toggle_admin|set_quota)\/$/, (_c, m) => users.find(u => u.id === Number(m[1])) ?? me],
  ['GET', /^\/platform\/config\/$/, () => ({ organization_name: 'Fábrica de Software', privileged_role_label: 'Fabric', regular_role_label: 'Aluno', app_domain_suffix: 'exemplo.com.br' })],
  ['GET', /^\/projects\/projects\/$/, () => page(projects)],
  ['GET', /^\/projects\/projects\/([\w-]+)\/$/, (_c, m) => projects.find(p => p.id === m[1]) ?? projects[0]],
  ['POST', /^\/projects\/projects\/$/, c => ({ ...projects[0], ...JSON.parse(c.data ?? '{}'), id: 'p-new' })],
  ['PATCH', /^\/projects\/projects\/([\w-]+)\/$/, (_c, m) => projects.find(p => p.id === m[1]) ?? projects[0]],
  ['DELETE', /^\/projects\/projects\/([\w-]+)\/$/, () => ({})],
  ['GET', /^\/apps\/apps\/check_name\/$/, c => ({ available: true, name: c.params?.name })],
  ['GET', /^\/apps\/apps\/$/, c => page(c.params?.project ? apps.filter(a => a.project === c.params.project) : apps)],
  ['POST', /^\/apps\/apps\/$/, c => ({ ...apps[0], ...JSON.parse(c.data ?? '{}'), id: 99, task_id: 'task-demo', status: 'DEPLOYING' })],
  ['GET', /^\/apps\/apps\/(\d+)\/$/, (_c, m) => apps.find(a => a.id === Number(m[1])) ?? apps[0]],
  ['PUT', /^\/apps\/apps\/(\d+)\/$/, (_c, m) => apps.find(a => a.id === Number(m[1])) ?? apps[0]],
  ['PATCH', /^\/apps\/apps\/(\d+)\/$/, (_c, m) => apps.find(a => a.id === Number(m[1])) ?? apps[0]],
  ['DELETE', /^\/apps\/apps\/(\d+)\/$/, () => ({ status: 'accepted', message: 'Remoção agendada', task_id: 'task-demo' })],
  ['PATCH', /^\/apps\/apps\/(\d+)\/env_vars\/$/, (_c, m) => ({ app: apps.find(a => a.id === Number(m[1])) ?? apps[0], updated_keys: [], removed_keys: [], restarted: true })],
  ['GET', /^\/apps\/apps\/(\d+)\/get_app_status\/$/, () => ({ task_id: 'task-demo', state: 'SUCCESS', current: 100, total: 100, status: 'Concluído' })],
  ['POST', /^\/apps\/apps\/(\d+)\/(start|stop|restart)\/$/, (_c, m) => apps.find(a => a.id === Number(m[1])) ?? apps[0]],
  ['GET', /^\/apps\/apps\/(\d+)\/processes\/$/, () => ({ max_instances: 5, processes: [{ id: 1, process_name: 'web', quantity: 1, desired_quantity: 1, current_quantity: 1 }, { id: 2, process_name: 'worker', quantity: 2, desired_quantity: 2, current_quantity: 2 }] })],
  ['POST', /^\/apps\/apps\/(\d+)\/(scale_processes|redeploy|run_command)\/$/, () => ({ status: 'accepted', message: 'Tarefa enfileirada', task_id: 'task-demo' })],
  ['GET', /^\/apps\/apps\/(\d+)\/allowed_commands\/$/, () => ({ commands: ['python manage.py migrate', 'python manage.py createsuperuser'], prefixes: ['python manage.py'] })],
  ['GET', /^\/apps\/apps\/(\d+)\/last_commit\/$/, () => ({ sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678', sha_short: 'a1b2c3d', message: 'feat: nova tela de dashboard', author: 'Daniel Hinsching', date: ago(45), url: 'https://github.com/exemplo/portal-api/commit/a1b2c3d' })],
  ['GET', /^\/apps\/services\/$/, c => page(c.params?.project ? services.filter(s => String(s.project) === String(c.params.project)) : services)],
  ['POST', /^\/apps\/services\/$/, c => ({ ...services[0], ...JSON.parse(c.data ?? '{}'), id: 99, task_id: 'task-demo' })],
  ['GET', /^\/apps\/services\/(\d+)\/get_service_status\/$/, () => ({ task_id: 'task-demo', state: 'SUCCESS', current: 100, total: 100, status: 'Concluído' })],
  ['POST', /^\/apps\/services\/(\d+)\/(link|unlink)\/$/, (_c, m) => services.find(s => s.id === Number(m[1])) ?? services[0]],
  ['DELETE', /^\/apps\/services\/(\d+)\/$/, () => ({})],
  ['GET', /^\/logs\/$/, c => page(c.params?.app ? logs.filter(l => l.app === Number(c.params.app)) : logs)],
  ['GET', /^\/logs\/stream\/[\w-]+\/$/, () => ({ logs: logs.slice(0, 8) })],
  ['GET', /^\/logs\/app-runtime\/$/, () => ({ lines: Array.from({ length: 30 }, (_, i) => `[${ago(30 - i)}] GET /api/health 200 ${10 + i}ms`) })],
  ['GET', /^\/logs\/(\d+)\/$/, (_c, m) => logs.find(l => l.id === Number(m[1])) ?? logs[0]],
  ['GET', /^\/git\/branches$/, () => ['main', 'develop', 'feature/nova-home']],
  ['GET', /^\/git\/repos$/, () => [
    { id: 1, name: 'portal-api', full_name: 'exemplo/portal-api', html_url: 'https://github.com/exemplo/portal-api', description: 'API do portal', private: true, default_branch: 'main', clone_url: 'https://github.com/exemplo/portal-api.git', ssh_url: 'git@github.com:exemplo/portal-api.git' },
    { id: 2, name: 'portal-web', full_name: 'exemplo/portal-web', html_url: 'https://github.com/exemplo/portal-web', description: 'Frontend do portal', private: false, default_branch: 'main', clone_url: 'https://github.com/exemplo/portal-web.git', ssh_url: 'git@github.com:exemplo/portal-web.git' },
  ]],
  ['GET', /^\/admin-api\/storage-usage\/$/, () => ({
    total_bytes: 734_003_200,
    total_formatted: '700 MB',
    services: services.map((s, i) => ({ service_id: s.id, service_name: s.name, container_name: s.container_name, project_id: s.project, project_name: projects.find(p => p.id === s.project)?.name ?? '', app_id: s.app, app_name: apps.find(a => a.id === s.app)?.name ?? null, size_bytes: 200_000_000 + i * 100_000_000, size_formatted: `${200 + i * 100} MB` })),
  })],
]

export const mockAdapter: AxiosAdapter = async config => {
  const method = (config.method ?? 'get').toUpperCase()
  const url = (config.url ?? '').split('?')[0]
  for (const [m, regex, handler] of routes) {
    const match = m === method ? url.match(regex) : null
    if (match) {
      await new Promise(resolve => setTimeout(resolve, 120))
      return { data: handler(config, match), status: 200, statusText: 'OK', headers: {}, config }
    }
  }
  console.warn('[mock] rota sem mock:', method, url)
  return { data: {}, status: 200, statusText: 'OK', headers: {}, config, request: { now } }
}
