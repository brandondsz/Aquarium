import { simplex3 } from '../math/noise'

export class WaterSurface {
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, elapsed: number, surfaceTint = '#4a9ab5', causticIntensity = 1.0): void {
    const surfaceH = H * 0.07

    // Caustic sparkles — scale with time of day
    if (causticIntensity > 0.05) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const sparkleCount = Math.floor(30 * causticIntensity)
      for (let i = 0; i < sparkleCount; i++) {
        const xNorm = i / sparkleCount
        const waveY = simplex3(xNorm * 3, elapsed * 0.6, 0) * surfaceH * 0.4 + surfaceH * 0.5
        const sparkAlpha = (simplex3(xNorm * 4, elapsed * 0.8, 100) + 1) * 0.5 * 0.2 * causticIntensity
        ctx.beginPath()
        ctx.arc(xNorm * W, waveY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,240,255,${sparkAlpha})`
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.restore()
    }

    // Parse surface tint color for gradient
    const r = parseInt(surfaceTint.slice(1, 3), 16)
    const g = parseInt(surfaceTint.slice(3, 5), 16)
    const b = parseInt(surfaceTint.slice(5, 7), 16)

    // Wave distortion band
    ctx.save()
    const waveGrad = ctx.createLinearGradient(0, 0, 0, surfaceH)
    waveGrad.addColorStop(0, `rgba(${r},${g},${b},0.85)`)
    waveGrad.addColorStop(0.3, `rgba(${Math.floor(r * 0.4)},${Math.floor(g * 0.5)},${Math.floor(b * 0.55)},0.55)`)
    waveGrad.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = waveGrad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(W, 0)

    const steps = Math.ceil(W / 8)
    for (let i = steps; i >= 0; i--) {
      const x = (i / steps) * W
      const y = surfaceH * 0.7 +
        Math.sin(x * 0.02 + elapsed * 1.2) * surfaceH * 0.12 +
        Math.sin(x * 0.035 + elapsed * 0.7) * surfaceH * 0.08 +
        simplex3(x * 0.008, elapsed * 0.5, 0) * surfaceH * 0.1
      ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()

    // Bright top highlight strip — dims at night
    const stripAlpha = 0.3 + causticIntensity * 0.55
    ctx.beginPath()
    ctx.rect(0, 0, W, 3)
    const stripGrad = ctx.createLinearGradient(0, 0, W, 0)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const bright = (simplex3(t * 5, elapsed * 0.9, 200) + 1) * 0.5
      stripGrad.addColorStop(t, `rgba(${r + 30},${g + 20},${b + 20},${bright * stripAlpha})`)
    }
    ctx.fillStyle = stripGrad
    ctx.fill()

    ctx.restore()
  }
}
