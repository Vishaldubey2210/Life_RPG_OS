export default function QuestsLoading() {
  return (
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      {/* Sidebar skeleton */}
      <div
        className="fixed top-0 left-0 h-full"
        style={{ width: 240, background: '#0F0F1A', borderRight: '1px solid #1E1E35' }}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-9 w-56 rounded-xl animate-pulse" style={{ background: '#1E1E35' }} />
              <div className="h-4 w-40 rounded animate-pulse" style={{ background: '#1E1E35' }} />
            </div>
            <div className="h-11 w-36 rounded-xl animate-pulse" style={{ background: '#1E1E35' }} />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="h-10 w-36 rounded-xl animate-pulse" style={{ background: '#1E1E35' }} />
            <div className="h-10 w-36 rounded-xl animate-pulse" style={{ background: '#1E1E35' }} />
          </div>

          {/* Cards skeleton */}
          {[1, 2, 3].map((g) => (
            <div key={g} className="mb-6">
              <div className="h-7 w-32 rounded mb-3 animate-pulse" style={{ background: '#1E1E35' }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl p-5 flex items-start gap-4 animate-pulse"
                    style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: '#1E1E35' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 rounded" style={{ background: '#1E1E35' }} />
                      <div className="h-3 w-1/2 rounded" style={{ background: '#1E1E35' }} />
                      <div className="flex gap-2 mt-2">
                        <div className="h-5 w-16 rounded-full" style={{ background: '#1E1E35' }} />
                        <div className="h-5 w-12 rounded-full" style={{ background: '#1E1E35' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
