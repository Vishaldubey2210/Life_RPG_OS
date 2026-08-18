'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type ErrorLog = { id: string; error_type: string; error_message: string | null; stack_trace: string | null; url: string | null; severity: string; created_at: string }

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [selected, setSelected] = useState<ErrorLog | null>(null)
  const [severity, setSeverity] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    let query = supabase.from('error_logs').select('id, error_type, error_message, stack_trace, url, severity, created_at').order('created_at', { ascending: false }).limit(100)
    if (severity !== 'all') query = query.eq('severity', severity)
    void (async () => {
      const result = await query
      const data = result.data as ErrorLog[] | null
      if (result.error) toast.error('Could not load error logs.')
      setLogs(data ?? [])
      setLoading(false)
    })()
  }, [severity])

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Error logs</h1><p className="mt-1 text-sm text-slate-400">The latest 100 client-side errors.</p></div><label className="text-sm text-slate-300">Severity <select value={severity} onChange={(event) => { setLoading(true); setSeverity(event.target.value) }} className="ml-2 rounded-lg border border-slate-700 bg-[#101018] px-3 py-2"><option value="all">All</option><option value="critical">Critical</option><option value="error">Error</option><option value="warning">Warning</option><option value="info">Info</option></select></label></div>
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#101018]">{loading ? <p className="p-6 text-slate-300">Loading logs…</p> : logs.length === 0 ? <p className="p-6 text-slate-400">No errors match this filter.</p> : <table className="w-full min-w-[720px] text-left text-sm text-slate-300"><thead className="bg-[#0d0d15] text-slate-400"><tr><th className="p-3">Timestamp</th><th className="p-3">Type</th><th className="p-3">Message</th><th className="p-3">Page</th><th className="p-3">Action</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-slate-800"><td className="p-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td><td className="p-3"><span className="rounded bg-red-500/15 px-2 py-1 text-xs text-red-200">{log.severity}</span><span className="ml-2 text-xs">{log.error_type}</span></td><td className="max-w-sm truncate p-3">{log.error_message ?? 'No message'}</td><td className="max-w-xs truncate p-3 text-slate-400">{log.url ?? '—'}</td><td className="p-3"><button type="button" onClick={() => setSelected(log)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-white">View full</button></td></tr>)}</tbody></table>}</div>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-700 bg-[#101018] p-6"><div className="flex justify-between gap-4"><h2 className="text-xl font-bold">{selected.error_type}</h2><button type="button" onClick={() => setSelected(null)} className="text-slate-300">Close</button></div><p className="mt-4 text-red-200">{selected.error_message}</p><p className="mt-2 break-all text-sm text-slate-400">{selected.url}</p><pre className="mt-5 whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-xs text-slate-300">{selected.stack_trace ?? 'No stack trace was captured.'}</pre></div></div>}
  </div>
}
