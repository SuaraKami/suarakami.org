import type { App } from 'vue'

import LenisVue from 'lenis/vue'

export default function vue(app: App) {
  app.use(LenisVue)
}
