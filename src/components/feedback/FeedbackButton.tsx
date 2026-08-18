'use client'

import { useEffect, useState } from 'react'
import { MessageSquareText, X, Send, Bug, Sparkles, MessageSquare, Heart, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type FeedbackType = 'bug' | 'feature' | 'feedback' | 'praise'

const feedbackMeta: Record<FeedbackType, { label: string; placeholder: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  bug: { label: 'Bug Report', placeholder: 'What happened? What did you expect?', Icon: Bug },
  feature: { label: 'Feature Request', placeholder: 'What would you like to see?', Icon: Sparkles },
  feedback: { label: 'Feedback', placeholder: 'What\'s on your mind?', Icon: MessageSquare },
  praise: { label: 'Love it', placeholder: 'What made you smile today?', Icon: Heart },
}

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('feedback')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase.auth.getUser().then((response: { data: { user: unknown } }) => {
      setIsAuthed(Boolean(response.data.user))
    })
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please share a short title first.')
      return
    }

    const supabase = createClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to send feedback.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        feedback_type: type,
        title: title.trim(),
        body: body.trim() || 'No additional details provided.',
        status: 'open',
      })

      if (error) throw error

      setSent(true)
      setTitle('')
      setBody('')
      setType('feedback')
      toast.success('Thanks! Your feedback helps us level up')
    } catch {
      toast.error('Failed to send feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthed) return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
        }}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 md:bottom-6 hover:bg-purple-500 transition-colors"
      >
        <MessageSquareText size={16} />
        <span>Feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 md:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#13131F] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-white font-display">Help Us Improve</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-300 hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {!sent ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {(Object.keys(feedbackMeta) as FeedbackType[]).map((option) => {
                    const meta = feedbackMeta[option]
                    const IconComp = meta.Icon
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setType(option)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${type === option ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-700 bg-slate-900/50 text-slate-300'}`}
                      >
                        <IconComp size={15} className={type === option ? 'text-purple-400' : 'text-slate-400'} />
                        <span>{meta.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Quick summary"
                      className="w-full rounded-xl border border-slate-700 bg-[#0F0F1A] px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Description</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={feedbackMeta[type].placeholder}
                      rows={5}
                      className="w-full resize-none rounded-xl border border-slate-700 bg-[#0F0F1A] px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white disabled:opacity-60 hover:bg-purple-500 transition-colors"
                  >
                    <Send size={16} />
                    {loading ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center text-green-200">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-3 text-green-400">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-semibold">Thanks! Your feedback helps us level up.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false)
                    setOpen(false)
                  }}
                  className="mt-4 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
