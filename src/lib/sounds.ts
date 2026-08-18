export function playQuestComplete() {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return

  const audioCtx = new AudioCtx()
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime)
  oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1)
  oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5)

  oscillator.start(audioCtx.currentTime)
  oscillator.stop(audioCtx.currentTime + 0.5)
}

export function playLevelUp() {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return

  const audioCtx = new AudioCtx()
  const notes = [261.63, 329.63, 392.0, 523.25, 659.25]

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime + i * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.3)
    osc.start(audioCtx.currentTime + i * 0.1)
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.3)
  })
}

export function playStreakMilestone() {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return

  const audioCtx = new AudioCtx()
  const notes = [392.0, 523.25, 659.25]

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.28, audioCtx.currentTime + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.25)
    osc.start(audioCtx.currentTime + i * 0.08)
    osc.stop(audioCtx.currentTime + i * 0.08 + 0.25)
  })
}
