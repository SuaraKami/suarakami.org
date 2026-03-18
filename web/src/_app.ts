import LenisVue from 'lenis/vue'
import type { App } from 'vue'

export default function vue(app: App) {
  app.use(LenisVue)
}
