<script setup lang="ts">
import { computed } from 'vue'
import { blurhashToGradientCssObject } from '@unpic/placeholder'
import { galleryView } from '~/logics'

interface Photo {
  name: string
  url: string
  text?: string
  blurhash?: string
  lang?: string
}

const props = defineProps<{
  photos: Photo[]
  limit?: number
}>()

const displayedPhotos = computed(() => {
  if (props.limit)
    return props.photos.slice(0, props.limit)
  return props.photos
})

function toggleView() {
  galleryView.value = galleryView.value === 'cover' ? 'contain' : 'cover'
}
</script>

<template>
  <div flex="~ gap-1 col items-center justify-center" absolute sm:fixed left-6 top-20>
    <button
      title="Switch view"
      rounded-full p2 op20 hover="op100 bg-#8881"
      @click="toggleView"
    >
      <div :class="galleryView === 'cover' ? 'i-ri-grid-line' : 'i-ri-layout-masonry-line'" />
    </button>
  </div>
  <div class="photos grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" max-w-500 mx-auto>
    <div v-for="(photo, idx) in displayedPhotos" :key="idx">
      <img
        :src="photo.url"
        :alt="photo.text || ''"
        :data-photo-index="idx"
        :style="photo.blurhash && galleryView !== 'contain' ? blurhashToGradientCssObject(photo.blurhash) as any : ''"
        loading="lazy"
        w-full
        :class="galleryView === 'contain' ? 'object-contain sm:aspect-square' : 'object-cover aspect-square'"
      >
    </div>
  </div>
</template>
