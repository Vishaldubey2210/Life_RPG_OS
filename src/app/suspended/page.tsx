'use client'

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080F] px-6 text-center text-white">
      <div className="max-w-xl space-y-4 rounded-2xl border border-red-500/30 bg-[#101018] p-8">
        <div className="text-6xl">🚫</div>
        <h1 className="text-4xl font-bold">Your account has been suspended</h1>
        <p className="text-slate-300">Contact support@life-rpg-os.com to appeal this decision.</p>
        <button
          type="button"
          onClick={() => {
            window.location.href = '/login'
          }}
          className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
