export class Clock {
  private lastTime = 0
  elapsed = 0
  frame = 0

  tick(timestamp: number): number {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05)
    this.lastTime = timestamp
    this.elapsed += dt
    this.frame++
    return dt
  }
}
