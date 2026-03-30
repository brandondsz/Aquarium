export class Vec2 {
  constructor(public x: number, public y: number) {}

  add(v: Vec2): Vec2 { return new Vec2(this.x + v.x, this.y + v.y) }
  sub(v: Vec2): Vec2 { return new Vec2(this.x - v.x, this.y - v.y) }
  scale(s: number): Vec2 { return new Vec2(this.x * s, this.y * s) }
  clone(): Vec2 { return new Vec2(this.x, this.y) }

  magSq(): number { return this.x * this.x + this.y * this.y }
  mag(): number { return Math.sqrt(this.magSq()) }

  normalize(): Vec2 {
    const m = this.mag()
    return m === 0 ? new Vec2(0, 0) : this.scale(1 / m)
  }

  limit(max: number): Vec2 {
    const m = this.mag()
    return m > max ? this.scale(max / m) : this.clone()
  }

  dist(v: Vec2): number { return this.sub(v).mag() }

  addMut(v: Vec2): void { this.x += v.x; this.y += v.y }
  scaleMut(s: number): void { this.x *= s; this.y *= s }

  limitMut(max: number): void {
    const m = this.mag()
    if (m > max) { this.x *= max / m; this.y *= max / m }
  }
}
