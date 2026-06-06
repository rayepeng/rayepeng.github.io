<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  to: string
  /** Display text. Defaults to `to`. */
  text?: string
  /** Iconify class string, e.g. `i-logos-vue` */
  icon?: string
}

const props = defineProps<Props>()

/**
 * Best-effort name → icon map (subset; extend as posts demand).
 * The original antfu.me uses a 200+ entry `linksMap`; we start small and
 * surface as needed during P4 content migration.
 */
const KNOWN_ICONS: Record<string, { icon: string, href: string }> = {
  Vue: { icon: 'i-logos-vue', href: 'https://vuejs.org' },
  Vite: { icon: 'i-logos-vitejs', href: 'https://vitejs.dev' },
  Vitest: { icon: 'i-logos-vitest', href: 'https://vitest.dev' },
  Nuxt: { icon: 'i-logos-nuxt-icon', href: 'https://nuxt.com' },
  Astro: { icon: 'i-logos-astro-icon', href: 'https://astro.build' },
  TypeScript: { icon: 'i-logos-typescript-icon', href: 'https://typescriptlang.org' },
  UnoCSS: { icon: 'i-logos-unocss', href: 'https://unocss.dev' },
}

const resolved = computed(() => {
  const known = KNOWN_ICONS[props.to]
  return {
    href: props.to.startsWith('http') ? props.to : (known?.href ?? `https://www.google.com/search?q=${encodeURIComponent(props.to)}`),
    icon: props.icon ?? known?.icon ?? '',
    text: props.text ?? props.to,
  }
})
</script>

<template>
  <a
    class="magic-link inline-flex items-center gap-1"
    :href="resolved.href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span v-if="resolved.icon" :class="resolved.icon" inline-block w-em h-em translate-y--0.5px />
    <span>{{ resolved.text }}</span>
  </a>
</template>

<style scoped>
.magic-link {
  text-decoration-color: var(--c-border, currentColor);
}
</style>