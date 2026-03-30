export type BehaviorType = 'schooling' | 'clownfish' | 'deep' | 'shallow'

export interface FishSpecies {
  name: string
  bodyColor: string
  finColor: string
  stripeColor: string | null   // null = no stripes
  stripeCount: number
  size: number                 // base body length in px
  maxSpeed: number
  maxForce: number
  perceptionRadius: number
  separationRadius: number
  preferredDepthMin: number    // 0=surface 1=bottom
  preferredDepthMax: number
  wanderStrengthMin: number
  wanderStrengthMax: number
  wanderFreqMin: number
  wanderFreqMax: number
  count: number
  behavior: BehaviorType
  glowColor: string
}

export const SPECIES: FishSpecies[] = [
  {
    name: 'Clownfish',
    bodyColor: '#e07820',
    finColor: '#c05510',
    stripeColor: '#ffffff',
    stripeCount: 3,
    size: 14,
    maxSpeed: 90,
    maxForce: 160,
    perceptionRadius: 70,
    separationRadius: 30,
    preferredDepthMin: 0.55,
    preferredDepthMax: 0.80,
    wanderStrengthMin: 0.25,
    wanderStrengthMax: 0.55,
    wanderFreqMin: 1.5,
    wanderFreqMax: 3.0,
    count: 7,
    behavior: 'clownfish',
    glowColor: 'rgba(240,140,60,0.25)',
  },
  {
    name: 'Blue Tang',
    bodyColor: '#2a7fc4',
    finColor: '#1a5a9a',
    stripeColor: '#ffd040',
    stripeCount: 1,
    size: 16,
    maxSpeed: 110,
    maxForce: 130,
    perceptionRadius: 100,
    separationRadius: 45,
    preferredDepthMin: 0.30,
    preferredDepthMax: 0.60,
    wanderStrengthMin: 0.15,
    wanderStrengthMax: 0.35,
    wanderFreqMin: 0.5,
    wanderFreqMax: 1.2,
    count: 18,
    behavior: 'schooling',
    glowColor: 'rgba(60,140,220,0.2)',
  },
  {
    name: 'Anthias',
    bodyColor: '#e06040',
    finColor: '#c04020',
    stripeColor: '#ffd080',
    stripeCount: 0,
    size: 11,
    maxSpeed: 140,
    maxForce: 180,
    perceptionRadius: 80,
    separationRadius: 35,
    preferredDepthMin: 0.20,
    preferredDepthMax: 0.50,
    wanderStrengthMin: 0.3,
    wanderStrengthMax: 0.6,
    wanderFreqMin: 1.2,
    wanderFreqMax: 2.5,
    count: 14,
    behavior: 'shallow',
    glowColor: 'rgba(220,100,60,0.2)',
  },
  {
    name: 'Damselfish',
    bodyColor: '#e8c030',
    finColor: '#c8a010',
    stripeColor: null,
    stripeCount: 0,
    size: 10,
    maxSpeed: 100,
    maxForce: 150,
    perceptionRadius: 65,
    separationRadius: 28,
    preferredDepthMin: 0.55,
    preferredDepthMax: 0.75,
    wanderStrengthMin: 0.2,
    wanderStrengthMax: 0.5,
    wanderFreqMin: 0.8,
    wanderFreqMax: 2.0,
    count: 12,
    behavior: 'schooling',
    glowColor: 'rgba(230,190,40,0.2)',
  },
  {
    name: 'Cardinalfish',
    bodyColor: '#c04060',
    finColor: '#a02040',
    stripeColor: '#f0b0b0',
    stripeCount: 2,
    size: 9,
    maxSpeed: 75,
    maxForce: 100,
    perceptionRadius: 60,
    separationRadius: 25,
    preferredDepthMin: 0.65,
    preferredDepthMax: 0.85,
    wanderStrengthMin: 0.1,
    wanderStrengthMax: 0.3,
    wanderFreqMin: 0.4,
    wanderFreqMax: 1.0,
    count: 9,
    behavior: 'deep',
    glowColor: 'rgba(200,60,100,0.2)',
  },
]
