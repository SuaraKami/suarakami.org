import type { App } from 'vue'
import LenisVue from 'lenis/vue'

export default (app: App) => {
  app.use(LenisVue)
}
