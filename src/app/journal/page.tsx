'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Sparkles,
  Plus,
  Tag,
  Heart,
  Flame,
  X,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

export interface JournalEntry {
  id: string
  entry_date: string
  entry_type: 'quest_reflection' | 'daily_summary' | 'mood_log' | 'weekly_review' | 'free_write'
  content: string
  mood_score?: number
  energy_score?: number
  tags: string[]
  ai_insight?: string
  created_at: string
}

export default function JournalPage() {
  const { profile } = useProfile()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [filterType, setFilterType] = useState<string>('all')

  // Free write modal state
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newMood, setNewMood] = useState(8)
  const [newEnergy, setNewEnergy] = useState(8)
  const [savingEntry, setSavingEntry] = useState(false)

  // AI Weekly Summary State
  const [generatingAI, setGeneratingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadEntries() {
      if (!profile?.id) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', profile.id)
          .order('entry_date', { ascending: false })

        if (!error && data) {
          setEntries(data as JournalEntry[])
        }
      } finally {
        setLoading(false)
      }
    }
    loadEntries()
  }, [profile?.id, supabase])

  async function handleCreateEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id || !newContent.trim()) return

    setSavingEntry(true)
    try {
      const parsedTags = newTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean)

      const entryPayload = {
        user_id: profile.id,
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        entry_type: 'free_write',
        content: newContent.trim(),
        mood_score: newMood,
        energy_score: newEnergy,
        tags: parsedTags.length > 0 ? parsedTags : ['general'],
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entryPayload)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setEntries((prev) => [data as JournalEntry, ...prev])
      }

      toast.success('Journal entry saved! 📝')
      setShowNewEntry(false)
      setNewContent('')
      setNewTags('')
    } catch (err) {
      console.error('Error creating entry:', err)
      toast.error('Failed to save journal entry')
    } finally {
      setSavingEntry(false)
    }
  }

  async function handleGenerateAISummary() {
    if (!profile?.id || entries.length === 0) {
      toast.error('Log some journal entries first for AI analysis!')
      return
    }

    setGeneratingAI(true)
    try {
      const recentEntries = entries.slice(0, 10).map((e) => `[${e.entry_date} - ${e.entry_type}]: ${e.content}`)
      
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analyze my recent journal entries and generate a crisp "Weekly Review in 3 Insights":
1. This week's core theme / momentum
2. Key energy & mood driver
3. High-leverage focus for next week

Entries:
${recentEntries.join('\n\n')}`,
            },
          ],
        }),
      })

      if (!res.ok) throw new Error('AI summary failed')

      const reader = res.body?.getReader()
      if (!reader) return

      let accumulated = ''
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setAiSummary(accumulated)
      }
    } catch (err) {
      console.error('AI summary error:', err)
      toast.error('Could not generate summary')
    } finally {
      setGeneratingAI(false)
    }
  }

  // Calendar dates calculation
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const filteredEntries = filterType === 'all'
    ? entries
    : entries.filter((e) => e.entry_type === filterType)

  return (
    <div className="flex min-h-screen bg-[#08080F]">
      <Sidebar />

      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-7xl mx-auto pb-24">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-display mb-1.5">
              <BookOpen size={14} />
              <span>Chronicles & Reflections</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display tracking-tight">
              Adventurer&apos;s Journal
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Capture your mental state, calibrate daily learnings, and discover what fuels your stats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAISummary}
              disabled={generatingAI}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-2 font-display transition-colors disabled:opacity-60"
            >
              <Sparkles size={14} />
              <span>{generatingAI ? 'Analyzing...' : 'AI Weekly Review'}</span>
            </button>

            <button
              onClick={() => setShowNewEntry(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-2 font-display transition-colors shadow-lg shadow-purple-900/40"
            >
              <Plus size={15} />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* AI Insight Box (if generated) */}
        {aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-100 shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold font-display text-amber-400 text-sm">
                <Sparkles size={16} />
                <span>AI Coach Weekly Intelligence</span>
              </div>
              <button
                onClick={() => setAiSummary(null)}
                className="p-1 rounded-lg text-amber-400/80 hover:text-amber-200"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-xs leading-relaxed whitespace-pre-line text-slate-200">
              {aiSummary}
            </div>
          </motion.div>
        )}

        {/* Monthly Calendar View */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-[#13131F] mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-bold font-display text-white text-sm">
              <Calendar size={16} className="text-purple-400" />
              <span>{format(currentMonth, 'MMMM yyyy')}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-500 font-display">
                {d}
              </span>
            ))}

            {daysInMonth.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const dayEntries = entries.filter((e) => e.entry_date === dayStr)
              const hasEntries = dayEntries.length > 0
              const isSelected = isSameDay(day, selectedDate)

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'border-2 border-purple-500 bg-purple-500/20 text-white font-bold'
                      : hasEntries
                      ? 'border border-green-500/30 bg-green-500/10 text-green-300'
                      : 'border border-slate-800/80 bg-[#0F0F1A] text-slate-500'
                  }`}
                >
                  <span>{format(day, 'd')}</span>
                  {hasEntries && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter size={12} /> Filter:
            </span>
            {[
              { key: 'all', label: 'All Entries' },
              { key: 'free_write', label: 'Free Writes' },
              { key: 'quest_reflection', label: 'Quest Reflections' },
              { key: 'daily_summary', label: 'Daily Summaries' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === f.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-display">
            {filteredEntries.length} logged entries
          </span>
        </div>

        {/* Entries Stream */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-purple-500" />
            <p className="text-xs">Loading journal chronicles...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#13131F]">
            <BookOpen size={36} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white font-display mb-1">
              No entries logged yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Reflect on completed quests or write your thoughts to fuel your AI Coach with personal insights.
            </p>
            <button
              onClick={() => setShowNewEntry(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500"
            >
              Write First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border border-slate-800 bg-[#13131F] hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-display">
                      {entry.entry_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {entry.entry_date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.mood_score && (
                      <span className="text-xs font-semibold text-pink-400 flex items-center gap-1">
                        <Heart size={12} /> {entry.mood_score}/10
                      </span>
                    )}
                    {entry.energy_score && (
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <Flame size={12} /> {entry.energy_score}/10
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed mb-3">
                  {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
                    <Tag size={12} className="text-slate-500" />
                    {entry.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Free Write Modal */}
        <AnimatePresence>
          {showNewEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#13131F] p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white font-display">
                    New Journal Chronicle
                  </h3>
                  <button
                    onClick={() => setShowNewEntry(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      What&apos;s on your mind?
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Write freely... struggles, reflections, wins, or ideas."
                      className="w-full p-3 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g. gym, deepwork, mindset, exams"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Mood Score</span>
                        <span className="text-pink-400 font-bold">{newMood}/10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={newMood}
                        onChange={(e) => setNewMood(Number(e.target.value))}
                        className="w-full accent-pink-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Energy Level</span>
                        <span className="text-amber-400 font-bold">{newEnergy}/10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={newEnergy}
                        onChange={(e) => setNewEnergy(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewEntry(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEntry}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 font-display"
                    >
                      <Send size={15} />
                      <span>{savingEntry ? 'Saving...' : 'Save Entry'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
