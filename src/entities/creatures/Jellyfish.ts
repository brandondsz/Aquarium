import { simplex3 } from '../../math/noise'
import { rand } from '../../math/utils'

interface Tentacle {
  segCount: number
  noiseOffset: number
  length: number
}

export class Jellyfish {
  x: number
  y: number
  private noiseId: number
  private pulseFreq: number
  private driftSpeed: number
  private radius: number
  private tentacles: Tentacle[]
  private directionY: number
  private nextDirFlip: number
  private hue: number

  constructor(x: number, y: number, W: number, H: number) {
    this.x = x
    this.y = y
    this.noiseId = Math.random() * 1000
    this.pulseFreq = rand(0.4, 0.8)
    this.driftSpeed = rand(8, 18)
    this.radius = rand(28, 48)
    this.directionY = Math.random() > 0.5 ? -1 : 1
    this.nextDirFlip = rand(15, 40)
    this.hue = rand(180, 240)

    // Tentacles
    this.tentacles = []
    const tCount = Math.floor(rand(6, 10))
    for (let i = 0; i < tCount; i++) {
      this.tentacles.push({
        segCount: Math.floor(rand(8, 14)),
        noiseOffset: Math.random() * 1000,
        length: rand(this.radius * 0.9, this.radius * 2.0),
      })
    }

    // Keep in bounds
    this.x = Math.max(this.radius + 20, Math.min(W - this.radius - 20, x))
    this.y = Math.max(H * 0.08 + this.radius, Math.min(H * 0.72, y))
  }

  update(dt: number, elapsed: number, W: number, H: number): void {
    // Flip direction occasionally
    if (elapsed > this.nextDirFlip) {
      this.directionY *= -1
      this.nextDirFlip = elapsed + rand(15, 40)
    }

    // Horizontal wander
    const wx = simplex3(this.noiseId, elapsed * 0.12, 0)
    this.x += wx * 18 * dt

    // Vertical drift with pulse upthrust
    const pulse = Math.sin(elapsed * this.pulseFreq * Math.PI * 2)
    const upthrust = pulse > 0.6 ? (pulse - 0.6) * this.driftSpeed * 2 : 0
    this.y += (this.driftSpeed * this.directionY - upthrust) * dt

    // Boundaries
    const margin = 40
    if (this.x < margin) this.x = margin
    if (this.x > W - margin) this.x = W - margin
    if (this.y < H * 0.06 + this.radius + 10) {
      this.y = H * 0.06 + this.radius + 10
      this.directionY = 1
    }
    if (this.y > H * 0.74) {
      this.y = H * 0.74
      this.directionY = -1
    }
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number): void {
    const pulse = (Math.sin(elapsed * this.pulseFreq * Math.PI * 2) + 1) * 0.5
    const bellH = this.radius * (0.65 + pulse * 0.25)
    const bellW = this.radius * (1.0 - pulse * 0.18)
    const alpha = 0.55

    ctx.save()
    ctx.translate(this.x, this.y)

    // Outer glow
    const glow = ctx.createRadialGradient(0, 0, bellW * 0.3, 0, 0, bellW * 1.4)
    glow.addColorStop(0, `hsla(${this.hue},80%,75%,0.12)`)
    glow.addColorStop(1, `hsla(${this.hue},70%,60%,0)`)
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.ellipse(0, 0, bellW * 1.5, bellH * 1.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bell (top half dome)
    const grad = ctx.createRadialGradient(0, -bellH * 0.3, 0, 0, 0, bellW)
    grad.addColorStop(0, `hsla(${this.hue},80%,85%,${alpha + 0.1})`)
    grad.addColorStop(0.6, `hsla(${this.hue},75%,70%,${alpha})`)
    grad.addColorStop(1, `hsla(${this.hue},70%,55%,${alpha * 0.4})`)
    ctx.fillStyle = grad
    ctx.shadowBlur = 20
    ctx.shadowColor = `hsla(${this.hue},80%,70%,0.35)`
    ctx.beginPath()
    ctx.ellipse(0, 0, bellW, bellH, 0, Math.PI, 0) // top dome
    ctx.ellipse(0, 0, bellW * 0.95, bellH * 0.25, 0, 0, Math.PI) // frilly bottom
    ctx.fill()

    // Inner radial pattern
    ctx.shadowBlur = 0
    const innerRings = 3
    for (let r = 1; r <= innerRings; r++) {
      ctx.beginPath()
      ctx.ellipse(0, -bellH * 0.1, bellW * (r / innerRings) * 0.85, bellH * (r / innerRings) * 0.7, 0, Math.PI, 0)
      ctx.strokeStyle = `hsla(${this.hue + 20},90%,90%,0.15)`
      ctx.lineWidth = 0.8
      ctx.stroke()
    }

    // Tentacles
    const tSpacing = (Math.PI) / (this.tentacles.length - 1)
    this.tentacles.forEach((t, i) => {
      const startAngle = tSpacing * i // 0 to PI spread
      const startX = Math.cos(startAngle) * bellW * 0.8 * (i % 2 === 0 ? 1 : -1)
      const startY = 0

      ctx.beginPath()
      ctx.moveTo(startX, startY)

      let px = startX
      let py = startY
      const segLen = t.length / t.segCount

      for (let s = 1; s <= t.segCount; s++) {
        const sn = simplex3(t.noiseOffset + s * 0.3, elapsed * 0.4, 0)
        const nx = px + sn * 12
        const ny = py + segLen
        const alpha2 = 1 - s / t.segCount
        ctx.lineTo(nx, ny)
        px = nx
        py = ny
        void alpha2
      }

      ctx.strokeStyle = `hsla(${this.hue},70%,80%,0.45)`
      ctx.lineWidth = 1.2
      ctx.stroke()
    })

    ctx.restore()
  }
}
