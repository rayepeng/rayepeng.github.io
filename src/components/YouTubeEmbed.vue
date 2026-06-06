<template>
  <div class="my-4 flex justify-center">
    <iframe
      :src="`https://www.youtube.com/embed/${videoId}`"
      class="aspect-video w-full max-w-2xl rounded-lg"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ id: string }>()
const videoId = computed(() => {
  // Support full URL or just the ID
  if (props.id.includes('youtube.com') || props.id.includes('youtu.be')) {
    const url = new URL(props.id.startsWith('http') ? props.id : `https://${props.id}`)
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1)
    return url.searchParams.get('v') ?? props.id
  }
  return props.id
})
</script>
