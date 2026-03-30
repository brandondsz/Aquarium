export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private bubblePool: Array<{ osc: OscillatorNode; gain: GainNode }> = []
  private bubbleIdx = 0
  started = false

  start(): void {
    if (this.started) return
    this.started = true
    this.ctx = new AudioContext()
    this.buildGraph()
  }

  private buildGraph(): void {
    const ctx = this.ctx!

    // Master chain
    this.master = ctx.createGain()
    this.master.gain.value = 0.0

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.ratio.value = 4

    this.filterNode = ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.value = 700
    this.filterNode.Q.value = 0.5

    // Reverb via convolver
    const convolver = ctx.createConvolver()
    convolver.buffer = this.makeReverb(ctx, 3.5)

    // Signal flow: sources → convolver → filter → compressor → master → dest
    convolver.connect(this.filterNode)
    this.filterNode.connect(compressor)
    compressor.connect(this.master)
    this.master.connect(ctx.destination)

    // Drone 1 — A1 55 Hz
    this.makeDrone(ctx, convolver, 55.0, 0.13)
    // Drone 2 — E2 82.4 Hz (perfect fifth)
    this.makeDrone(ctx, convolver, 82.4, 0.10)

    // Harmonics
    const harmonics = [110, 165, 220, 293]
    harmonics.forEach(freq => this.makeHarmonic(ctx, convolver, freq, 0.04))

    // Water noise
    this.makeWaterNoise(ctx, convolver)

    // Bubble pool
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 400
      const g = ctx.createGain()
      g.gain.value = 0
      osc.connect(g)
      g.connect(convolver)
      osc.start()
      this.bubblePool.push({ osc, gain: g })
    }

    // Fade in
    this.master.gain.setTargetAtTime(0.7, ctx.currentTime, 2.0)
  }

  private makeDrone(ctx: AudioContext, dest: AudioNode, freq: number, amp: number): void {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq

    // Slight frequency wobble for beating
    const freqLFO = ctx.createOscillator()
    freqLFO.type = 'sine'
    freqLFO.frequency.value = 0.04
    const freqLFOGain = ctx.createGain()
    freqLFOGain.gain.value = 0.4
    freqLFO.connect(freqLFOGain)
    freqLFOGain.connect(osc.frequency)
    freqLFO.start()

    const gain = ctx.createGain()
    gain.gain.value = 0

    // Amplitude LFO — "breathing"
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = amp * 0.4
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    lfo.start()

    gain.gain.setTargetAtTime(amp, ctx.currentTime, 0.5)
    osc.connect(gain)
    gain.connect(dest)
    osc.start()
  }

  private makeHarmonic(ctx: AudioContext, dest: AudioNode, freq: number, amp: number): void {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.value = amp
    osc.connect(gain)
    gain.connect(dest)
    osc.start()
  }

  private makeWaterNoise(ctx: AudioContext, dest: AudioNode): void {
    const bufLen = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1)

    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    filter.Q.value = 0.8

    // Slow modulation of filter cutoff
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.025
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 120
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    const gain = ctx.createGain()
    gain.gain.value = 0.055

    src.connect(filter)
    filter.connect(gain)
    gain.connect(dest)
    src.start()
  }

  private makeReverb(ctx: AudioContext, decaySecs: number): AudioBuffer {
    const rate = ctx.sampleRate
    const len = rate * decaySecs
    const buf = ctx.createBuffer(2, len, rate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8)
      }
    }
    return buf
  }

  triggerBubble(): void {
    if (!this.ctx || !this.started) return
    const entry = this.bubblePool[this.bubbleIdx % this.bubblePool.length]
    this.bubbleIdx++
    const freq = 300 + Math.random() * 600
    entry.osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    entry.gain.gain.cancelScheduledValues(this.ctx.currentTime)
    entry.gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
    entry.gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1)
  }
}
