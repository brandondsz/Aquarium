import { Vec2 } from '../../math/vec2'
import { rand } from '../../math/utils'
import type { FishSpecies } from './FishSpecies'

export class Boid {
  pos: Vec2
  vel: Vec2
  acc: Vec2

  noiseId: number
  wanderStrength: number
  wanderFreq: number
  personalSpeed: number
  nextImpulseTime: number
  impulseForce: Vec2
  impulseRemaining: number

  homeX = 0
  homeY = 0
  tailPhase: number

  constructor(x: number, y: number, public species: FishSpecies, elapsed: number) {
    this.pos = new Vec2(x, y)
    const angle = Math.random() * Math.PI * 2
    const spd = rand(species.maxSpeed * 0.4, species.maxSpeed * 0.8)
    this.vel = new Vec2(Math.cos(angle) * spd, Math.sin(angle) * spd)
    this.acc = new Vec2(0, 0)

    this.noiseId = Math.random() * 1000
    this.wanderStrength = rand(species.wanderStrengthMin, species.wanderStrengthMax)
    this.wanderFreq = rand(species.wanderFreqMin, species.wanderFreqMax)
    this.personalSpeed = species.maxSpeed * rand(0.75, 1.25)
    this.nextImpulseTime = elapsed + rand(0, 20)
    this.impulseForce = new Vec2(0, 0)
    this.impulseRemaining = 0
    this.tailPhase = Math.random() * Math.PI * 2
  }

  applyForce(f: Vec2): void { this.acc.addMut(f) }

  update(dt: number, elapsed: number, W: number, H: number): void {
    const sp = this.species
    if (elapsed >= this.nextImpulseTime) {
      const angle = Math.random() * Math.PI * 2
      this.impulseForce = new Vec2(Math.cos(angle) * sp.maxForce * 2.5, Math.sin(angle) * sp.maxForce * 2.5)
      this.impulseRemaining = 0.4
      this.nextImpulseTime = elapsed + rand(8, 20)
    }
    if (this.impulseRemaining > 0) {
      this.applyForce(this.impulseForce.scale(this.impulseRemaining / 0.4))
      this.impulseRemaining -= dt
    }
    this.vel.addMut(this.acc.scale(dt))
    this.vel.limitMut(this.personalSpeed)
    this.pos.addMut(this.vel.scale(dt))
    this.acc = new Vec2(0, 0)

    const margin = 60
    if (this.pos.x < -margin) this.pos.x = W + margin
    if (this.pos.x > W + margin) this.pos.x = -margin
    if (this.pos.y < -margin) this.pos.y = H + margin
    if (this.pos.y > H + margin) this.pos.y = -margin

    this.tailPhase += dt * 8
  }

  draw(ctx: CanvasRenderingContext2D, _scale: number): void {
    const sp = this.species
    const angle = Math.atan2(this.vel.y, this.vel.x)
    const tailWag = Math.sin(this.tailPhase) * 0.18
    const sz = sp.size

    ctx.save()
    ctx.translate(this.pos.x, this.pos.y)
    ctx.rotate(angle)

    // Body
    ctx.beginPath()
    ctx.ellipse(0, 0, sz, sz * 0.48, 0, 0, Math.PI * 2)
    ctx.fillStyle = sp.bodyColor
    ctx.fill()

    // Stripes (clownfish white bands)
    if (sp.stripeColor && sp.name === 'Clownfish') {
      ctx.save()
      ctx.clip()
      const stripeW = sz * 0.18
      const positions = [-sz * 0.55, 0, sz * 0.55]
      ctx.fillStyle = sp.stripeColor
      for (const sx of positions) {
        ctx.fillRect(sx - stripeW / 2, -sz * 0.55, stripeW, sz * 1.1)
      }
      ctx.restore()
    } else if (sp.stripeColor && sp.stripeCount > 0) {
      ctx.save()
      ctx.clip()
      const stripeW = sz * 0.16
      ctx.fillStyle = sp.stripeColor
      ctx.globalAlpha = 0.45
      for (let i = 0; i < sp.stripeCount; i++) {
        const t = (i + 1) / (sp.stripeCount + 1)
        ctx.fillRect((t - 0.5) * sz * 2 - stripeW / 2, -sz * 0.55, stripeW, sz * 1.1)
      }
      ctx.globalAlpha = 1
      ctx.restore()
    }

    // Dorsal fin
    ctx.beginPath()
    ctx.moveTo(-sz * 0.2, -sz * 0.45)
    ctx.quadraticCurveTo(sz * 0.1, -sz * 0.85, sz * 0.3, -sz * 0.4)
    ctx.fillStyle = sp.finColor
    ctx.globalAlpha = 0.8
    ctx.fill()
    ctx.globalAlpha = 1

    // Tail
    ctx.save()
    ctx.translate(-sz, 0)
    ctx.rotate(tailWag)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-sz * 0.55, -sz * 0.45)
    ctx.lineTo(-sz * 0.15, 0)
    ctx.lineTo(-sz * 0.55, sz * 0.45)
    ctx.closePath()
    ctx.fillStyle = sp.finColor
    ctx.fill()
    ctx.restore()

    // Highlight — cheap substitute for shadowBlur glow
    ctx.beginPath()
    ctx.ellipse(sz * 0.05, -sz * 0.1, sz * 0.6, sz * 0.18, -0.2, 0, Math.PI)
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Eye
    ctx.beginPath()
    ctx.arc(sz * 0.55, -sz * 0.12, sz * 0.13, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a10'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(sz * 0.58, -sz * 0.15, sz * 0.05, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()

    ctx.restore()
  }
}
