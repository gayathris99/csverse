import { useState, useEffect } from 'react'
import { fetchQueries } from '../api/index'
import ChartDisplay from '../components/ChartDisplay'

export default function History() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadQueries()
  }, [])

  async function loadQueries() {
    try {
      const data = await fetchQueries()
      setQueries(data)
    } catch (err) {
      console.log('Failed to load queries:', err)
    } finally {
      setLoading(false)
    }
  }

  const chartIcon = { bar: '📊', line: '📈', pie: '🥧' }
  const chartColors = {
    bar: { bg: '#26215C', text: '#AFA9EC', border: '#3C3489' },
    line: { bg: '#04342C', text: '#5DCAA5', border: '#0F6E56' },
    pie: { bg: '#4A1B0C', text: '#F0997B', border: '#993C1D' }
  }

  const filtered = filter === 'all'
    ? queries
    : queries.filter(q => q.chart_type === filter)

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60)
    if (diff < 60) return `${diff} minutes ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-gray-400 text-sm">
      <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
      Loading history...
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-semibold mb-1">Query history</h1>
          <p className="text-gray-400 text-sm">All your past analyses</p>
        </div>
        <div className="flex gap-2">
          {['all', 'bar', 'line', 'pie'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? 'bg-brand-900 text-brand-200 border border-brand-800'
                  : 'bg-[#1a1a2e] text-gray-400 border border-[#2a2a3e] hover:border-brand-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-12">
          No queries found. Upload a CSV and ask some questions!
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((q) => {
          const colors = chartColors[q.chart_type] || chartColors.bar
          const icon = chartIcon[q.chart_type] || '📊'
          const isSelected = selected?.id === q.id

          return (
            <div key={q.id}>
              <div
                onClick={() => setSelected(isSelected ? null : q)}
                className={`flex items-center gap-4 bg-[#1a1a2e] border rounded-xl px-4 py-3 cursor-pointer transition ${
                  isSelected
                    ? 'border-brand-600'
                    : 'border-[#2a2a3e] hover:border-brand-600'
                }`}
              >
                <div
                  style={{ background: colors.bg, border: `0.5px solid ${colors.border}` }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 text-sm truncate">{q.question}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{q.filename} · {formatDate(q.created_at)}</div>
                </div>
                <div
                  style={{ background: colors.bg, color: colors.text, border: `0.5px solid ${colors.border}` }}
                  className="text-xs px-2 py-1 rounded-md flex-shrink-0"
                >
                  {q.chart_type}
                </div>
                <div className="text-gray-500 text-sm flex-shrink-0">
                  {isSelected ? '↑' : '↓'}
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5">
                  <p className="text-gray-400 text-sm mb-4">{q.answer}</p>
                  <div className="max-w-lg mx-auto">
                    <ChartDisplay
                      chartType={q.chart_type}
                      chartData={q.chart_data}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}