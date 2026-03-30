import { rand } from '../../math/utils'

interface RockData {
  x: number
  y: number
  points: Array<{ x: number; y: number }>
  colorDark: string
  colorMid: string
  colorHigh: string
  scale: number
}

export class Rock {
  private rocks: RockData[] = []
  private cache: OffscreenCanvas | null = null
  private cacheCtx: OffscreenCanvasRenderingContext2D | null = null
  private dirty = true

  constructor(W: number, H: number) {
    this.generate(W, H)
  }

  private generate(W: number, H: number): void {
    const sandY = H * 0.78
    this.rocks = []
    const count = Math.floor(rand(8, 14))
    for (let i = 0; i < count; i++) {
      const x = rand(20, W - 20)
      const scale = rand(0.5, 2.2)
      const y = sandY + rand(-10, 20) * scale
      const ptCount = Math.floor(rand(7, 12))
      const points: Array<{ x: number; y: number }> = []
      const baseR = rand(22, 48)
      for (let p = 0; p < ptCount; p++) {
        const angle = (p / ptCount) * Math.PI * 2
        const r = baseR * rand(0.6, 1.3)
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.55 })
      }
      const depth = x / W
      const d = Math.floor(20 + depth * 10)
      const m = Math.floor(35 + depth * 15)
      const hi = Math.floor(55 + depth * 20)
      this.rocks.push({
        x, y, points, scale,
        colorDark: `rgb(${d+5},${d+8},${d+18})`,
        colorMid: `rgb(${m+5},${m+8},${m+18})`,
        colorHigh: `rgb(${hi+5},${hi+8},${hi+18})`,
      })
    }
    this.rocks.sort((a, b) => a.y - b.y)
    this.dirty = true
  }

  private buildCache(W: number, H: number): void {
    this.cache = new OffscreenCanvas(W, H)
    this.cacheCtx = this.cache.getContext('2d')!
    const ctx = this.cacheCtx

    // Draw shadow once
    ctx.shadowBlur = 14
    ctx.shadowColor = 'rgba(0,0,0,0.45)'

    for (const r of this.rocks) {
      ctx.save()
      ctx.translate(r.x, r.y)
      ctx.scale(r.scale, r.scale)
      ctx.beginPath()
      ctx.moveTo(r.points[0].x, r.points[0].y)
      for (const p of r.points) ctx.lineTo(p.x, p.y)
      ctx.closePath()
      const grad = ctx.createLinearGradient(0, -40, 0, 40)
      grad.addColorStop(0, r.colorMid)
      grad.addColorStop(0.5, r.colorDark)
      grad.addColorStop(1, r.colorDark)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }

    ctx.shadowBlur = 0

    // Highlights
    for (const r of this.rocks) {
      ctx.save()
      ctx.translate(r.x, r.y)
      ctx.scale(r.scale, r.scale)
      const last = r.points[Math.floor(r.points.length * 0.4)]
      ctx.beginPath()
      ctx.moveTo(r.points[0].x, r.points[0].y - 2)
      ctx.lineTo(last.x, last.y - 2)
      ctx.strokeStyle = r.colorHigh
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.55
      ctx.stroke()
      ctx.restore()
    }
    ctx.globalAlpha = 1
    this.dirty = false
  }

  draw(ctx: CanvasRenderingContext2D, W?: number, H?: number): void {
    if (this.dirty || !this.cache) {
      const w = W ?? ctx.canvas.width
      const h = H ?? ctx.canvas.height
      this.buildCache(w, h)
    }
    ctx.drawImage(this.cache!, 0, 0)
  }
}
