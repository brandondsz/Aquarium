// Time-of-day lighting system.
// Reads the real system clock and interpolates between lighting presets.

export interface LightPreset {
  // Background gradient stops [position, color]
  bgStops: Array<[number, string]>
  // Full-screen tint overlay
  tintColor: string
  tintAlpha: number
  // Caustic ray intensity multiplier 0–1
  causticIntensity: number
  // Mid-water ambient glow
  glowColor: string
  glowAlpha: number
  // Surface color tint
  surfaceTint: string
  // Name label shown in overlay
  label: string
}

// Keyed by hour (0–23) — these are representative anchors
const PRESETS: Array<{ hour: number; p: LightPreset }> = [
  {
    hour: 0,
    p: {
      label: 'Deep Night',
      bgStops: [[0,'#030508'],[0.08,'#050a12'],[0.35,'#060c18'],[0.65,'#070e1a'],[0.85,'#050b14'],[1,'#030609']],
      tintColor: 'rgba(5,8,30,1)',
      tintAlpha: 0.28,
      causticIntensity: 0.06,
      glowColor: 'rgba(20,40,100,0.08)',
      glowAlpha: 0.08,
      surfaceTint: '#040812',
    },
  },
  {
    hour: 4,
    p: {
      label: 'Pre-Dawn',
      bgStops: [[0,'#060510'],[0.08,'#0c0820'],[0.35,'#120a28'],[0.65,'#140c2a'],[0.85,'#0a0a1e'],[1,'#060610']],
      tintColor: 'rgba(40,10,60,1)',
      tintAlpha: 0.22,
      causticIntensity: 0.1,
      glowColor: 'rgba(60,20,100,0.10)',
      glowAlpha: 0.10,
      surfaceTint: '#0a0820',
    },
  },
  {
    hour: 6,
    p: {
      label: 'Dawn',
      bgStops: [[0,'#0f0818'],[0.08,'#1a0d28'],[0.35,'#200e30'],[0.65,'#1a1030'],[0.85,'#100c24'],[1,'#080814']],
      tintColor: 'rgba(120,40,80,1)',
      tintAlpha: 0.18,
      causticIntensity: 0.3,
      glowColor: 'rgba(160,60,100,0.12)',
      glowAlpha: 0.12,
      surfaceTint: '#3a1428',
    },
  },
  {
    hour: 7,
    p: {
      label: 'Sunrise',
      bgStops: [[0,'#120a10'],[0.08,'#1e1015'],[0.35,'#251520'],[0.65,'#1e1a30'],[0.85,'#141828'],[1,'#0a0e18']],
      tintColor: 'rgba(180,80,30,1)',
      tintAlpha: 0.16,
      causticIntensity: 0.5,
      glowColor: 'rgba(200,100,40,0.14)',
      glowAlpha: 0.14,
      surfaceTint: '#602010',
    },
  },
  {
    hour: 9,
    p: {
      label: 'Morning',
      bgStops: [[0,'#0a0e18'],[0.08,'#0d1828'],[0.35,'#0e2035'],[0.65,'#102838'],[0.85,'#152e40'],[1,'#0a1420']],
      tintColor: 'rgba(80,60,20,1)',
      tintAlpha: 0.10,
      causticIntensity: 0.75,
      glowColor: 'rgba(80,120,160,0.12)',
      glowAlpha: 0.12,
      surfaceTint: '#2a3845',
    },
  },
  {
    hour: 11,
    p: {
      label: 'Midday',
      bgStops: [[0,'#0a0f1a'],[0.08,'#0d1e30'],[0.35,'#0d2033'],[0.65,'#0f2a3a'],[0.80,'#1a3a45'],[1,'#0a1520']],
      tintColor: 'rgba(20,60,100,1)',
      tintAlpha: 0.05,
      causticIntensity: 1.0,
      glowColor: 'rgba(20,70,100,0.14)',
      glowAlpha: 0.14,
      surfaceTint: '#4a9ab5',
    },
  },
  {
    hour: 14,
    p: {
      label: 'Afternoon',
      bgStops: [[0,'#0b0e18'],[0.08,'#0e1c2e'],[0.35,'#101e32'],[0.65,'#12263a'],[0.80,'#182e40'],[1,'#0a1320']],
      tintColor: 'rgba(100,70,20,1)',
      tintAlpha: 0.10,
      causticIntensity: 0.88,
      glowColor: 'rgba(120,90,30,0.11)',
      glowAlpha: 0.11,
      surfaceTint: '#3a7888',
    },
  },
  {
    hour: 17,
    p: {
      label: 'Golden Hour',
      bgStops: [[0,'#120a08'],[0.08,'#1e100a'],[0.35,'#22140c'],[0.65,'#1a1820'],[0.80,'#141420'],[1,'#080c16']],
      tintColor: 'rgba(180,80,20,1)',
      tintAlpha: 0.20,
      causticIntensity: 0.55,
      glowColor: 'rgba(200,100,30,0.16)',
      glowAlpha: 0.16,
      surfaceTint: '#803010',
    },
  },
  {
    hour: 19,
    p: {
      label: 'Sunset',
      bgStops: [[0,'#150608'],[0.08,'#240808'],[0.35,'#2a0c0a'],[0.65,'#1a0e18'],[0.80,'#100d20'],[1,'#070814']],
      tintColor: 'rgba(160,40,10,1)',
      tintAlpha: 0.24,
      causticIntensity: 0.28,
      glowColor: 'rgba(180,60,20,0.18)',
      glowAlpha: 0.18,
      surfaceTint: '#601008',
    },
  },
  {
    hour: 20.5,
    p: {
      label: 'Dusk',
      bgStops: [[0,'#080510'],[0.08,'#0e0818'],[0.35,'#120a22'],[0.65,'#100c20'],[0.80,'#090a18'],[1,'#050810']],
      tintColor: 'rgba(50,15,70,1)',
      tintAlpha: 0.26,
      causticIntensity: 0.14,
      glowColor: 'rgba(60,20,90,0.12)',
      glowAlpha: 0.12,
      surfaceTint: '#200830',
    },
  },
  {
    hour: 22,
    p: {
      label: 'Night',
      bgStops: [[0,'#040608'],[0.08,'#060a12'],[0.35,'#070c18'],[0.65,'#070d1a'],[0.85,'#060a14'],[1,'#040709']],
      tintColor: 'rgba(5,8,30,1)',
      tintAlpha: 0.26,
      causticIntensity: 0.07,
      glowColor: 'rgba(15,30,80,0.08)',
      glowAlpha: 0.08,
      surfaceTint: '#030810',
    },
  },
]

function lerpPresets(a: LightPreset, b: LightPreset, t: number): LightPreset {
  // Lerp numeric values
  const causticIntensity = a.causticIntensity + (b.causticIntensity - a.causticIntensity) * t
  const tintAlpha = a.tintAlpha + (b.tintAlpha - a.tintAlpha) * t
  const glowAlpha = a.glowAlpha + (b.glowAlpha - a.glowAlpha) * t

  // For colors, just crossfade them as overlay
  // We use whichever preset dominates and blend the alpha
  const dominant = t < 0.5 ? a : b
  return {
    label: dominant.label,
    bgStops: t < 0.5 ? a.bgStops : b.bgStops,
    tintColor: a.tintColor,
    tintAlpha,
    causticIntensity,
    glowColor: a.glowColor,
    glowAlpha,
    surfaceTint: dominant.surfaceTint,
  }
}

let _cachedPreset: LightPreset | null = null
let _cacheTimestamp = 0

export function getLighting(): LightPreset {
  const now = Date.now()
  if (_cachedPreset && now - _cacheTimestamp < 30_000) return _cachedPreset
  _cacheTimestamp = now

  const d = new Date(now)
  const hour = d.getHours() + d.getMinutes() / 60

  // Find surrounding presets
  const sorted = PRESETS
  let i = sorted.length - 1
  for (let k = 0; k < sorted.length; k++) {
    if (sorted[k].hour > hour) { i = k - 1; break }
  }
  const prev = sorted[Math.max(0, i)]
  const next = sorted[Math.min(sorted.length - 1, i + 1)]

  if (prev === next) return prev.p

  const range = next.hour - prev.hour
  const t = range <= 0 ? 0 : (hour - prev.hour) / range

  _cachedPreset = lerpPresets(prev.p, next.p, Math.max(0, Math.min(1, t)))
  return _cachedPreset
}

export function getLightingLabel(): string {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 || 12
  const mm = m.toString().padStart(2, '0')
  return `${hh}:${mm} ${ampm}`
}
