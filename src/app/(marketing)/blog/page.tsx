import { BookOpen } from 'lucide-react'

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-white">
      <div className="rounded-3xl border border-slate-800 bg-[#101018] p-10 text-center shadow-xl shadow-purple-900/10">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-bold">The Life RPG Blog — Coming Soon</h1>
        <p className="mt-4 text-slate-300">Get notified when we publish.</p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-slate-700 bg-[#0d0d15] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
          <button type="submit" className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white">
            Notify Me
          </button>
        </form>
      </div>
    </main>
  )
}
