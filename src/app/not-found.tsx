import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6" style={{ background: '#08080F', color: '#F1F0FF' }}>
      <div className="text-center">
        <p className="text-6xl mb-4">🗺️</p>
        <h2 className="text-3xl font-bold font-display mb-2" style={{ color: '#F1F0FF' }}>
          404 — Quest Not Found ⚔️
        </h2>
        <p className="text-sm" style={{ color: '#9B99B8' }}>
          This page doesn&apos;t exist in your adventure. You might have wandered off the map.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-xl font-bold transition-all duration-200"
        style={{
          background: '#7C3AED',
          color: '#fff',
          fontFamily: 'Oxanium, sans-serif',
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
