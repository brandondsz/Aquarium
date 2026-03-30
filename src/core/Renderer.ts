import type { World } from './World'
import { getLighting, getLightingLabel } from '../lighting/DayLighting'

export class Renderer {
  ctx: CanvasRenderingContext2D
  private lightingCacheTime = -60 // force first fetch

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
  }

  resize(W: number, H: number): void {
    this.canvas.width = W
    this.canvas.height = H
  }

  drawFrame(world: World, elapsed: number, frame: number): void {
    const ctx = this.ctx
    const W = world.W
    const H = world.H

    const light = getLighting()

    // Pass 0: Background gradient
    this.drawBackground(ctx, W, H, light)

    // Pass 1: Caustic light rays (intensity scaled by time of day)
    world.causticRays.draw(ctx, W, H, elapsed, light.causticIntensity)

    // Pass 2: Far background rocks
    ctx.save()
    ctx.globalAlpha = 0.45
    world.rock.draw(ctx, W, H)
    ctx.globalAlpha = 1
    ctx.restore()

    // Pass 3: Background seaweed
    ctx.save()
    ctx.globalAlpha = 0.55
    world.seaweed.draw(ctx, elapsed)
    ctx.globalAlpha = 1
    ctx.restore()

    // Pass 4: Sand floor
    world.sand.draw(ctx, elapsed, frame)

    // Pass 5: Foreground environment
    world.seaweed.draw(ctx, elapsed)
    world.coral.draw(ctx, elapsed)
    world.rock.draw(ctx, W, H)

    // Pass 6: Fish schools
    for (const school of world.schools) {
      school.draw(ctx, elapsed)
    }

    // Pass 7: Jellyfish
    for (const j of world.jellyfish) {
      j.draw(ctx, elapsed)
    }

    // Pass 8: Seahorse
    world.seahorse.draw(ctx, elapsed)

    // Pass 9: Bubbles
    world.bubbles.draw(ctx)

    // Pass 10: Plankton
    world.plankton.draw(ctx, elapsed, frame)

    // Pass 11: Depth fog
    world.depthFog.draw(ctx, W, H)

    // Pass 12: Water surface
    world.waterSurface.draw(ctx, W, H, elapsed, light.surfaceTint, light.causticIntensity)

    // Pass 13: Time-of-day tint overlay
    if (light.tintAlpha > 0.01) {
      ctx.fillStyle = light.tintColor
      ctx.globalAlpha = light.tintAlpha
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
    }

    // Pass 14: Clock label (subtle, bottom-right)
    this.drawClock(ctx, W, H, getLightingLabel(), light.label)
  }

  private drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, light: ReturnType<typeof getLighting>): void {
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    for (const [pos, color] of light.bgStops) {
      grad.addColorStop(pos, color)
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Ambient mid-water glow
    const midGrad = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.65)
    midGrad.addColorStop(0, light.glowColor)
    midGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = midGrad
    ctx.globalAlpha = light.glowAlpha * 8  // glowAlpha is already small
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
  }

  private drawClock(ctx: CanvasRenderingContext2D, W: number, H: number, time: string, label: string): void {
    ctx.save()
    ctx.font = '11px Georgia, serif'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(160,220,255,0.35)'
    ctx.fillText(`${time} · ${label}`, W - 16, H - 14)
    ctx.restore()
  }
}
