// Rotas abertas sem login. Usada pelo guard do router e pelo interceptor 401 do axios:
// se so um dos dois souber da rota, o visitante anonimo e jogado para '/'.
// /regras precisa poder ser enviada a terceiros.
export const PUBLIC_ROUTES: ReadonlySet<string> = new Set([
  '/',
  '/callback',
  '/callback/',
  '/regras',
  '/regras/',
])

export function isPublicRoute (path: string) {
  return PUBLIC_ROUTES.has(path)
}
