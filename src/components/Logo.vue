<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Raye's Journey</title>
    <!-- Stylized "R" letter mark -->
    <path
      class="logo-path"
      d="M30 20V80M30 20H52C60 20 65 25 65 32C65 39 60 44 52 44M30 44H52M53 44L68 80"
      stroke="currentColor"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </svg>
</template>

<style scoped>
.logo-path {
  color: #303030;
  animation: fadeIn 1s ease forwards;
}
.dark .logo-path {
  color: #fdfdfd;
}
@media (prefers-reduced-motion) {
  .logo-path {
    animation: none !important;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
