// Cute sound effects using Web Audio API
// Modern, soft, and satisfying sounds!

type SoundType = 'pop' | 'chime' | 'celebration' | 'click' | 'success' | 'whoosh' | 'sparkle' | 'toggle' | 'button' | 'send' | 'complete'

class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  isEnabled() {
    return this.enabled
  }

  play(type: SoundType) {
    if (!this.enabled) return
    
    try {
      const ctx = this.getContext()
      
      // Resume context if suspended (needed for autoplay policies)
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      switch (type) {
        case 'pop':
          this.playPop(ctx)
          break
        case 'chime':
          this.playChime(ctx)
          break
        case 'celebration':
          this.playCelebration(ctx)
          break
        case 'click':
          this.playClick(ctx)
          break
        case 'success':
          this.playSuccess(ctx)
          break
        case 'whoosh':
          this.playWhoosh(ctx)
          break
        case 'sparkle':
          this.playSparkle(ctx)
          break
        case 'toggle':
          this.playToggle(ctx)
          break
        case 'button':
          this.playButton(ctx)
          break
        case 'send':
          this.playSend(ctx)
          break
        case 'complete':
          this.playComplete(ctx)
          break
      }
    } catch (e) {
      // Silently fail if audio isn't available
      console.debug('Sound not available:', e)
    }
  }

  // Cute keyboard-style click - for all buttons
  private playButton(ctx: AudioContext) {
    // Create a soft, cute mechanical keyboard-like click
    const osc = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    const gain2 = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    // Main click tone
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04)
    
    // Secondary harmonic for that "keyboard" feel
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(2400, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.03)
    
    // Filter for softer sound
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3000, ctx.currentTime)
    
    osc.connect(gain)
    osc2.connect(gain2)
    gain.connect(filter)
    gain2.connect(filter)
    filter.connect(ctx.destination)
    
    // Quick attack, natural decay - like a key press
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    
    gain2.gain.setValueAtTime(0, ctx.currentTime)
    gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.003)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 0.04)
  }

  // Soft toggle switch sound
  private playToggle(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.06)
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)
  }

  // Send message sound (whoosh + click)
  private playSend(ctx: AudioContext) {
    // Soft whoosh
    const bufferSize = ctx.sampleRate * 0.08
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }
    
    const source = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    
    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2000, ctx.currentTime)
    filter.Q.setValueAtTime(1, ctx.currentTime)
    
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    
    source.start()
    
    // Plus a tiny click at the end
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1500, ctx.currentTime + 0.04)
    
    oscGain.gain.setValueAtTime(0, ctx.currentTime + 0.04)
    oscGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.045)
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(ctx.currentTime + 0.04)
    osc.stop(ctx.currentTime + 0.08)
  }

  // Task complete - satisfying check sound
  private playComplete(ctx: AudioContext) {
    // Soft "check" sound with pleasant tone
    const frequencies = [880, 1108.73, 1318.51] // A5, C#6, E6 - major chord
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.02)
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.02)
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.02 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.02 + 0.15)
      
      osc.start(ctx.currentTime + i * 0.02)
      osc.stop(ctx.currentTime + i * 0.02 + 0.15)
    })
  }

  // Cute pop sound - for task completion (improved)
  private playPop(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    osc.type = 'sine'
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2500, ctx.currentTime)
    
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  }

  // Gentle wind chime - for check-in complete (improved)
  private playChime(ctx: AudioContext) {
    // Soft, dreamy chime - like a music box
    const notes = [
      { freq: 783.99, delay: 0 },      // G5
      { freq: 987.77, delay: 0.08 },   // B5
      { freq: 1174.66, delay: 0.16 },  // D6
      { freq: 1567.98, delay: 0.24 },  // G6
    ]
    
    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const startTime = ctx.currentTime + delay
      osc.frequency.setValueAtTime(freq, startTime)
      
      // Gentle attack for dreamy feel
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)
      
      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })
  }

  // Celebration sound - cute and cheerful (improved)
  private playCelebration(ctx: AudioContext) {
    // Happy little melody - like a tiny victory fanfare
    const melody = [
      { freq: 523.25, delay: 0 },      // C5
      { freq: 659.25, delay: 0.07 },   // E5
      { freq: 783.99, delay: 0.14 },   // G5
      { freq: 1046.50, delay: 0.21 },  // C6
      { freq: 783.99, delay: 0.28 },   // G5
      { freq: 1046.50, delay: 0.35 },  // C6
    ]
    
    melody.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const startTime = ctx.currentTime + delay
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18)
      
      osc.start(startTime)
      osc.stop(startTime + 0.18)
    })
  }

  // Soft click - navigation clicks (improved)
  private playClick(ctx: AudioContext) {
    // Soft, subtle click - like touching a bubble
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.04)
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.04)
  }

  // Success sound - warm and welcoming (improved)
  private playSuccess(ctx: AudioContext) {
    // Warm welcome sound - soft major chord
    const chord = [
      { freq: 523.25, delay: 0 },      // C5
      { freq: 659.25, delay: 0.06 },   // E5
      { freq: 783.99, delay: 0.12 },   // G5
      { freq: 1046.50, delay: 0.18 },  // C6
    ]
    
    chord.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'triangle'  // Warmer tone
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const startTime = ctx.currentTime + delay
      osc.frequency.setValueAtTime(freq, startTime)
      
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35)
      
      osc.start(startTime)
      osc.stop(startTime + 0.35)
    })
  }

  // Whoosh sound - soft transition
  private playWhoosh(ctx: AudioContext) {
    const bufferSize = ctx.sampleRate * 0.12
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    
    const source = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    
    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1500, ctx.currentTime)
    filter.Q.setValueAtTime(0.5, ctx.currentTime)
    
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    
    source.start()
  }

  // Sparkle sound - magical twinkle
  private playSparkle(ctx: AudioContext) {
    const frequencies = [1600, 2000, 2400, 2800, 3200]
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      const startTime = ctx.currentTime + i * 0.02
      osc.frequency.setValueAtTime(freq, startTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, startTime + 0.08)
      
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)
      
      osc.start(startTime)
      osc.stop(startTime + 0.08)
    })
  }
}

// Export singleton instance
export const soundManager = new SoundManager()

// Export types
export type { SoundType }
