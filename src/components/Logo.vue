<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Raye's Journey</title>
    <!-- Lowercase "r" with proper ascender (vertical stem extends above x-height) -->
    <!--
      Typographic guides:
        baseline   y = 80
        x-height   y = 38   (top of shoulder curve)
        ascender   y = 18   (top of vertical stem)

      One-stroke handwriting order:
        Stroke 1 (stem):     ascender top → baseline   (vertical, includes ascender)
        Stroke 2 (shoulder): from x-height → up-right arc, mimicking pen lift
    -->

    <!-- Stroke 1: vertical stem with ascender (起笔在 ascender 顶端 → 运笔向下 → 收笔到 baseline) -->
    <path
      class="logo-stem"
      d="M35 18V80"
      stroke="currentColor"
      stroke-width="5"
      stroke-linecap="round"
      fill="none"
    />
    <!-- Stroke 2: shoulder curve from x-height (从 x-height 位置弧线向右上) -->
    <path
      class="logo-shoulder"
      d="M35 38C35 30 40 24 50 24C58 24 62 28 62 35V38"
      stroke="currentColor"
      stroke-width="5"
      stroke-linecap="round"
      fill="none"
    />
  </svg>
</template>

<style scoped>
.logo-stem,
.logo-shoulder {
  color: #303030;
  fill: none;
}

.dark .logo-stem,
.dark .logo-shoulder {
  color: #fdfdfd;
}

/* Stem includes ascender (length ≈ 62 units, from y=18 down to y=80) */
.logo-stem {
  stroke-dasharray: 64;
  stroke-dashoffset: 64;
  animation: draw-stem 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
}

/* Shoulder curve (length ≈ 36 units) — pen-lift then redraw */
.logo-shoulder {
  stroke-dasharray: 38;
  stroke-dashoffset: 38;
  animation: draw-shoulder 0.45s cubic-bezier(0.65, 0, 0.35, 1) 0.85s forwards;
}

@keyframes draw-stem {
  0% {
    stroke-dashoffset: 64;
    opacity: 0.3;
  }
  8% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes draw-shoulder {
  0% {
    stroke-dashoffset: 38;
    opacity: 0.3;
  }
  10% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@media (prefers-reduced-motion) {
  .logo-stem,
  .logo-shoulder {
    animation: none !important;
    stroke-dashoffset: 0 !important;
    opacity: 1 !important;
  }
}
</style>
