import { Trophy } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
      <div className="text-center">
        <div className="mb-4 flex justify-center animate-pulse" style={{ animation: 'burst-in 0.5s ease' }}>
          <Trophy size={48} style={{ color: '#F59E0B' }} />
        </div>
        <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
          Loading Achievement Hall...
        </div>
      </div>
    </div>
  )
}

