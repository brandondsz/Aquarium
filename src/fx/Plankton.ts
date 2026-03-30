import { simplex3 } from '../math/noise'
import { rand } from '../math/utils'

interface Particle {
  x: number
  y: number
  noiseId: number
  size: number
  hue: number
  // Pre-computed color strings updated infrequently
  colorA: string
  colorB: string
}

export class Plankton {
  private particles: Particle[]
  // Offscreen canvas for static plankton render
  private cache: OffscreenCanvas
  private cacheCtx: OffscreenCanvasRenderingContext2D
  private lastCacheFrame = -1

  constructor(W: number, H: number) {
    this.cache = new OffscreenCanvas(W, H)
    this.cacheCtx = this.cache.getContext('2d')!

    this.particles = []
    const sandY = H * 0.78
    const surfaceY = H * 0.06

    for (let i = 0; i < 220; i++) {
      const hue = rand(180, 220)
      this.particles.push({
        x: rand(0, W),
        y: rand(surfaceY, sandY),
        noiseId: Math.random() * 2000,
        size: Math.random() < 0.2 ? 1.5 : 1,
        hue,
        colorA: `hsla(${hue},80%,85%,0.45)`,
        colorB: `hsla(${hue},80%,85%,0.28)`,
      })
    }
  }

  update(elapsed: number, frame: number): void {
    if (frame % 2 !== 0) return
    for (const p of this.particles) {
      p.x += simplex3(p.noiseId, elapsed * 0.06, 0) * 0.5
      p.y += simplex3(p.noiseId + 1000, elapsed * 0.06, 0) * 0.3
    }
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number, frame: number): void {
    // Redraw cache every 3 frames
    if (frame - this.lastCacheFrame >= 3) {
      this.lastCacheFrame = frame
      const c = this.cacheCtx
      c.clearRect(0, 0, this.cache.width, this.cache.height)

      // Batch by color alternation — draw all 'A' dots, then all 'B' dots
      const pulse = (Math.sin(elapsed * 0.8) + 1) * 0.5
      c.fillStyle = pulse > 0.5 ? this.particles[0].colorA : this.particles[0].colorB

      for (const p of this.particles) {
        const col = pulse > 0.5 ? p.colorA : p.colorB
        if (c.fillStyle !== col) {
          c.fillStyle = col
        }
        c.beginPath()
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        c.fill()
      }
    }

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage(this.cache, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }
}
