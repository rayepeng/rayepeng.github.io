<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Star {
  x: number
  y: number
  r: number       // radius
  baseAlpha: number
  twinklePhase: number
  twinkleSpeed: number
}

interface Edge {
  a: number
  b: number
  dist: number
}

const canvasRef = ref<HTMLCanvasElement>()

// Tunables
const STAR_DENSITY = 0.00018      // stars per pixel (per side)
const MAX_NEIGHBORS = 3           // edges per star
const MAX_EDGE_DIST = 180         // px
const MOUSE_RADIUS = 160          // px — interactive halo radius
const SIDE_WIDTH_RATIO = 0.32     // each side covers ~32% of the viewport width
const SIDE_MIN_WIDTH = 240
const SIDE_MAX_WIDTH = 480

let stars: Star[] = []
let edges: Edge[] = []
let rafId = 0
let mouse = { x: -9999, y: -9999, active: false }
let dpr = 1
let cssW = 0
let cssH = 0
let leftBand = { x0: 0, x1: 0 }
let rightBand = { x0: 0, x1: 0 }
const startTime = Date.now()

// Throttle to ~30fps to halve CPU usage (60fps is overkill for ambient anim)
const FRAME_INTERVAL = 1000 / 30
let lastFrameTime = 0
let paused = false

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildStars(width: number, height: number) {
  stars = []

  const bandWidth = Math.min(
    Math.max(width * SIDE_WIDTH_RATIO, SIDE_MIN_WIDTH),
    SIDE_MAX_WIDTH,
  )

  // Left band: from 0 to bandWidth
  leftBand = { x0: 0, x1: bandWidth }
  // Right band: from (width - bandWidth) to width
  rightBand = { x0: width - bandWidth, x1: width }

  const areaPerBand = bandWidth * height
  const starCount = Math.max(16, Math.floor(areaPerBand * STAR_DENSITY))

  function spawnInBand(x0: number, x1: number) {
    for (let i = 0; i < starCount; i++) {
      // Soft edge: pull stars toward the outer side
      // (so they cluster near screen edge, fade toward content)
      const t = Math.pow(Math.random(), 1.3) // skew
      // Left band: t=0 means outer (left edge), so x near x0
      // Right band: t=0 means outer (right edge), so x near x1
      const isLeft = x0 === leftBand.x0
      const x = isLeft
        ? x0 + (x1 - x0) * t
        : x1 - (x1 - x0) * t
      const y = rand(0, height)
      const r = rand(0.7, 1.8)
      stars.push({
        x,
        y,
        r,
        baseAlpha: rand(0.25, 0.7),
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: rand(0.4, 1.2),
      })
    }
  }

  spawnInBand(leftBand.x0, leftBand.x1)
  spawnInBand(rightBand.x0, rightBand.x1)

  buildEdges()
}

function buildEdges() {
  edges = []
  for (let i = 0; i < stars.length; i++) {
    const a = stars[i]
    // Find candidate neighbors within MAX_EDGE_DIST
    const candidates: { idx: number; d: number }[] = []
    for (let j = 0; j < stars.length; j++) {
      if (j === i) continue
      const b = stars[j]
      // Don't connect across the gap between left and right bands
      const aSide = a.x < cssW / 2 ? 'L' : 'R'
      const bSide = b.x < cssW / 2 ? 'L' : 'R'
      if (aSide !== bSide) continue

      const dx = a.x - b.x
      const dy = a.y - b.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > MAX_EDGE_DIST) continue
      candidates.push({ idx: j, d })
    }
    candidates.sort((p, q) => p.d - q.d)
    const picks = candidates.slice(0, MAX_NEIGHBORS)
    for (const p of picks) {
      // Deduplicate edges (a,b) vs (b,a)
      if (i < p.idx) {
        edges.push({ a: i, b: p.idx, dist: p.d })
      }
    }
  }
}

function setupSize(canvas: HTMLCanvasElement) {
  cssW = window.innerWidth
  cssH = window.innerHeight
  dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)
  canvas.style.width = cssW + 'px'
  canvas.style.height = cssH + 'px'
}

function render(ctx: CanvasRenderingContext2D, t: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  // Intro reveal: 0 -> 1 over 2s
  const introT = Math.min(1, (t - startTime) / 2000)
  const ease = 1 - Math.pow(1 - introT, 3) // easeOutCubic

  // Draw edges first (under stars)
  for (const e of edges) {
    const sa = stars[e.a]
    const sb = stars[e.b]
    // Boost alpha if either endpoint near mouse
    let boost = 0
    if (mouse.active) {
      const mid_x = (sa.x + sb.x) / 2
      const mid_y = (sa.y + sb.y) / 2
      const dx = mouse.x - mid_x
      const dy = mouse.y - mid_y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < MOUSE_RADIUS) {
        boost = (1 - d / MOUSE_RADIUS) * 0.55
      }
    }
    // Fade with distance
    const distFade = 1 - e.dist / MAX_EDGE_DIST
    const alpha = (0.12 * distFade + boost) * ease
    if (alpha <= 0.005) continue
    ctx.strokeStyle = `rgba(125,125,125,${alpha})`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(sa.x, sa.y)
    ctx.lineTo(sb.x, sb.y)
    ctx.stroke()
  }

  // Draw stars
  for (const s of stars) {
    // Twinkle
    const twinkle = 0.6 + 0.4 * Math.sin((t / 1000) * s.twinkleSpeed + s.twinklePhase)
    let alpha = s.baseAlpha * twinkle * ease

    // Mouse halo
    let radius = s.r
    if (mouse.active) {
      const dx = mouse.x - s.x
      const dy = mouse.y - s.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < MOUSE_RADIUS) {
        const k = 1 - d / MOUSE_RADIUS
        alpha = Math.min(1, alpha + k * 0.6)
        radius = s.r + k * 1.6

        // Glow halo
        ctx.beginPath()
        ctx.fillStyle = `rgba(180,180,180,${0.12 * k * ease})`
        ctx.arc(s.x, s.y, radius * 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.beginPath()
    ctx.fillStyle = `rgba(180,180,180,${alpha})`
    ctx.arc(s.x, s.y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop(ctx: CanvasRenderingContext2D) {
  rafId = requestAnimationFrame(() => loop(ctx))
  if (paused) return
  const now = Date.now()
  if (now - lastFrameTime < FRAME_INTERVAL) return
  lastFrameTime = now
  render(ctx, now)
}

function handleVisibilityChange() {
  paused = document.visibilityState === 'hidden'
}

function handleMouseMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  mouse.active = true
}

function handleMouseLeave() {
  mouse.active = false
}

function handleResize(canvas: HTMLCanvasElement) {
  setupSize(canvas)
  buildStars(cssW, cssH)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Skip if reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  setupSize(canvas)
  buildStars(cssW, cssH)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (reduce) {
    // Render single static frame
    render(ctx, Date.now() + 3000) // skip intro
    return
  }

  loop(ctx)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  const resizeHandler = () => handleResize(canvas)
  window.addEventListener('resize', resizeHandler)
  // Cleanup hook attaches its own ref
  ;(canvas as any).__resizeHandler = resizeHandler
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  const canvas = canvasRef.value
  if (canvas && (canvas as any).__resizeHandler) {
    window.removeEventListener('resize', (canvas as any).__resizeHandler)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="art-constellation pointer-events-none fixed inset-0 z--1"
    aria-hidden="true"
  />
</template>

<style scoped>
.art-constellation {
  width: 100vw;
  height: 100vh;
}

@media (max-width: 720px) {
  .art-constellation {
    display: none;
  }
}
</style>
