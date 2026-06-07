<script setup lang="ts">
import { ref, onMounted, onUnmounted, onScopeDispose, nextTick, effectScope } from 'vue'
import { createNoise3D } from 'simplex-noise'
import { useEventListener } from '@vueuse/core'

const el = ref<HTMLDivElement>()

let w = typeof window !== 'undefined' ? window.innerWidth : 800
let h = typeof window !== 'undefined' ? window.innerHeight : 600

const SCALE = 200
const LENGTH = 5
const SPACING = 15

const noise3d = createNoise3D()

const existingPoints = new Set<string>()
const points: { x: number, y: number, opacity: number, particle: any }[] = []

function getForceOnPoint(x: number, y: number, z: number) {
  return (noise3d(x / SCALE, y / SCALE, z) - 0.5) * 2 * Math.PI
}

const mountedScope = effectScope()

async function setup() {
  if (el.value == null)
    return

  const { Application, Graphics, Particle, ParticleContainer } = await import('pixi.js')

  const app = new Application()
  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio,
    eventMode: 'none',
    autoDensity: true,
  })
  el.value.appendChild(app.canvas)

  await nextTick()
  app.renderer.resize(window.innerWidth, window.innerHeight)

  const particleContainer = new ParticleContainer({ dynamicProperties: { position: true, alpha: true } })
  app.stage.addChild(particleContainer)

  const g = new Graphics().circle(0, 0, 1).fill(0xCCCCCC)
  const dotTexture = app.renderer.generateTexture(g)

  function addPoints() {
    for (let x = -SPACING / 2; x < w + SPACING; x += SPACING) {
      for (let y = -SPACING / 2; y < h + SPACING; y += SPACING) {
        const id = `${x}-${y}`
        if (existingPoints.has(id))
          continue
        existingPoints.add(id)

        const particle = new Particle(dotTexture)
        particle.anchorX = 0.5
        particle.anchorY = 0.5
        particleContainer.addParticle(particle)

        const opacity = Math.random() * 0.5 + 0.5
        points.push({ x, y, opacity, particle })
      }
    }
  }

  addPoints()

  app.ticker.add(() => {
    const t = Date.now() / 10000

    for (const p of points) {
      const { x, y, opacity, particle } = p
      const rad = getForceOnPoint(x, y, t)
      const len = (noise3d(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH
      const nx = x + Math.cos(rad) * len
      const ny = y + Math.sin(rad) * len

      particle.x = nx
      particle.y = ny
      particle.alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity
    }
  })

  mountedScope.run(() => {
    useEventListener('resize', async () => {
      w = window.innerWidth
      h = window.innerHeight
      app.renderer.resize(w, h)
      addPoints()
    })
    onScopeDispose(() => {
      try {
        app?.destroy(true, { children: true, texture: true, textureSource: true })
      }
      catch (error) {
        console.error(error)
      }
    })
  })
}

onMounted(async () => {
  await setup()
})

onUnmounted(() => {
  mountedScope.stop()
})
</script>

<template>
  <div ref="el" z--1 fixed size-screen left-0 right-0 top-0 bottom-0 pointer-events-none dark:invert />
</template>
