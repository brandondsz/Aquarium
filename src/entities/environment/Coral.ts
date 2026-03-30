import { simplex3 } from '../../math/noise'
import { rand } from '../../math/utils'

type CoralType = 'branching' | 'fan' | 'brain' | 'tube' | 'mushroom'

interface Branch {
  x1: number; y1: number
  x2: number; y2: number
  width: number
  depth: number
  color: string
  isTip: boolean
}

interface FanPolyp {
  x: number; y: number
  length: number
  angle: number
}

interface Tube {
  x: number
  height: number
  radius: number
  color: string
  tipColor: string
  noiseOff: number
}

interface CoralData {
  type: CoralType
  x: number
  y: number
  scale: number
  noiseId: number
  primaryColor: string
  tipColor: string
  ridgeAngle?: number
  branches?: Branch[]
  tipPositions?: Array<{ x: number; y: number }>
  // Fan: batched polyp paths per strip
  fanStrips?: Array<{ path: Path2D; color: string }>
  fanHeight?: number
  fanWidth?: number
  brainPoints?: Array<{ x: number; y: number }>
  tubes?: Tube[]
  mushRadius?: number
  mushColor?: string
  mushRibCount?: number
  mushRibPath?: Path2D
  hasClownfish?: boolean
  homeX?: number
  homeY?: number
}

function hexLerp(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16)
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16)
  return `#${Math.round(r1+(r2-r1)*t).toString(16).padStart(2,'0')}${Math.round(g1+(g2-g1)*t).toString(16).padStart(2,'0')}${Math.round(b1+(b2-b1)*t).toString(16).padStart(2,'0')}`
}

export class Coral {
  corals: CoralData[] = []

  constructor(W: number, H: number) {
    this.generate(W, H)
  }

  private generate(W: number, H: number): void {
    const sandY = H * 0.78

    const branchingColors = [
      { base: '#6b1808', tip: '#e87030' },
      { base: '#8b2010', tip: '#ff9f50' },
      { base: '#0a4020', tip: '#40c860' },
      { base: '#7a5a00', tip: '#f0d030' },
      { base: '#0a3848', tip: '#30c8d0' },
      { base: '#3a0858', tip: '#b040f0' },
      { base: '#6a0838', tip: '#f050b0' },
    ]
    const fanColors = [
      { base: '#4a2060', tip: '#c46a8a' },
      { base: '#1a4a30', tip: '#40c878' },
      { base: '#4a3000', tip: '#e8a030' },
      { base: '#003848', tip: '#20b8d0' },
      { base: '#500020', tip: '#f04080' },
    ]

    // Branching — reduced to 7
    for (let i = 0; i < 7; i++) {
      const x = rand(W * 0.04, W * 0.96)
      const y = sandY - rand(0, 12)
      const col = branchingColors[i % branchingColors.length]
      const scale = rand(0.5, 1.5)
      const branches: Branch[] = []
      const tips: Array<{ x: number; y: number }> = []
      this.buildBranches(0, 0, -Math.PI / 2, 60 * scale, 8 * scale, 0, branches, tips, col)
      this.corals.push({
        type: 'branching', x, y, scale: 1,
        noiseId: Math.random() * 1000,
        primaryColor: col.base, tipColor: col.tip,
        branches, tipPositions: tips,
        hasClownfish: i === 1 || i === 3,
      })
    }

    // Fan — reduced to 5, polyps pre-batched into Path2D strips
    for (let i = 0; i < 5; i++) {
      const x = rand(W * 0.06, W * 0.94)
      const y = sandY - rand(5, 18)
      const col = fanColors[i % fanColors.length]
      const h = rand(60, 140)
      const w = h * rand(0.75, 1.3)

      // Build fan strips: group polyps by row into batched Path2D objects
      const strips: Array<{ path: Path2D; color: string }> = []
      const rows = Math.floor(h / 8)
      for (let r = 0; r < rows; r++) {
        const fy = -r * (h / rows)
        const fanWidth = w * (1 - (r / rows) * 0.3) * (Math.sin(r / rows * Math.PI) * 0.4 + 0.6)
        const polypCount = Math.floor(fanWidth / 6)
        if (polypCount < 1) continue
        const path = new Path2D()
        for (let p = 0; p < polypCount; p++) {
          const fx = (p / Math.max(1, polypCount - 1) - 0.5) * fanWidth
          const angle = rand(-0.3, 0.3)
          const len = rand(4, 8)
          path.moveTo(fx, fy)
          path.lineTo(fx + Math.sin(angle) * len, fy - Math.cos(angle) * len)
        }
        const t = r / rows
        const alpha = Math.floor(120 + t * 80).toString(16).padStart(2, '0')
        strips.push({ path, color: col.tip + alpha })
      }

      this.corals.push({
        type: 'fan', x, y, scale: 1,
        noiseId: Math.random() * 1000,
        primaryColor: col.base, tipColor: col.tip,
        fanStrips: strips,
        fanHeight: h, fanWidth: w,
      })
    }

    // Brain — reduced to 3
    const brainColors = [
      { primary: '#c06a20', tip: '#e09040' },
      { primary: '#208040', tip: '#40c870' },
      { primary: '#a04020', tip: '#d06840' },
    ]
    for (let i = 0; i < 3; i++) {
      const x = rand(W * 0.08, W * 0.92)
      const y = sandY - rand(0, 8)
      const col = brainColors[i % brainColors.length]
      const pts: Array<{ x: number; y: number }> = []
      const rx = rand(25, 50)
      const ry = rx * rand(0.4, 0.60)
      for (let p = 0; p < 32; p++) {
        const angle = (p / 32) * Math.PI * 2
        const nr = 1 + simplex3(p * 0.3, i * 10, 0) * 0.18
        pts.push({ x: Math.cos(angle) * rx * nr, y: Math.sin(angle) * ry * nr })
      }
      this.corals.push({
        type: 'brain', x, y, scale: 1,
        noiseId: Math.random() * 1000,
        primaryColor: col.primary, tipColor: col.tip,
        brainPoints: pts,
      })
    }

    // Tube — reduced to 4
    const tubeColors = [
      ['#ff6080','#ffb0c0'], ['#40c0ff','#a0e8ff'],
      ['#80ff60','#c8ffa0'], ['#ffd040','#fff0a0'],
    ]
    for (let i = 0; i < 4; i++) {
      const x = rand(W * 0.05, W * 0.95)
      const y = sandY - rand(2, 8)
      const col = tubeColors[i % tubeColors.length]
      const tubes: Tube[] = []
      const tubeCount = Math.floor(rand(3, 7))
      for (let t = 0; t < tubeCount; t++) {
        tubes.push({
          x: (t - tubeCount / 2) * rand(7, 14) + rand(-4, 4),
          height: rand(18, 50),
          radius: rand(3, 7),
          color: col[0], tipColor: col[1],
          noiseOff: Math.random() * 1000,
        })
      }
      this.corals.push({
        type: 'tube', x, y, scale: 1,
        noiseId: Math.random() * 1000,
        primaryColor: col[0], tipColor: col[1],
        tubes,
      })
    }

    // Mushroom — reduced to 3
    const mushColors = [
      { primary: '#20a060', mush: '#40e890' },
      { primary: '#e04080', mush: '#ff80b0' },
      { primary: '#c08020', mush: '#f0c050' },
    ]
    for (let i = 0; i < 3; i++) {
      const x = rand(W * 0.08, W * 0.92)
      const y = sandY - rand(2, 10)
      const col = mushColors[i % mushColors.length]
      const ribCount = Math.floor(rand(8, 14))
      const r = rand(20, 42)
      // Pre-build rib Path2D (static)
      const ribPath = new Path2D()
      for (let k = 0; k < ribCount; k++) {
        const angle = (k / ribCount) * Math.PI * 2
        ribPath.moveTo(0, -r * 0.6)
        ribPath.lineTo(Math.cos(angle) * r * 0.92, -r * 0.6 + Math.sin(angle) * r * 0.27)
      }
      this.corals.push({
        type: 'mushroom', x, y, scale: 1,
        noiseId: Math.random() * 1000,
        primaryColor: col.primary, tipColor: col.mush,
        mushRadius: r, mushColor: col.mush, mushRibCount: ribCount,
        mushRibPath: ribPath,
      })
    }
  }

  private buildBranches(
    x: number, y: number, angle: number, length: number, width: number, depth: number,
    out: Branch[], tips: Array<{ x: number; y: number }>,
    col: { base: string; tip: string },
  ): void {
    if (depth > 4 || length < 5) return
    const x2 = x + Math.cos(angle) * length
    const y2 = y + Math.sin(angle) * length
    const color = hexLerp(col.base, col.tip, depth / 4)
    const isTip = depth >= 4 || length < 12
    out.push({ x1: x, y1: y, x2, y2, width, depth, color, isTip })
    if (isTip) { tips.push({ x: x2, y: y2 }); return }
    const bc = depth < 2 ? 3 : 2
    for (let i = 0; i < bc; i++) {
      const spread = (i / (bc - 1) - 0.5) * (Math.PI * 0.55)
      this.buildBranches(x2, y2, angle + spread, length * rand(0.62, 0.72), width * 0.65, depth + 1, out, tips, col)
    }
  }

  draw(ctx: CanvasRenderingContext2D, elapsed: number): void {
    for (const c of this.corals) {
      ctx.save()
      ctx.translate(c.x, c.y)
      if (c.type === 'branching') this.drawBranching(ctx, c, elapsed)
      else if (c.type === 'fan') this.drawFan(ctx, c, elapsed)
      else if (c.type === 'brain') this.drawBrain(ctx, c, elapsed)
      else if (c.type === 'tube') this.drawTube(ctx, c, elapsed)
      else this.drawMushroom(ctx, c, elapsed)

      if (c.hasClownfish && c.homeX !== undefined) {
        const haloAlpha = 0.05 + Math.sin(elapsed * 1.5) * 0.025
        const hg = ctx.createRadialGradient(0, -30, 10, 0, -30, 60)
        hg.addColorStop(0, `rgba(240,160,60,${haloAlpha})`)
        hg.addColorStop(1, 'rgba(240,160,60,0)')
        ctx.fillStyle = hg
        ctx.beginPath()
        ctx.arc(0, -30, 60, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
  }

  private drawBranching(ctx: CanvasRenderingContext2D, c: CoralData, elapsed: number): void {
    if (!c.branches) return
    const sway = simplex3(c.noiseId, elapsed * 0.25, 0) * 0.06
    ctx.save()
    ctx.rotate(sway)

    // Draw body branches (non-tips) first, no shadow
    ctx.shadowBlur = 0
    ctx.lineCap = 'round'
    for (const b of c.branches) {
      if (b.isTip) continue
      ctx.beginPath()
      ctx.moveTo(b.x1, b.y1)
      ctx.lineTo(b.x2, b.y2)
      ctx.strokeStyle = b.color
      ctx.lineWidth = b.width
      ctx.stroke()
    }

    // Draw tips with glow — set shadowBlur ONCE for all tips
    ctx.shadowBlur = 8
    ctx.shadowColor = c.tipColor
    for (const b of c.branches) {
      if (!b.isTip) continue
      ctx.beginPath()
      ctx.moveTo(b.x1, b.y1)
      ctx.lineTo(b.x2, b.y2)
      ctx.strokeStyle = b.color
      ctx.lineWidth = b.width
      ctx.stroke()
    }
    ctx.shadowBlur = 0
    ctx.restore()
  }

  private drawFan(ctx: CanvasRenderingContext2D, c: CoralData, elapsed: number): void {
    if (!c.fanStrips) return
    const sway = simplex3(c.noiseId, elapsed * 0.2, 0) * 0.09
    ctx.save()
    ctx.rotate(sway)

    const w = (c.fanWidth || 80) * 0.5
    const h = c.fanHeight || 100

    // Fan mesh background (single fill)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(-w * 0.3, -h * 0.4, -w, -h * 0.7, -w * 0.5, -h)
    ctx.lineTo(w * 0.5, -h)
    ctx.bezierCurveTo(w, -h * 0.7, w * 0.3, -h * 0.4, 0, 0)
    ctx.fillStyle = c.primaryColor + '44'
    ctx.fill()

    // Pre-built polyp paths — one stroke per strip (huge win)
    ctx.lineWidth = 0.9
    ctx.globalAlpha = 0.75
    for (const strip of c.fanStrips) {
      ctx.strokeStyle = strip.color
      ctx.stroke(strip.path)
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  private drawBrain(ctx: CanvasRenderingContext2D, c: CoralData, elapsed: number): void {
    if (!c.brainPoints) return
    const pts = c.brainPoints

    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, -42, 0, 20)
    grad.addColorStop(0, c.tipColor)
    grad.addColorStop(0.5, c.primaryColor)
    grad.addColorStop(1, '#2a1008')
    ctx.fillStyle = grad
    ctx.shadowBlur = 4
    ctx.shadowColor = c.primaryColor
    ctx.fill()
    ctx.shadowBlur = 0

    // Batch all ridge lines into one draw pass
    const halfLen = Math.floor(pts.length / 2)
    ctx.beginPath()
    for (let i = 0; i < halfLen; i++) {
      const ridgeOsc = Math.sin(elapsed * 0.5 + i * 0.4)
      ctx.moveTo(pts[i].x + ridgeOsc, pts[i].y)
      ctx.lineTo(pts[halfLen - 1 - i].x, pts[halfLen - 1 - i].y)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 0.8
    ctx.stroke()
  }

  private drawTube(ctx: CanvasRenderingContext2D, c: CoralData, elapsed: number): void {
    if (!c.tubes) return

    // Draw all tube bodies first (shadow set once)
    ctx.shadowBlur = 6
    ctx.shadowColor = c.tipColor

    for (const t of c.tubes) {
      const wobble = simplex3(t.noiseOff, elapsed * 0.35, 0) * 0.08
      ctx.save()
      ctx.translate(t.x, 0)
      ctx.rotate(wobble)

      const grad = ctx.createLinearGradient(0, 0, 0, -t.height)
      grad.addColorStop(0, t.color + 'cc')
      grad.addColorStop(1, t.tipColor + 'ee')
      ctx.fillStyle = grad

      ctx.beginPath()
      ctx.roundRect(-t.radius, -t.height, t.radius * 2, t.height, t.radius * 0.3)
      ctx.fill()
      ctx.restore()
    }
    ctx.shadowBlur = 0

    // Rim highlights and tentacles (no shadow needed)
    for (const t of c.tubes) {
      const wobble = simplex3(t.noiseOff, elapsed * 0.35, 0) * 0.08
      ctx.save()
      ctx.translate(t.x, 0)
      ctx.rotate(wobble)

      // Dark inside
      ctx.beginPath()
      ctx.ellipse(0, -t.height, t.radius, t.radius * 0.38, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fill()

      // Rim
      ctx.beginPath()
      ctx.ellipse(0, -t.height, t.radius, t.radius * 0.38, 0, 0, Math.PI * 2)
      ctx.strokeStyle = t.tipColor
      ctx.lineWidth = 1.1
      ctx.stroke()

      // Batch tentacle dots into single path
      ctx.fillStyle = t.tipColor
      ctx.globalAlpha = 0.8
      for (let i = 0; i < 5; i++) {
        const ta = (i / 5) * Math.PI * 2
        const wave = Math.sin(elapsed * 2.5 + i * 1.2 + t.noiseOff) * t.radius * 0.5
        ctx.beginPath()
        ctx.arc(Math.cos(ta) * t.radius * 0.65 + wave * 0.3, Math.sin(ta) * t.radius * 0.3 - t.height - wave * 0.5, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.restore()
    }
  }

  private drawMushroom(ctx: CanvasRenderingContext2D, c: CoralData, elapsed: number): void {
    const r = c.mushRadius || 30
    const sway = simplex3(c.noiseId, elapsed * 0.18, 0) * 0.04

    ctx.save()
    ctx.rotate(sway)

    // Stalk
    ctx.beginPath()
    ctx.moveTo(-4, 0)
    ctx.quadraticCurveTo(-2, -r * 0.4, 0, -r * 0.55)
    ctx.quadraticCurveTo(2, -r * 0.4, 4, 0)
    ctx.fillStyle = c.primaryColor + 'cc'
    ctx.fill()

    // Cap with glow (set once)
    ctx.shadowBlur = 10
    ctx.shadowColor = c.mushColor || c.tipColor

    const capGrad = ctx.createRadialGradient(0, -r * 0.6, 0, 0, -r * 0.6, r)
    capGrad.addColorStop(0, c.tipColor + 'ff')
    capGrad.addColorStop(0.6, (c.mushColor || c.tipColor) + 'cc')
    capGrad.addColorStop(1, c.primaryColor + '88')
    ctx.beginPath()
    ctx.ellipse(0, -r * 0.6, r, r * 0.3, 0, 0, Math.PI * 2)
    ctx.fillStyle = capGrad
    ctx.fill()
    ctx.shadowBlur = 0

    // Pre-built rib path (single stroke)
    if (c.mushRibPath) {
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 0.7
      ctx.stroke(c.mushRibPath)
    }

    // Animated polyp dots — batch into single fill per frame
    const ribCount = c.mushRibCount || 12
    ctx.fillStyle = c.tipColor
    ctx.globalAlpha = 0.55
    for (let i = 0; i < ribCount * 2; i++) {
      const angle = (i / (ribCount * 2)) * Math.PI * 2
      const wave = Math.sin(elapsed * 1.8 + i * 0.5) * 1.5
      ctx.beginPath()
      ctx.arc(Math.cos(angle) * r * 0.7, -r * 0.6 + Math.sin(angle) * r * 0.24 + wave * 0.25, 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  getClownfishHomes(): Array<{ x: number; y: number }> {
    return this.corals.filter(c => c.hasClownfish).map(c => {
      c.homeX = c.x; c.homeY = c.y - 40
      return { x: c.homeX, y: c.homeY }
    })
  }

  getTipBubbleSources(): Array<{ x: number; y: number }> {
    const sources: Array<{ x: number; y: number }> = []
    for (const c of this.corals) {
      if (c.type === 'branching' && c.tipPositions) {
        for (const t of c.tipPositions.slice(0, 2)) sources.push({ x: c.x + t.x, y: c.y + t.y })
      }
      if (c.type === 'tube' && c.tubes) {
        sources.push({ x: c.x + c.tubes[0].x, y: c.y - c.tubes[0].height })
      }
    }
    return sources
  }
}
