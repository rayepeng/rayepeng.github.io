<template>
  <div class="my-6 flex justify-center">
    <div class="inline-block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <!-- Cal.com inline embed placeholder -->
      <iframe
        :src="`https://cal.com/${username}/${event}?embed=true`"
        class="w-full border-0"
        style="min-height: 600px; max-width: 600px;"
        frameborder="0"
        :title="`Schedule with ${username}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  username: string
  event?: string
}>()
</script>
