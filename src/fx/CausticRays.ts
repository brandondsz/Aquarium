import { simplex3 } from '../math/noise'

export class CausticRays {
  private rayCount = 10
  private noiseIds: number[]

  constructor() {
    this.noiseIds = Array.from({ length: this.rayCount }, () => Math.random() * 1000)
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, elapsed: number, intensity = 1.0): void {
    const sandY = H * 0.78

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0; i < this.rayCount; i++) {
      const ni = this.noiseIds[i]
      const xNorm = (i + 1) / (this.rayCount + 1)
      const xOsc = simplex3(ni, elapsed * 0.08, 0) * 0.18
      const topX = (xNorm + xOsc) * W
      const widthTop = W * (0.01 + simplex3(ni + 100, elapsed * 0.06, 0) * 0.025 + 0.015)
      const widthBottom = widthTop * (3 + simplex3(ni + 200, elapsed * 0.05, 0) * 1.5)
      const alpha = (0.025 + simplex3(ni + 300, elapsed * 0.1, 0) * 0.02 + 0.01) * intensity

      // Primary ray
      const grad = ctx.createLinearGradient(topX, 0, topX, sandY)
      grad.addColorStop(0, `rgba(180,230,255,${alpha + 0.02})`)
      grad.addColorStop(0.35, `rgba(160,215,255,${alpha})`)
      grad.addColorStop(1, `rgba(120,180,220,0)`)

      ctx.beginPath()
      ctx.moveTo(topX - widthTop / 2, 0)
      ctx.lineTo(topX + widthTop / 2, 0)
      ctx.lineTo(topX + widthBottom / 2, sandY)
      ctx.lineTo(topX - widthBottom / 2, sandY)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Secondary shorter ray
      if (i % 2 === 0) {
        const sx = topX + simplex3(ni + 400, elapsed * 0.07, 0) * 60
        const sw = widthTop * 0.5
        const shortH = sandY * rand(0.3, 0.6)
        const sg = ctx.createLinearGradient(sx, 0, sx, shortH)
        sg.addColorStop(0, `rgba(200,240,255,${alpha * 0.8})`)
        sg.addColorStop(1, `rgba(160,210,240,0)`)
        ctx.beginPath()
        ctx.moveTo(sx - sw / 2, 0)
        ctx.lineTo(sx + sw / 2, 0)
        ctx.lineTo(sx + sw, shortH)
        ctx.lineTo(sx - sw, shortH)
        ctx.closePath()
        ctx.fillStyle = sg
        ctx.fill()
      }
    }

    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }
}

function rand(a: number, b: number): number { return a + Math.random() * (b - a) }
