export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse" style={{ animation: 'burst-in 0.5s ease' }}>🏆</div>
        <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
          Loading Achievement Hall...
        </div>
      </div>
    </div>
  )
}
