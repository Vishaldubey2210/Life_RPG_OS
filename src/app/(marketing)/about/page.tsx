export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-white">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-purple-300">About</p>
        <h1 className="text-4xl font-bold">Why we built this</h1>
        <p className="text-lg text-slate-300">
          We got tired of habit trackers that felt like homework. We wanted the dopamine hit of a video game, applied to real life.
        </p>
        <p className="text-lg text-slate-300">
          So we built Life RPG OS.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6">
          <h2 className="mb-3 text-2xl font-semibold">The team</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/20 text-2xl">⚔️</div>
            <div>
              <div className="font-semibold">Founder</div>
              <div className="text-slate-400">You</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6">
          <h2 className="mb-3 text-2xl font-semibold">Our mission</h2>
          <p className="text-slate-300">Make self-improvement feel like play.</p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8 text-center">
        <h2 className="text-2xl font-bold">We&apos;re just getting started — join us</h2>
        <a href="/login" className="mt-5 inline-block rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white">Start your quest</a>
      </div>
    </main>
  )
}
