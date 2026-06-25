'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: '#08080F' }}>
      <p className="text-4xl">⚠️</p>
      <h2 className="text-xl font-bold font-display" style={{ color: '#F1F0FF' }}>
        Something went wrong
      </h2>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
        style={{ background: '#7C3AED', color: '#fff' }}
      >
        Try Again
      </button>
    </div>
  )
}
