import { simplex2 } from '../../math/noise'

export class SandFloor {
  private offscreen: OffscreenCanvas
  private offCtx: OffscreenCanvasRenderingContext2D
  private lastRegen = -999
  private W: number
  private H: number

  constructor(W: number, H: number) {
    this.W = W
    this.H = H
    this.offscreen = new OffscreenCanvas(W, H)
    this.offCtx = this.offscreen.getContext('2d')!
  }

  resize(W: number, H: number): void {
    this.W = W
    this.H = H
    this.offscreen = new OffscreenCanvas(W, H)
    this.offCtx = this.offscreen.getContext('2d')!
    this.lastRegen = -999
  }

  private regenerate(elapsed: number): void {
    const ctx = this.offCtx
    const W = this.W
    const H = this.H
    const sandY = H * 0.78
    const sandH = H - sandY

    ctx.clearRect(0, sandY, W, sandH + 2)

    // Sand gradient base
    const grad = ctx.createLinearGradient(0, sandY, 0, H)
    grad.addColorStop(0, '#c8a96e')
    grad.addColorStop(0.25, '#b89558')
    grad.addColorStop(1, '#7a5530')
    ctx.fillStyle = grad
    ctx.fillRect(0, sandY, W, sandH + 2)

    // Ripple shadows and highlights
    const rippleSpacing = 18
    const rippleCount = Math.ceil(W / rippleSpacing) + 1
    for (let i = 0; i < rippleCount; i++) {
      const baseX = i * rippleSpacing
      const noiseOffset = simplex2(baseX * 0.01, elapsed * 0.1) * 12

      // Shadow trough
      ctx.beginPath()
      for (let x = baseX - 40; x <= baseX + 40; x += 4) {
        const y = sandY + 8 + Math.sin((x - baseX + noiseOffset) * 0.18) * 4 + simplex2(x * 0.02, elapsed * 0.05) * 3
        if (x === baseX - 40) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(90,60,25,0.35)'
      ctx.lineWidth = 3
      ctx.stroke()

      // Highlight crest
      ctx.beginPath()
      for (let x = baseX - 40; x <= baseX + 40; x += 4) {
        const y = sandY + 4 + Math.sin((x - baseX + noiseOffset) * 0.18) * 4 + simplex2(x * 0.02, elapsed * 0.05) * 3
        if (x === baseX - 40) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(230,200,140,0.12)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Small stones/pebbles
    ctx.save()
    for (let p = 0; p < 80; p++) {
      const px = (simplex2(p * 0.7, 0) * 0.5 + 0.5) * W
      const py = sandY + 10 + (simplex2(p * 0.7, 10) * 0.5 + 0.5) * (sandH - 20)
      const r = 1.5 + (simplex2(p * 0.7, 20) * 0.5 + 0.5) * 3.5
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(100,75,40,0.5)`
      ctx.fill()
    }
    ctx.restore()
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number, frame: number): void {
    // Regen sand every 8 frames
    if (frame % 8 === 0 || elapsed - this.lastRegen > 0.13) {
      this.regenerate(elapsed)
      this.lastRegen = elapsed
    }
    ctx.drawImage(this.offscreen, 0, 0)
  }
}
