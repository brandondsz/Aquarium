import { Vec2 } from '../../math/vec2'
import { simplex3 } from '../../math/noise'
import { rand } from '../../math/utils'
import { Boid } from './Boid'
import type { FishSpecies } from './FishSpecies'

export class BoidSchool {
  boids: Boid[]
  species: FishSpecies
  private grid: Map<string, Boid[]> = new Map()

  constructor(species: FishSpecies, W: number, H: number, elapsed: number) {
    this.species = species
    this.boids = []
    const sandY = H * 0.78
    const depthMin = species.preferredDepthMin
    const depthMax = species.preferredDepthMax

    for (let i = 0; i < species.count; i++) {
      const x = rand(50, W - 50)
      const y = depthMin * sandY + Math.random() * (depthMax - depthMin) * sandY
      const b = new Boid(x, y, species, elapsed)
      this.boids.push(b)
    }
  }

  private buildGrid(): void {
    const cell = this.species.perceptionRadius * 2
    this.grid.clear()
    for (const b of this.boids) {
      const key = `${Math.floor(b.pos.x / cell)},${Math.floor(b.pos.y / cell)}`
      const bucket = this.grid.get(key)
      if (bucket) bucket.push(b)
      else this.grid.set(key, [b])
    }
  }

  private getNeighbors(b: Boid): Boid[] {
    const cell = this.species.perceptionRadius * 2
    const cx = Math.floor(b.pos.x / cell)
    const cy = Math.floor(b.pos.y / cell)
    const result: Boid[] = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = this.grid.get(`${cx + dx},${cy + dy}`)
        if (bucket) result.push(...bucket)
      }
    }
    return result
  }

  update(dt: number, elapsed: number, W: number, H: number): void {
    const sp = this.species
    const sandY = H * 0.78
    const surfaceY = H * 0.06

    this.buildGrid()

    for (const b of this.boids) {
      const neighbors = this.getNeighbors(b)

      let sep = new Vec2(0, 0)
      let ali = new Vec2(0, 0)
      let coh = new Vec2(0, 0)
      let sepCount = 0, aliCount = 0, cohCount = 0

      for (const other of neighbors) {
        if (other === b) continue
        const d = b.pos.dist(other.pos)

        if (d < sp.separationRadius && d > 0) {
          const diff = b.pos.sub(other.pos).normalize().scale(1 / d)
          sep.addMut(diff)
          sepCount++
        }
        if (d < sp.perceptionRadius) {
          ali.addMut(other.vel)
          aliCount++
          coh.addMut(other.pos)
          cohCount++
        }
      }

      // Separation
      if (sepCount > 0) {
        sep.scaleMut(1 / sepCount)
        sep = sep.normalize().scale(sp.maxSpeed).sub(b.vel).limit(sp.maxForce)
        b.applyForce(sep.scale(1.8))
      }

      // Alignment
      if (aliCount > 0) {
        ali.scaleMut(1 / aliCount)
        ali = ali.normalize().scale(sp.maxSpeed).sub(b.vel).limit(sp.maxForce)
        b.applyForce(ali.scale(1.0))
      }

      // Cohesion
      if (cohCount > 0) {
        coh.scaleMut(1 / cohCount)
        const desired = coh.sub(b.pos).normalize().scale(sp.maxSpeed)
        const steer = desired.sub(b.vel).limit(sp.maxForce)
        b.applyForce(steer.scale(1.0))
      }

      // Wander via simplex noise — fully per-boid
      const wx = simplex3(b.noiseId, elapsed * b.wanderFreq * 0.001, 0)
      const wy = simplex3(b.noiseId + 500, elapsed * b.wanderFreq * 0.001, 0)
      const wander = new Vec2(wx, wy).normalize().scale(sp.maxForce * b.wanderStrength)
      b.applyForce(wander)

      // Clownfish home attraction
      if (sp.behavior === 'clownfish') {
        const dx = b.homeX - b.pos.x
        const dy = b.homeY - b.pos.y
        const distHome = Math.sqrt(dx * dx + dy * dy)
        const strength = distHome > 200 ? 2.5 : 0.8
        const home = new Vec2(dx, dy).normalize().scale(sp.maxForce * strength)
        b.applyForce(home)
        // Nervous bob
        b.pos.y += Math.sin(elapsed * 4 + b.noiseId) * 1.5 * dt * 60
      }

      // Depth band attraction
      const prefY = (sp.preferredDepthMin * 0.5 + sp.preferredDepthMax * 0.5) * sandY
      const depthDiff = prefY - b.pos.y
      b.applyForce(new Vec2(0, depthDiff * 0.002 * sp.maxForce))

      // Boundary avoidance — soft margins
      const margin = 80
      if (b.pos.x < margin) b.applyForce(new Vec2(sp.maxForce * 2.5 * (1 - b.pos.x / margin), 0))
      if (b.pos.x > W - margin) b.applyForce(new Vec2(-sp.maxForce * 2.5 * (1 - (W - b.pos.x) / margin), 0))
      if (b.pos.y < surfaceY + margin) b.applyForce(new Vec2(0, sp.maxForce * 2.5 * (1 - (b.pos.y - surfaceY) / margin)))
      if (b.pos.y > sandY - margin * 0.5) b.applyForce(new Vec2(0, -sp.maxForce * 2.5 * (1 - (sandY - b.pos.y) / (margin * 0.5))))

      b.update(dt, elapsed, W, H)
    }
  }

  draw(ctx: CanvasRenderingContext2D, _elapsed: number): void {
    for (const b of this.boids) {
      b.draw(ctx, 1)
    }
  }

  setHome(x: number, y: number): void {
    for (const b of this.boids) {
      b.homeX = x + rand(-30, 30)
      b.homeY = y + rand(-20, 20)
    }
  }

  getBubblePositions(): Array<{ x: number; y: number }> {
    return this.boids.slice(0, 2).map(b => ({ x: b.pos.x, y: b.pos.y }))
  }
}
