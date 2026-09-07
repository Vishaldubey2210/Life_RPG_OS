import { Settings } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
      <div className="text-center">
        <div className="flex justify-center mb-4 text-purple-400">
          <Settings className="w-10 h-10 animate-spin" />
        </div>
        <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>Loading settings...</div>
      </div>
    </div>
  )
}
