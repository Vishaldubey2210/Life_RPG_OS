// Web Audio API Procedural Ambient Sound Synthesizer

export type AmbientSoundType = 'rain' | 'ocean' | 'forest' | 'silent'

let audioCtx: AudioContext | null = null
let activeSourceNode: AudioNode | null = null
let gainNode: GainNode | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playAmbientSound(type: AmbientSoundType, volume = 0.3) {
  stopAmbientSound()
  if (type === 'silent' || typeof window === 'undefined') return

  try {
    const ctx = getAudioContext()
    gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.connect(ctx.destination)

    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'rain') {
      // Pink-ish noise with low-pass filter
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1000, ctx.currentTime)

      noise.connect(filter)
      filter.connect(gainNode)
      noise.start()
      activeSourceNode = noise
    } else if (type === 'ocean') {
      // Brown noise with undulating LFO
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = data[i]
        data[i] *= 1.5
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(450, ctx.currentTime)

      noise.connect(filter)
      filter.connect(gainNode)
      noise.start()
      activeSourceNode = noise
    } else if (type === 'forest') {
      // Gentle wind breeze / high air
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true

      const bandpass = ctx.createBiquadFilter()
      bandpass.type = 'bandpass'
      bandpass.frequency.setValueAtTime(800, ctx.currentTime)
      bandpass.Q.setValueAtTime(1.5, ctx.currentTime)

      noise.connect(bandpass)
      bandpass.connect(gainNode)
      noise.start()
      activeSourceNode = noise
    }
  } catch (err) {
    console.error('Ambient audio error:', err)
  }
}

export function stopAmbientSound() {
  try {
    if (activeSourceNode) {
      (activeSourceNode as AudioBufferSourceNode).stop?.()
      activeSourceNode.disconnect()
      activeSourceNode = null
    }
    if (gainNode) {
      gainNode.disconnect()
      gainNode = null
    }
  } catch {
    // Ignore audio disconnect errors
  }
}
