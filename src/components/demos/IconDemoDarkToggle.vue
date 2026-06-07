<template>
  <div flex gap-2 text-4xl p-2 mt4>
    <div class="i-ph-anchor-simple-thin" />
    <div class="i-mdi-alarm text-orange-400 hover:text-teal-400" />
    <div class="i-logos-vue transform transition-800 hover:rotate-180" />
    <button class="i-carbon-sun dark:i-carbon-moon" @click="toggleDark()" />
    <div class="i-twemoji-grinning-face-with-smiling-eyes hover:i-twemoji-face-with-tears-of-joy" />
    <div text-base my-auto flex><div i-carbon-arrow-left my-auto mr-1 /> Hover it</div>
  </div>
</template>

<script setup lang="ts">
import { isDark } from '~/logics'

function toggleDark() {
  isDark.value = !isDark.value
}
</script>
