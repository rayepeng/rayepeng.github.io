<template>
  <div class="media-consumption">
    <div v-for="(items, type) in grouped" :key="type" class="slide-enter" :style="`--enter-stage: ${typeIndex.indexOf(type)}; --enter-step: 100ms;`">
      <h3>{{ labels[type] }}</h3>
      <div class="columns-1 md:columns-2 xl:columns-3 gap-4">
        <div v-for="item in items" :key="item.name" class="mb-2 break-inside-avoid">
          <span class="op-80">{{ item.name }}</span>
          <span v-if="item.creator" class="op-40 text-sm ml-1">— {{ item.creator }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { media, type MediaType } from '~/data/media'

const labels: Record<MediaType, string> = {
  anime: 'Anime',
  book: 'Books',
  movie: 'Movies',
  drama: 'Drama',
  game: 'Games',
  song: 'Music',
}

const typeOrder: MediaType[] = ['anime', 'book', 'movie', 'drama', 'game', 'song']
const typeIndex = typeOrder

const grouped = computed(() => {
  const result: Partial<Record<MediaType, typeof media.anime>> = {}
  for (const type of typeOrder) {
    if (media[type]?.length) {
      result[type] = media[type]
    }
  }
  return result
})
</script>
