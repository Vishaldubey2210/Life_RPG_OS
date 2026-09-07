import { BarChart3 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <BarChart3 size={40} className="animate-pulse" style={{ color: '#7C3AED' }} />
        </div>
        <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
          Compiling your legend...
        </div>
      </div>
    </div>
  )
}

