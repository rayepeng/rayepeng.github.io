import { useDark, useLocalStorage } from '@vueuse/core'
import { nextTick, ref } from 'vue'

const isBrowser = typeof window !== 'undefined'

// Lazy-initialize VueUse composables so they don't crash during Astro SSR
// (where `window` / `document` are absent).  On first client-side access we
// instantiate the real refs; until then we provide plain Vue refs as stubs.
const _isDark = isBrowser ? useDark() : ref(false)
const _englishOnly = isBrowser ? useLocalStorage('antfu-english-only', false) : ref(false)
const _galleryView = isBrowser
  ? useLocalStorage<'cover' | 'contain'>('antfu-gallery-view', 'cover')
  : ref<'cover' | 'contain'>('cover')

export const isDark = _isDark
export const englishOnly = _englishOnly
export const galleryView = _galleryView

/**
 * Toggle dark mode with a radial clip-path view transition based on the
 * cursor position. Falls back to a plain toggle when:
 *   - `document.startViewTransition` is not supported (Safari / Firefox)
 *   - the user prefers reduced motion
 *
 * Credit: hooray @ vuejs/vitepress#2347
 */
export function toggleDark(event: MouseEvent) {
  if (!isBrowser) return

  const isAppearanceTransition =
    // @ts-expect-error experimental API
    typeof document !== 'undefined' && document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  // @ts-expect-error experimental API
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: isDark.value
          ? [...clipPath].reverse()
          : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-out',
        fill: 'forwards',
        pseudoElement: isDark.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}

export function formatDate(d: string | Date, onlyDate = true) {
  const date = new Date(d)
  const now = new Date()
  const opts: Intl.DateTimeFormatOptions = (onlyDate || date.getFullYear() === now.getFullYear())
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', opts)
}
