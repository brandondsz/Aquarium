export class DepthFog {
  draw(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    // Vertical depth fog — transparent top → dark bottom
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0.0, 'rgba(10,15,26,0)')
    grad.addColorStop(0.55, 'rgba(10,15,26,0.08)')
    grad.addColorStop(0.75, 'rgba(10,15,26,0.20)')
    grad.addColorStop(0.85, 'rgba(10,15,26,0.40)')
    grad.addColorStop(1.0, 'rgba(5,8,16,0.70)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Side vignette
    const leftGrad = ctx.createLinearGradient(0, 0, W * 0.15, 0)
    leftGrad.addColorStop(0, 'rgba(8,12,22,0.45)')
    leftGrad.addColorStop(1, 'rgba(8,12,22,0)')
    ctx.fillStyle = leftGrad
    ctx.fillRect(0, 0, W * 0.15, H)

    const rightGrad = ctx.createLinearGradient(W, 0, W * 0.85, 0)
    rightGrad.addColorStop(0, 'rgba(8,12,22,0.45)')
    rightGrad.addColorStop(1, 'rgba(8,12,22,0)')
    ctx.fillStyle = rightGrad
    ctx.fillRect(W * 0.85, 0, W * 0.15, H)
  }
}
