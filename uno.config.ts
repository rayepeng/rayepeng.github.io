import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
} from 'unocss'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

// Mirrors antfu.me/unocss.config.ts as closely as possible.
export default defineConfig({
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-black',
      'color-base': 'text-black dark:text-white',
      'border-base': 'border-[#8884]',
    },
    [
      /^btn-(\w+)$/,
      ([_, color]) =>
        `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`,
    ],
  ],
  rules: [
    [
      /^slide-enter-(\d+)$/,
      ([_, n]) => ({ '--enter-stage': n }),
    ],
  ],
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetAttributify(),
    presetWind3(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'DM Mono',
        condensed: 'Roboto Condensed',
        wisper: 'Bad Script',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: [
    'i-ri-menu-2-fill',
    // Dynamically toggled icons in categories tree
    'i-carbon-folder',
    'i-carbon-folder-open',
    'i-carbon-chevron-right',
  ],
})