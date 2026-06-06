<template>
  <div class="my-6 tweet-embed">
    <blockquote class="twitter-tweet" :data-dnt="true">
      <a :href="`https://twitter.com/${user}/status/${id}`" />
    </blockquote>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: string; user?: string }>()

useHead({
  script: [
    {
      src: 'https://platform.twitter.com/widgets.js',
      async: true,
      tagPosition: 'bodyClose',
    },
  ],
})
</script>

<style>
.tweet-embed {
  display: flex;
  justify-content: center;
}
</style>
