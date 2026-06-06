import type { App } from 'vue'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

export default (app: App) => {
  app.use(FloatingVue)
}