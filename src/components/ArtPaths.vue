<script setup lang="ts">
import { ref, onMounted } from 'vue'

const ready = ref(false)

onMounted(() => {
  // Trigger animation after Vue mounts
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ready.value = true
    })
  })
})
</script>

<template>
  <div
    class="art-paths pointer-events-none fixed inset-0 z--1"
    :class="{ ready }"
    aria-hidden="true"
  >
    <!-- Left path -->
    <svg
      class="path path-left"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
    >
      <path
        class="path-stroke"
        d="M 0 800
           C 80 650, 120 500, 60 380
           S 30 200, 180 80
           S 320 -20, 400 -40"
        fill="none"
      />
      <!-- A few footstep dots along the path -->
      <g class="path-dots">
        <circle cx="60" cy="380" r="3" />
        <circle cx="180" cy="80" r="2.5" />
        <circle cx="100" cy="600" r="2" />
      </g>
    </svg>

    <!-- Right path -->
    <svg
      class="path path-right"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
    >
      <path
        class="path-stroke"
        d="M 400 800
           C 320 650, 280 500, 340 380
           S 370 200, 220 80
           S 80 -20, 0 -40"
        fill="none"
      />
      <g class="path-dots">
        <circle cx="340" cy="380" r="3" />
        <circle cx="220" cy="80" r="2.5" />
        <circle cx="300" cy="600" r="2" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.art-paths {
  overflow: hidden;
}

.path {
  position: absolute;
  top: 0;
  height: 100vh;
  width: 28vw;
  min-width: 220px;
  max-width: 440px;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.art-paths.ready .path {
  opacity: 1;
}

.path-left {
  left: 0;
}
.path-right {
  right: 0;
}

.path-stroke {
  stroke: currentColor;
  color: rgba(125, 125, 125, 0.4);
  stroke-width: 1.4;
  stroke-linecap: round;
  /* Stroke dash trick to "draw" the path */
  stroke-dasharray: 2200;
  stroke-dashoffset: 2200;
  transition: stroke-dashoffset 3.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.art-paths.ready .path-stroke {
  stroke-dashoffset: 0;
}

.path-dots circle {
  fill: currentColor;
  color: rgba(125, 125, 125, 0.55);
  opacity: 0;
  transform-origin: center;
  transform-box: fill-box;
}
.art-paths.ready .path-dots circle {
  animation: dotPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.art-paths.ready .path-left .path-dots circle:nth-child(1) {
  animation-delay: 1.4s;
}
.art-paths.ready .path-left .path-dots circle:nth-child(2) {
  animation-delay: 2.4s;
}
.art-paths.ready .path-left .path-dots circle:nth-child(3) {
  animation-delay: 0.8s;
}
.art-paths.ready .path-right .path-dots circle:nth-child(1) {
  animation-delay: 1.6s;
}
.art-paths.ready .path-right .path-dots circle:nth-child(2) {
  animation-delay: 2.6s;
}
.art-paths.ready .path-right .path-dots circle:nth-child(3) {
  animation-delay: 1.0s;
}

@keyframes dotPop {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    opacity: 1;
    transform: scale(1.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hide on small screens to avoid clutter */
@media (max-width: 720px) {
  .art-paths {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .path-stroke,
  .path-dots circle,
  .path {
    transition: none;
    animation: none;
    opacity: 1;
    stroke-dashoffset: 0;
  }
}
</style>
