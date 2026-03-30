import { simplex3 } from '../../math/noise'
import { rand } from '../../math/utils'

export class Seahorse {
  x: number
  y: number
  private noiseId: number
  private driftSpeed: number
  private anchorTimer: number
  private isAnchored: boolean
  private anchorDuration: number
  private size: number
  private hue: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.noiseId = Math.random() * 1000
    this.driftSpeed = rand(5, 12)
    this.isAnchored = false
    this.anchorTimer = rand(10, 25)
    this.anchorDuration = 0
    this.size = rand(28, 42)
    this.hue = rand(30, 60)
  }

  update(dt: number, elapsed: number, W: number, H: number): void {
    // Anchor/drift cycle
    if (!this.isAnchored && elapsed > this.anchorTimer) {
      this.isAnchored = true
      this.anchorDuration = elapsed + rand(5, 15)
    }
    if (this.isAnchored && elapsed > this.anchorDuration) {
      this.isAnchored = false
      this.anchorTimer = elapsed + rand(10, 25)
    }

    if (!this.isAnchored) {
      const wx = simplex3(this.noiseId + 10, elapsed * 0.08, 0)
      const wy = simplex3(this.noiseId + 20, elapsed * 0.08, 100)
      this.x += wx * this.driftSpeed * 0.6 * dt * 60
      this.y += (wy * this.driftSpeed * 0.4 - this.driftSpeed * 0.3) * dt
    }

    const margin = 80
    const sandY = H * 0.78
    if (this.x < margin) this.x = margin
    if (this.x > W - margin) this.x = W - margin
    if (this.y < H * 0.15) this.y = H * 0.15
    if (this.y > sandY - this.size) this.y = sandY - this.size
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number): void {
    const s = this.size
    const tailCurl = simplex3(this.noiseId, elapsed * 0.3, 200) * 0.7
    const finFlutter = Math.sin(elapsed * 12 + this.noiseId) * 0.06

    ctx.save()
    ctx.translate(this.x, this.y)

    // Glow
    ctx.shadowBlur = 12
    ctx.shadowColor = `hsla(${this.hue + 20}, 60%, 60%, 0.3)`

    // Body drawn as a series of bezier curves
    // The seahorse faces right (head at top)
    const bodyColor = `hsl(${this.hue}, 55%, 45%)`
    const lightColor = `hsl(${this.hue + 10}, 65%, 65%)`
    const darkColor = `hsl(${this.hue - 10}, 50%, 30%)`

    // Head
    ctx.beginPath()
    ctx.ellipse(s * 0.08, -s * 0.55, s * 0.22, s * 0.18, -0.3, 0, Math.PI * 2)
    ctx.fillStyle = bodyColor
    ctx.fill()

    // Snout
    ctx.beginPath()
    ctx.moveTo(s * 0.22, -s * 0.58)
    ctx.quadraticCurveTo(s * 0.55, -s * 0.62, s * 0.60, -s * 0.55)
    ctx.lineWidth = s * 0.10
    ctx.strokeStyle = bodyColor
    ctx.lineCap = 'round'
    ctx.stroke()

    // Neck + Torso — spine via bezier
    ctx.beginPath()
    ctx.moveTo(s * 0.08, -s * 0.40)  // neck start
    ctx.bezierCurveTo(
      -s * 0.15, -s * 0.20,   // control 1
      -s * 0.20, s * 0.15,    // control 2
      s * 0.0 + simplex3(this.noiseId + 1, elapsed * 0.2, 0) * s * 0.05, s * 0.35  // end
    )
    ctx.lineWidth = s * 0.22
    ctx.strokeStyle = bodyColor
    ctx.stroke()

    // Belly highlight
    ctx.beginPath()
    ctx.moveTo(s * 0.02, -s * 0.38)
    ctx.bezierCurveTo(-s * 0.05, -s * 0.1, -s * 0.08, s * 0.15, s * 0.02, s * 0.32)
    ctx.lineWidth = s * 0.08
    ctx.strokeStyle = lightColor
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.globalAlpha = 1

    // Tail curl
    ctx.beginPath()
    ctx.moveTo(s * 0.0, s * 0.35)
    ctx.bezierCurveTo(
      s * 0.1, s * 0.55,
      s * 0.25 + tailCurl * s * 0.3, s * 0.62,
      s * 0.18 + tailCurl * s * 0.4, s * 0.50
    )
    ctx.lineWidth = s * 0.13
    ctx.strokeStyle = darkColor
    ctx.lineCap = 'round'
    ctx.stroke()

    // Dorsal fin (flutter)
    ctx.save()
    ctx.translate(-s * 0.12, -s * 0.1)
    ctx.rotate(finFlutter)
    ctx.beginPath()
    ctx.ellipse(0, 0, s * 0.28, s * 0.09, -0.6, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue + 30}, 70%, 70%, 0.7)`
    ctx.fill()
    ctx.restore()

    // Eye
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(s * 0.18, -s * 0.60, s * 0.07, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a15'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 0.20, -s * 0.62, s * 0.025, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fill()

    ctx.restore()
  }
}
