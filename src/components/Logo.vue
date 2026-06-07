<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Raye's Journey</title>
    <!-- Stylized lowercase "r" with handwriting stroke animation -->
    <!-- Stroke 1: vertical stem (起笔 → 运笔 → 收笔) -->
    <path
      class="logo-stem"
      d="M35 38V75"
      stroke="currentColor"
      stroke-width="5"
      stroke-linecap="round"
      fill="none"
    />
    <!-- Stroke 2: shoulder curve (右上弧线 + 短横) -->
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

/* One-stroke handwriting animation */
.logo-stem {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: draw-stem 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
}

.logo-shoulder {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: draw-shoulder 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.7s forwards;
}

@keyframes draw-stem {
  0% {
    stroke-dashoffset: 40;
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

@keyframes draw-shoulder {
  0% {
    stroke-dashoffset: 50;
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
