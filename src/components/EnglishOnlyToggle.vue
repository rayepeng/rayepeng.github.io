<script setup lang="ts">
import { englishOnly } from '~/logics'

/**
 * Toggles `englishOnly` global state (mirrors antfu.me/src/components/SubNav.vue).
 * Lives in its own micro-island so we don't pull the rest of SubNav into Vue.
 */
</script>

<template>
  <button
    flex="~ gap1" items-center mb2 op30 text-sm
    @click="englishOnly = !englishOnly"
  >
    <div :class="englishOnly ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" />
    English Only
  </button>
</template>