<template>
  <div class="my-6 tweet-embed">
    <blockquote class="twitter-tweet" :data-dnt="true">
      <a :href="`https://twitter.com/${user}/status/${id}`" />
    </blockquote>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

defineProps<{ id: string; user?: string }>()

onMounted(() => {
  // Load Twitter widgets script if not already loaded
  if (!document.getElementById('twitter-widgets-script')) {
    const script = document.createElement('script')
    script.id = 'twitter-widgets-script'
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    document.body.appendChild(script)
  }
})
</script>

<style>
.tweet-embed {
  display: flex;
  justify-content: center;
}
</style>
