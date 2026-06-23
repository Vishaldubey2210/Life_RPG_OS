'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import WeeklyReportModal from '@/components/coach/WeeklyReportModal'
import { useProfile } from '@/hooks/useProfile'

const SUGGESTED_QUESTIONS = [
  { text: 'What should I focus on this week?', icon: '🎯' },
  { text: 'Why am I losing motivation?', icon: '💭' },
  { text: 'Give me a 7-day boss battle challenge', icon: '🏆' },
  { text: 'What stat am I neglecting?', icon: '📊' },
  { text: 'How close am I to leveling up?', icon: '⚡' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: '#7C3AED' }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  )
}

interface ChatBubbleProps {
  message: Message
  isLatest: boolean
}

function ChatBubble({ message, isLatest }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-1"
          style={{ background: '#7C3AED22', border: '1px solid #7C3AED44' }}
        >
          🤖
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isLatest && !isUser ? 'rounded-tl-sm' : ''
        } ${isLatest && isUser ? 'rounded-tr-sm' : ''}`}
        style={
          isUser
            ? { background: '#7C3AED', color: '#F1F0FF' }
            : {
                background: '#1A1A2E',
                color: '#C4C2D8',
                borderLeft: '2px solid #7C3AED',
              }
        }
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  )
}

export default function CoachPage() {
  const { profile, stats, habits, loading } = useProfile()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome, adventurer! 🤖⚔️\n\nI'm your AI Life Coach — I have full visibility into your stats, quests, and progress. Ask me anything: strategy, motivation, next steps, or why that one quest is still on your board after 3 days.\n\nWhat's on your mind?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming, scrollToBottom])

  function autoResize() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  async function sendMessage(text?: string) {
    const content = text ?? input.trim()
    if (!content || isStreaming) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsStreaming(true)

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let assistantText = ''

      // Add placeholder
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Coach is unavailable. Check your ANTHROPIC_API_KEY.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ I seem to be offline right now. Make sure `ANTHROPIC_API_KEY` is set in `.env.local`.',
        },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  async function generateWeeklyReport() {
    setShowReport(true)
    setReportLoading(true)
    try {
      const res = await fetch('/api/coach/weekly-report', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReportText(data.report)
    } catch {
      toast.error('Failed to generate report')
      setReportText('')
    } finally {
      setReportLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const statEntries = [
    { label: 'STR', icon: '💪', color: '#EF4444', val: stats?.str ?? 0 },
    { label: 'INT', icon: '🧠', color: '#3B82F6', val: stats?.int ?? 0 },
    { label: 'WIS', icon: '🧘', color: '#8B5CF6', val: stats?.wis ?? 0 },
    { label: 'VIT', icon: '❤️', color: '#22C55E', val: stats?.vit ?? 0 },
    { label: 'GOLD', icon: '💰', color: '#F59E0B', val: stats?.gold ?? 0 },
    { label: 'CHA', icon: '🗣️', color: '#EC4899', val: stats?.cha ?? 0 },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <div className="flex-1 flex overflow-hidden" style={{ marginLeft: 240, height: '100vh' }}>
        {/* Left sidebar (desktop) */}
        <div
          className="hidden lg:flex flex-col w-72 flex-shrink-0 overflow-y-auto p-5 gap-5 border-r"
          style={{ borderColor: '#1E1E35', background: '#0A0A14' }}
        >
          {/* Stats card */}
          {!loading && (
            <div
              className="rounded-2xl p-4"
              style={{ background: '#13131F', border: '1px solid #1E1E35' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{profile?.avatar_emoji ?? '⚔️'}</span>
                <div>
                  <div
                    className="font-bold text-sm"
                    style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                  >
                    {profile?.display_name}
                  </div>
                  <div className="text-xs" style={{ color: '#F59E0B' }}>
                    Level {profile?.level} · {profile?.streak ?? 0}🔥 streak
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {statEntries.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-2 text-center"
                    style={{ background: '#0F0F1A' }}
                  >
                    <div className="text-base">{s.icon}</div>
                    <div
                      className="text-sm font-bold"
                      style={{ fontFamily: 'Oxanium, sans-serif', color: s.color }}
                    >
                      {s.val}
                    </div>
                    <div className="text-xs" style={{ color: '#5C5A7A' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested questions */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: '#5C5A7A' }}
            >
              Suggested Questions
            </div>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  disabled={isStreaming}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-start gap-2"
                  style={{
                    background: '#13131F',
                    color: '#9B99B8',
                    border: '1px solid #1E1E35',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7C3AED44'
                    e.currentTarget.style.color = '#F1F0FF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1E1E35'
                    e.currentTarget.style.color = '#9B99B8'
                  }}
                >
                  <span className="flex-shrink-0">{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear button */}
          <button
            onClick={() =>
              setMessages([
                {
                  role: 'assistant',
                  content: 'Conversation cleared. Ready for a fresh battle plan! ⚔️',
                },
              ])
            }
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 mt-auto"
            style={{ color: '#5C5A7A', border: '1px solid #1E1E35' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#EF444411'
              e.currentTarget.style.color = '#EF4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#5C5A7A'
            }}
          >
            <Trash2 size={13} />
            Clear conversation
          </button>
        </div>

        {/* Main chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat top bar */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: '#1E1E35', background: '#0A0A14' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: '#7C3AED22', border: '1px solid #7C3AED44' }}
              >
                🤖
              </div>
              <div>
                <h1
                  className="text-lg font-bold"
                  style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                >
                  AI Coach
                </h1>
                <p className="text-xs" style={{ color: '#5C5A7A' }}>
                  {habits.length} active quests · powered by Claude
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={generateWeeklyReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: '#1A1A2E',
                color: '#9F67FF',
                border: '1px solid #7C3AED44',
              }}
            >
              <BarChart2 size={15} />
              Weekly Report
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  isLatest={i === messages.length - 1}
                />
              ))}
            </AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div
                className="flex items-center gap-3"
                style={{ maxWidth: '75%' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: '#7C3AED22', border: '1px solid #7C3AED44' }}
                >
                  🤖
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm"
                  style={{ background: '#1A1A2E', borderLeft: '2px solid #7C3AED' }}
                >
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: '#1E1E35', background: '#0A0A14' }}
          >
            <div
              className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
              style={{ background: '#13131F', border: '1px solid #1E1E35' }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize() }}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything… (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm"
                style={{ color: '#F1F0FF', maxHeight: 120 }}
                disabled={isStreaming}
              />
              {input.length > 200 && (
                <span className="text-xs flex-shrink-0 mb-1" style={{ color: '#5C5A7A' }}>
                  {input.length}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim() && !isStreaming ? '#7C3AED' : '#1E1E35',
                  color: input.trim() && !isStreaming ? '#F1F0FF' : '#5C5A7A',
                }}
              >
                <Send size={15} />
              </motion.button>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: '#2E2E50' }}>
              AI Coach uses Claude claude-sonnet-4-6 · Responses reference your actual game data
            </p>
          </div>
        </div>
      </div>

      <WeeklyReportModal
        isOpen={showReport}
        report={reportText}
        loading={reportLoading}
        onClose={() => setShowReport(false)}
      />
    </div>
  )
}
