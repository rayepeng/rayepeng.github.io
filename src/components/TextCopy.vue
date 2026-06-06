<template>
  <button
    class="text-copy border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 text-xs inline-flex items-center gap-1 transition hover:border-gray-400 dark:hover:border-gray-500"
    @click="copy"
  >
    <span class="i-ri:file-copy-line text-sm" />
    <span v-if="!copied">Copy</span>
    <span v-else class="text-green-500">Copied!</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{ text?: string }>()
const copied = ref(false)

function copy() {
  const content = props.text ?? ''
  navigator.clipboard.writeText(content).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>
