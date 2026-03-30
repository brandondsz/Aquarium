import { simplex3 } from '../../math/noise'
import { rand } from '../../math/utils'

interface KelpStrand {
  x: number
  baseY: number
  height: number
  segCount: number
  noiseId: number
  width: number
  leafInterval: number
  colorMid: string
  colorTip: string
  leafColor: string
}

export class Kelp {
  private strands: KelpStrand[] = []

  constructor(W: number, H: number) {
    this.generate(W, H)
  }

  private generate(W: number, H: number): void {
    const sandY = H * 0.78
    const count = Math.floor(rand(12, 20))

    const kelpVariants = [
      { mid: '#2d6028', tip: '#5aaa30', leaf: '#3d8028' },  // classic kelp green
      { mid: '#1a5020', tip: '#40c050', leaf: '#30a038' },  // vivid green
      { mid: '#3a5010', tip: '#80c020', leaf: '#60a018' },  // lime kelp
      { mid: '#204820', tip: '#38b858', leaf: '#289848' },  // deep emerald
      { mid: '#105838', tip: '#20d890', leaf: '#18b870' },  // teal kelp
    ]

    for (let i = 0; i < count; i++) {
      const v = kelpVariants[i % kelpVariants.length]
      const height = rand(H * 0.22, H * 0.60)
      const segLen = rand(14, 24)
      this.strands.push({
        x: rand(25, W - 25),
        baseY: sandY + rand(0, 12),
        height,
        segCount: Math.ceil(height / segLen),
        noiseId: Math.random() * 1000,
        width: rand(3, 7),
        leafInterval: Math.floor(rand(2, 4)),
        colorMid: v.mid,
        colorTip: v.tip,
        leafColor: v.leaf,
      })
    }
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number): void {
    for (const s of this.strands) {
      const segLen = s.height / s.segCount
      const positions: Array<{ x: number; y: number }> = [{ x: s.x, y: s.baseY }]
      let px = s.x
      let py = s.baseY

      for (let i = 1; i <= s.segCount; i++) {
        const t = i / s.segCount
        const sway = simplex3(s.noiseId + i * 0.15, elapsed * 0.07, 0) * (18 + t * 45)
        px += sway * 0.16
        py -= segLen
        positions.push({ x: px, y: py })
      }

      // Draw main stalk
      ctx.beginPath()
      ctx.moveTo(positions[0].x, positions[0].y)
      for (let i = 1; i < positions.length; i++) {
        const cp = positions[i - 1]
        const np = positions[i]
        ctx.quadraticCurveTo(cp.x, cp.y - segLen * 0.3, np.x, np.y)
      }

      const grad = ctx.createLinearGradient(s.x, s.baseY, s.x, s.baseY - s.height)
      grad.addColorStop(0, '#1a3318')
      grad.addColorStop(0.4, s.colorMid)
      grad.addColorStop(1, s.colorTip)

      ctx.strokeStyle = grad
      ctx.lineWidth = s.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Leaf blades
      for (let i = s.leafInterval; i < positions.length - 1; i += s.leafInterval) {
        const pos = positions[i]
        const sway = simplex3(s.noiseId + i * 0.15, elapsed * 0.07, 0)
        this.drawLeaf(ctx, pos.x, pos.y, sway, i % 2 === 0 ? 1 : -1, s.leafColor, s.width)
      }
    }
  }

  private drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, sway: number, side: number, color: string, width: number): void {
    const scale = (width / 5) * (0.8 + Math.random() * 0.4)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(sway * 0.32 + side * 0.38)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(side * 14 * scale, -10 * scale, side * 26 * scale, -20 * scale, side * 22 * scale, -35 * scale)
    ctx.bezierCurveTo(side * 18 * scale, -25 * scale, side * 8 * scale, -14 * scale, 0, 0)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.82
    ctx.fill()
    // Midrib highlight
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(side * 12 * scale, -16 * scale, side * 20 * scale, -32 * scale)
    ctx.strokeStyle = 'rgba(200,255,160,0.2)'
    ctx.lineWidth = 0.8
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.restore()
  }
}
