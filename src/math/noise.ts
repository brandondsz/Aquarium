// Simplex noise — Stefan Gustavson's algorithm, self-contained

const grad3: [number, number, number][] = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
]

const rawP: number[] = []
for (let i = 0; i < 256; i++) rawP[i] = Math.floor(Math.random() * 256)

const perm: number[] = new Array(512)
const permMod12: number[] = new Array(512)
for (let i = 0; i < 512; i++) {
  perm[i] = rawP[i & 255]
  permMod12[i] = perm[i] % 12
}

function dot2(g: [number, number, number], x: number, y: number): number {
  return g[0] * x + g[1] * y
}

function dot3(g: [number, number, number], x: number, y: number, z: number): number {
  return g[0] * x + g[1] * y + g[2] * z
}

export function simplex2(xin: number, yin: number): number {
  const F2 = 0.5 * (Math.sqrt(3) - 1)
  const G2 = (3 - Math.sqrt(3)) / 6
  const s = (xin + yin) * F2
  const i = Math.floor(xin + s)
  const j = Math.floor(yin + s)
  const t = (i + j) * G2
  const x0 = xin - (i - t)
  const y0 = yin - (j - t)
  const i1 = x0 > y0 ? 1 : 0
  const j1 = x0 > y0 ? 0 : 1
  const x1 = x0 - i1 + G2
  const y1 = y0 - j1 + G2
  const x2 = x0 - 1 + 2 * G2
  const y2 = y0 - 1 + 2 * G2
  const ii = i & 255
  const jj = j & 255
  const gi0 = permMod12[ii + perm[jj]]
  const gi1 = permMod12[ii + i1 + perm[jj + j1]]
  const gi2 = permMod12[ii + 1 + perm[jj + 1]]
  let t0 = 0.5 - x0 * x0 - y0 * y0
  const n0 = t0 < 0 ? 0 : ((t0 *= t0), t0 * t0 * dot2(grad3[gi0], x0, y0))
  let t1 = 0.5 - x1 * x1 - y1 * y1
  const n1 = t1 < 0 ? 0 : ((t1 *= t1), t1 * t1 * dot2(grad3[gi1], x1, y1))
  let t2 = 0.5 - x2 * x2 - y2 * y2
  const n2 = t2 < 0 ? 0 : ((t2 *= t2), t2 * t2 * dot2(grad3[gi2], x2, y2))
  return 70 * (n0 + n1 + n2)
}

export function simplex3(xin: number, yin: number, zin: number): number {
  const F3 = 1 / 3
  const G3 = 1 / 6
  const s = (xin + yin + zin) * F3
  const i = Math.floor(xin + s)
  const j = Math.floor(yin + s)
  const k = Math.floor(zin + s)
  const t = (i + j + k) * G3
  const x0 = xin - (i - t)
  const y0 = yin - (j - t)
  const z0 = zin - (k - t)

  let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number
  if (x0 >= y0) {
    if (y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0 }
    else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1 }
    else               { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1 }
  } else {
    if (y0 < z0)       { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1 }
    else if (x0 < z0)  { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1 }
    else               { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0 }
  }

  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3
  const x2 = x0 - i2 + 2*G3, y2 = y0 - j2 + 2*G3, z2 = z0 - k2 + 2*G3
  const x3 = x0 - 1 + 3*G3, y3 = y0 - 1 + 3*G3, z3 = z0 - 1 + 3*G3

  const ii = i & 255, jj = j & 255, kk = k & 255
  const gi0 = permMod12[ii + perm[jj + perm[kk]]]
  const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]]
  const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]]
  const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]]

  let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0
  const n0 = t0 < 0 ? 0 : ((t0 *= t0), t0 * t0 * dot3(grad3[gi0], x0, y0, z0))
  let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1
  const n1 = t1 < 0 ? 0 : ((t1 *= t1), t1 * t1 * dot3(grad3[gi1], x1, y1, z1))
  let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2
  const n2 = t2 < 0 ? 0 : ((t2 *= t2), t2 * t2 * dot3(grad3[gi2], x2, y2, z2))
  let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3
  const n3 = t3 < 0 ? 0 : ((t3 *= t3), t3 * t3 * dot3(grad3[gi3], x3, y3, z3))

  return 32 * (n0 + n1 + n2 + n3)
}
