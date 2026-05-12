/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'
import { createPinia } from 'pinia'
import router from '../router'
// Plugins
import vuetify from './vuetify'

const pinia = createPinia()

export function registerPlugins (app: App) {
  app.use(pinia).use(vuetify).use(router)
}
