'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Feedback {
  id: string
  feedback_type: string
  title: string
  status: string
  created_at: string
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    async function loadFeedback() {
      try {
        const { data } = await supabase
          .from('feedback')
          .select('id, feedback_type, title, status, created_at')
          .order('created_at', { ascending: false })

        setFeedback(data || [])
      } catch (error) {
        console.error('Error loading feedback:', error)
        setFeedback([])
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [])

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    const supabase = createClient()
    if (!supabase) return

    try {
      await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', feedbackId)

      setFeedback(feedback.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f))
    } catch (error) {
      console.error('Error updating feedback:', error)
    }
  }

  const statusOptions = ['open', 'reviewing', 'acknowledged', 'closed']
  const typeColorMap = {
    bug: 'bg-red-500/15 text-red-300',
    feature: 'bg-blue-500/15 text-blue-300',
    feedback: 'bg-slate-500/15 text-slate-300',
    praise: 'bg-emerald-500/15 text-emerald-300',
    feature_request: 'bg-blue-500/15 text-blue-300',
    general: 'bg-slate-500/15 text-slate-300',
    complaint: 'bg-amber-500/15 text-amber-300',
  }
  const statusColorMap = {
    open: 'bg-red-500/15 text-red-300',
    reviewing: 'bg-yellow-500/15 text-yellow-300',
    acknowledged: 'bg-blue-500/15 text-blue-300',
    closed: 'bg-green-500/15 text-green-300',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Feedback</h1>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6 text-slate-300">Loading feedback…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101018]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0d0d15] text-slate-400">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="p-3"><span className={`rounded px-2 py-1 text-xs ${typeColorMap[item.feedback_type as keyof typeof typeColorMap] || 'bg-slate-500/15 text-slate-300'}`}>{item.feedback_type}</span></td>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3">
                    <select 
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`rounded px-2 py-1 text-xs border-0 ${statusColorMap[item.status as keyof typeof statusColorMap] || 'bg-slate-500/15 text-slate-300'} outline-none cursor-pointer`}
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button className="text-xs rounded bg-slate-700 px-2 py-1">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

