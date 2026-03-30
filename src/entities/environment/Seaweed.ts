import { simplex3 } from '../../math/noise'
import { rand } from '../../math/utils'

interface SeaweedStrand {
  x: number
  baseY: number
  segCount: number
  segLen: number
  noiseId: number
  width: number
  colorBase: string
  colorTip: string
  hasLeaves: boolean
  leafColor: string
}

export class Seaweed {
  private strands: SeaweedStrand[] = []

  constructor(W: number, H: number) {
    this.generate(W, H)
  }

  private generate(W: number, H: number): void {
    const sandY = H * 0.78
    const count = Math.floor(rand(28, 40))

    // Rich variety of greens + a few colorful accent varieties
    const colors = [
      { base: '#0f3020', tip: '#3a9050', leaf: '#2d7040' },
      { base: '#1a4530', tip: '#2d7a45', leaf: '#3a9055' },
      { base: '#0f3515', tip: '#4a9440', leaf: '#3e8030' },
      { base: '#163825', tip: '#56c050', leaf: '#40a838' },  // bright lime
      { base: '#0d2818', tip: '#30b860', leaf: '#28a050' },  // vivid emerald
      { base: '#2a4a10', tip: '#80d030', leaf: '#60b828' },  // yellow-green
      { base: '#0a2820', tip: '#28c0a0', leaf: '#20a088' },  // sea-green teal
      { base: '#2a1a08', tip: '#c0a030', leaf: '#a08828' },  // golden seagrass
      { base: '#1a0a28', tip: '#9050d0', leaf: '#7038b0' },  // rare purple seaweed
      { base: '#1a1010', tip: '#e04060', leaf: '#c03050' },  // red algae
    ]

    for (let i = 0; i < count; i++) {
      const col = colors[i % colors.length]
      const segCount = Math.floor(rand(7, 18))
      const hasLeaves = Math.random() > 0.4
      this.strands.push({
        x: rand(10, W - 10),
        baseY: sandY + rand(3, 22),
        segCount,
        segLen: rand(9, 20),
        noiseId: Math.random() * 1000,
        width: rand(2.0, 6.0),
        colorBase: col.base,
        colorTip: col.tip,
        hasLeaves,
        leafColor: col.leaf,
      })
    }
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number): void {
    for (const s of this.strands) {
      const positions: Array<{ x: number; y: number }> = []
      let px = s.x
      let py = s.baseY
      positions.push({ x: px, y: py })

      ctx.beginPath()
      ctx.moveTo(px, py)

      for (let i = 0; i < s.segCount; i++) {
        const t = i / s.segCount
        const sway = simplex3(s.noiseId + i * 0.22, elapsed * 0.025, 0) * (12 + t * 28)
        const nx = px + sway
        const ny = py - s.segLen
        ctx.lineTo(nx, ny)
        px = nx
        py = ny
        positions.push({ x: px, y: py })
      }

      const totalH = s.segCount * s.segLen
      const grad = ctx.createLinearGradient(s.x, s.baseY, s.x, s.baseY - totalH)
      grad.addColorStop(0, s.colorBase)
      grad.addColorStop(0.6, s.colorTip)
      grad.addColorStop(1, s.colorTip + 'cc')

      ctx.strokeStyle = grad
      ctx.lineWidth = s.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Leaf blades on wider strands
      if (s.hasLeaves && s.width > 3.0) {
        const leafStep = Math.floor(s.segCount / 4) || 1
        for (let i = leafStep; i < positions.length - 1; i += leafStep) {
          const pos = positions[i]
          const sway2 = simplex3(s.noiseId + i * 0.22, elapsed * 0.025, 0)
          this.drawLeaf(ctx, pos.x, pos.y, sway2, i % 2 === 0 ? 1 : -1, s.leafColor, s.width)
        }
      }
    }
  }

  private drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, sway: number, side: number, color: string, parentWidth: number): void {
    const scale = parentWidth / 4.5
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(sway * 0.15 + side * 0.45)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(side * 10 * scale, -6 * scale, side * 20 * scale, -14 * scale, side * 16 * scale, -26 * scale)
    ctx.bezierCurveTo(side * 12 * scale, -18 * scale, side * 5 * scale, -10 * scale, 0, 0)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.85
    ctx.fill()
    // Midrib
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(side * 8 * scale, -12 * scale, side * 14 * scale, -24 * scale)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 0.6
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.restore()
  }
}
