import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchQueries, fetchFiles } from '../api/index'
import useAuthStore from '../context/AuthContext'
import ChartDisplay from '../components/ChartDisplay'

export default function Dashboard() {
  const [queries, setQueries] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [q, f] = await Promise.all([fetchQueries(), fetchFiles()])
      setQueries(q)
      setFiles(f)
    } catch (err) {
      console.log('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  const chartIcon = { bar: '📊', line: '📈', pie: '🥧' }
  const chartColors = {
    bar: { bg: '#26215C', text: '#AFA9EC', border: '#3C3489' },
    line: { bg: '#04342C', text: '#5DCAA5', border: '#0F6E56' },
    pie: { bg: '#4A1B0C', text: '#F0997B', border: '#993C1D' }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-gray-400 text-sm">
      <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
      Loading dashboard...
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-white text-xl font-semibold mb-1">
          {getGreeting()}, {user?.name} 👋
        </h1>
        <p className="text-gray-400 text-sm">Here's what you've been working on</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Files uploaded</div>
          <div className="text-white text-2xl font-semibold">{files.length}</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Questions asked</div>
          <div className="text-white text-2xl font-semibold">{queries.length}</div>
        </div>
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Charts generated</div>
          <div className="text-white text-2xl font-semibold">{queries.length}</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-4">

        {/* Recent files */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-medium">Recent files</h2>
            <button
              onClick={() => navigate('/upload')}
              className="text-xs text-brand-400 hover:underline"
            >
              + Upload new
            </button>
          </div>

          {files.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-4">
              No files yet. Upload a CSV to get started!
            </p>
          )}

          <div className="flex flex-col gap-2">
            {files.map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(`/upload?file=${f.original_name}`)}
                className="flex items-center gap-3 p-3 bg-[#0f0f13] border border-[#2a2a3e] rounded-lg cursor-pointer hover:border-brand-600 transition"
              >
                <span className="text-xl">📄</span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 text-xs font-medium truncate">{f.original_name}</div>
                  <div className="text-gray-500 text-xs">{f.row_count} rows · {formatDate(f.created_at)}</div>
                </div>
                <div className="text-xs text-brand-400 border border-brand-800 bg-brand-900/30 px-2 py-1 rounded-md flex-shrink-0">
                  Open
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent queries */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-medium">Recent queries</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-brand-400 hover:underline"
            >
              View all
            </button>
          </div>

          {queries.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-4">
              No queries yet. Ask some questions about your data!
            </p>
          )}

          <div className="flex flex-col gap-2">
            {queries.slice(0, 5).map((q) => {
              const icon = chartIcon[q.chart_type] || '📊'
              return (
                <div
                  key={q.id}
                  onClick={() => setSelected(selected?.id === q.id ? null : q)}
                  className="flex items-center gap-3 p-3 bg-[#0f0f13] border border-[#2a2a3e] rounded-lg cursor-pointer hover:border-brand-600 transition"
                >
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 text-xs truncate">{q.question}</div>
                    <div className="text-gray-500 text-xs">{q.filename} · {formatDate(q.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected query chart */}
      {selected && (
        <div className="mt-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5">
          <h2 className="text-white font-medium mb-1">{selected.question}</h2>
          <p className="text-gray-400 text-sm mb-4">{selected.answer}</p>
          <div className="max-w-lg mx-auto">
            <ChartDisplay
              chartType={selected.chart_type}
              chartData={selected.chart_data}
            />
          </div>
        </div>
      )}

    </div>
  )
}