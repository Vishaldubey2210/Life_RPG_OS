'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type ConfigEntry = { key: string; value: unknown; description: string | null }

const labels: Record<string, string> = {
  maintenance_mode: 'Maintenance mode',
  announcement: 'Global announcement banner',
  feature_flags: 'Feature flags',
  rate_limits: 'Rate limits',
}

function formatValue(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export default function AdminConfigPage() {
  const [entries, setEntries] = useState<ConfigEntry[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    void (async () => {
      const result = await supabase.from('app_config').select('key, value, description').order('key')
      const data = result.data as ConfigEntry[] | null
      const { error } = result
        if (error) toast.error('Could not load app configuration.')
        const next = (data ?? []) as ConfigEntry[]
        setEntries(next)
        setDrafts(Object.fromEntries(next.map((entry) => [entry.key, formatValue(entry.value)])))
        setLoading(false)
    })()
  }, [])

  const save = async (entry: ConfigEntry) => {
    try {
      const value = JSON.parse(drafts[entry.key])
      const supabase = createClient()
      if (!supabase) return
      setSaving(entry.key)
      const { error } = await supabase.from('app_config').update({ value }).eq('key', entry.key)
      if (error) throw error
      setEntries((current) => current.map((item) => item.key === entry.key ? { ...item, value } : item))
      toast.success(`${labels[entry.key] ?? entry.key} saved.`)
    } catch {
      toast.error('Enter valid JSON before saving.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">App configuration</h1><p className="mt-1 text-sm text-slate-400">Changes are live as soon as they are saved.</p></div>
      {loading ? <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6 text-slate-300">Loading configuration…</div> : entries.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6 text-slate-400">No configuration entries found. Run <code>supabase-day6-admin.sql</code> first.</div> : (
        <div className="grid gap-5 lg:grid-cols-2">
          {entries.map((entry) => <section key={entry.key} className="rounded-2xl border border-slate-800 bg-[#101018] p-5">
            <h2 className="font-semibold text-white">{labels[entry.key] ?? entry.key}</h2>
            <p className="mt-1 min-h-5 text-sm text-slate-400">{entry.description ?? entry.key}</p>
            <textarea aria-label={`${entry.key} JSON value`} value={drafts[entry.key] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [entry.key]: event.target.value }))} rows={entry.key === 'announcement' ? 6 : 8} className="mt-4 w-full rounded-xl border border-slate-700 bg-[#09090f] p-3 font-mono text-xs text-slate-100 outline-none focus:border-purple-500" />
            <button type="button" onClick={() => save(entry)} disabled={saving === entry.key} className="mt-3 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving === entry.key ? 'Saving…' : 'Save changes'}</button>
          </section>)}
        </div>
      )}
    </div>
  )
}
