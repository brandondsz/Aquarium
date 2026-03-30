import { simplex3 } from '../math/noise'
import { rand } from '../math/utils'

interface Bubble {
  x: number
  y: number
  baseX: number
  radius: number
  speed: number
  noiseId: number
  wobbleFreq: number
  alpha: number
  active: boolean
}

export class Bubbles {
  private bubbles: Bubble[]
  private surfaceY: number
  private onSurface?: () => void
  private sources: Array<{ x: number; y: number }> = []

  constructor(private W: number, private H: number) {
    this.surfaceY = H * 0.07
    this.bubbles = []
    for (let i = 0; i < 80; i++) {
      this.bubbles.push(this.makeBubble(true))
    }
  }

  setSources(sources: Array<{ x: number; y: number }>): void {
    this.sources = sources
  }

  onBubblePop(cb: () => void): void {
    this.onSurface = cb
  }

  private makeBubble(scattered = false): Bubble {
    const sandY = this.H * 0.78
    let bx: number
    let by: number

    if (this.sources.length > 0 && Math.random() > 0.35) {
      const src = this.sources[Math.floor(Math.random() * this.sources.length)]
      bx = src.x + rand(-8, 8)
      by = src.y
    } else {
      bx = rand(20, this.W - 20)
      by = scattered ? rand(this.surfaceY, sandY) : sandY + rand(0, 20)
    }

    return {
      x: bx,
      y: by,
      baseX: bx,
      radius: rand(1, 4),
      speed: rand(18, 55),
      noiseId: Math.random() * 1000,
      wobbleFreq: rand(1.5, 4.0),
      alpha: rand(0.4, 0.8),
      active: true,
    }
  }

  update(dt: number, elapsed: number): void {
    for (const b of this.bubbles) {
      if (!b.active) continue

      // Horizontal wobble
      const wobble = simplex3(b.noiseId, elapsed * b.wobbleFreq, 0) * 6
      b.x = b.baseX + wobble
      b.baseX += simplex3(b.noiseId + 500, elapsed * 0.3, 0) * 0.3
      b.y -= b.speed * dt

      // Fade in near bottom, fade out near surface
      const surfaceMargin = 40
      if (b.y < this.surfaceY + surfaceMargin) {
        b.alpha = Math.max(0, (b.y - this.surfaceY) / surfaceMargin) * 0.8

        if (b.y <= this.surfaceY + 5) {
          if (this.onSurface && Math.random() < 0.15) this.onSurface()
          // Reset bubble
          const nb = this.makeBubble(false)
          b.x = nb.x; b.y = nb.y; b.baseX = nb.baseX
          b.radius = nb.radius; b.speed = nb.speed
          b.noiseId = nb.noiseId; b.wobbleFreq = nb.wobbleFreq
          b.alpha = nb.alpha
        }
      } else {
        b.alpha = Math.min(0.8, b.alpha + dt)
      }

      // Keep in horizontal bounds
      if (b.x < 10) b.baseX = 10
      if (b.x > this.W - 10) b.baseX = this.W - 10
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const b of this.bubbles) {
      if (b.alpha <= 0.02) continue

      ctx.save()
      ctx.globalAlpha = b.alpha

      // Fill (very transparent)
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(200,240,255,0.05)'
      ctx.fill()

      // Stroke (the bubble outline)
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(200,240,255,0.8)'
      ctx.lineWidth = 0.7
      ctx.stroke()

      // Highlight
      ctx.beginPath()
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fill()

      ctx.globalAlpha = 1
      ctx.restore()
    }
  }
}
