import { BoidSchool } from '../entities/fish/BoidSchool'
import { SPECIES } from '../entities/fish/FishSpecies'
import { Jellyfish } from '../entities/creatures/Jellyfish'
import { Seahorse } from '../entities/creatures/Seahorse'
import { Coral } from '../entities/environment/Coral'
import { Rock } from '../entities/environment/Rock'
import { Seaweed } from '../entities/environment/Seaweed'
import { SandFloor } from '../entities/environment/SandFloor'
import { CausticRays } from '../fx/CausticRays'
import { Bubbles } from '../fx/Bubbles'
import { Plankton } from '../fx/Plankton'
import { WaterSurface } from '../fx/WaterSurface'
import { DepthFog } from '../fx/DepthFog'
import { rand } from '../math/utils'
import type { AudioEngine } from '../audio/AudioEngine'

export class World {
  W: number
  H: number

  schools: BoidSchool[]
  jellyfish: Jellyfish[]
  seahorse: Seahorse
  coral: Coral
  rock: Rock
  seaweed: Seaweed
  sand: SandFloor

  causticRays: CausticRays
  bubbles: Bubbles
  plankton: Plankton
  waterSurface: WaterSurface
  depthFog: DepthFog

  private audio: AudioEngine

  constructor(W: number, H: number, audio: AudioEngine) {
    this.W = W
    this.H = H
    this.audio = audio

    // Environment
    this.coral = new Coral(W, H)
    this.rock = new Rock(W, H)
    this.seaweed = new Seaweed(W, H)
    this.sand = new SandFloor(W, H)

    // Fish schools
    this.schools = SPECIES.map(sp => new BoidSchool(sp, W, H, 0))

    // Set clownfish homes
    const homes = this.coral.getClownfishHomes()
    const clownSchool = this.schools.find(s => s.species.behavior === 'clownfish')
    if (clownSchool && homes.length > 0) {
      clownSchool.setHome(homes[0].x, homes[0].y)
    }

    // Jellyfish
    this.jellyfish = []
    for (let i = 0; i < 3; i++) {
      this.jellyfish.push(new Jellyfish(rand(W * 0.15, W * 0.85), rand(H * 0.12, H * 0.65), W, H))
    }

    // Seahorse
    this.seahorse = new Seahorse(rand(W * 0.3, W * 0.7), rand(H * 0.35, H * 0.65))

    // FX
    this.causticRays = new CausticRays()
    this.bubbles = new Bubbles(W, H)
    this.plankton = new Plankton(W, H)
    this.waterSurface = new WaterSurface()
    this.depthFog = new DepthFog()

    // Wire bubble sources
    const coralSources = this.coral.getTipBubbleSources()
    this.bubbles.setSources(coralSources)
    this.bubbles.onBubblePop(() => this.audio.triggerBubble())
  }

  update(dt: number, elapsed: number): void {
    for (const s of this.schools) s.update(dt, elapsed, this.W, this.H)
    for (const j of this.jellyfish) j.update(dt, elapsed, this.W, this.H)
    this.seahorse.update(dt, elapsed, this.W, this.H)
    this.bubbles.update(dt, elapsed)
  }

  updatePlankton(elapsed: number, frame: number): void {
    this.plankton.update(elapsed, frame)
  }

  resize(W: number, H: number): void {
    this.W = W
    this.H = H
    this.sand.resize(W, H)
    // Recreate world elements proportionally would be complex; simpler to rebuild
    const newWorld = new World(W, H, this.audio)
    Object.assign(this, newWorld)
  }
}
