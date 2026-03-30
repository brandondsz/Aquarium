import { Clock } from './core/Clock'
import { Renderer } from './core/Renderer'
import { World } from './core/World'
import { AudioEngine } from './audio/AudioEngine'

export class App {
  private clock: Clock
  private renderer: Renderer
  private world: World
  private audio: AudioEngine
  private animId = 0

  constructor(canvas: HTMLCanvasElement, overlay: HTMLElement) {
    this.clock = new Clock()
    this.audio = new AudioEngine()
    this.renderer = new Renderer(canvas)

    const W = window.innerWidth
    const H = window.innerHeight
    this.renderer.resize(W, H)
    this.world = new World(W, H, this.audio)

    // Start on click
    const start = () => {
      this.audio.start()
      overlay.classList.add('hidden')
      document.removeEventListener('click', start)
      document.removeEventListener('keydown', start)
    }
    document.addEventListener('click', start)
    document.addEventListener('keydown', start)

    // Resize
    window.addEventListener('resize', () => {
      const nW = window.innerWidth
      const nH = window.innerHeight
      this.renderer.resize(nW, nH)
      this.world.resize(nW, nH)
    })

    this.loop = this.loop.bind(this)
  }

  start(): void {
    this.animId = requestAnimationFrame(this.loop)
  }

  private loop(timestamp: number): void {
    const dt = this.clock.tick(timestamp)
    const elapsed = this.clock.elapsed
    const frame = this.clock.frame

    this.world.update(dt, elapsed)
    this.world.updatePlankton(elapsed, frame)
    this.renderer.drawFrame(this.world, elapsed, frame)

    this.animId = requestAnimationFrame(this.loop)
  }

  stop(): void {
    cancelAnimationFrame(this.animId)
  }
}
