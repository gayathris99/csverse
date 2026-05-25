import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { useVirtualizer } from '@tanstack/react-virtual'
import { suggestQuestions, askQuestion } from '../api/index'
import ChartDisplay from '../components/ChartDisplay'

function VirtualTable({ headers, rows }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 5
  })

  const colWidth = '120px'

  return (
    <div ref={parentRef} className="overflow-auto max-h-64">
      <div style={{ minWidth: `${headers.length * 120}px` }}>
        <div className="flex border-b border-[#2a2a3e] sticky top-0 bg-[#1a1a2e] z-10">
          {headers.map((h, i) => (
            <div
              key={i}
              style={{ width: colWidth, minWidth: colWidth }}
              className="text-gray-400 py-2 pr-4 text-xs font-medium truncate flex-shrink-0"
            >
              {h}
            </div>
          ))}
        </div>
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%'
                }}
                className="flex border-b border-[#2a2a3e]/50"
              >
                {headers.map((h, j) => (
                  <div
                    key={j}
                    style={{ width: colWidth, minWidth: colWidth }}
                    className="text-gray-300 py-2 pr-4 text-xs truncate flex-shrink-0"
                  >
                    {String(row[h] ?? '')}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Upload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [parsing, setParsing] = useState(false)
  const [csvData, setCsvData] = useState(null)
  const [questions, setQuestions] = useState(null)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [chartResult, setChartResult] = useState(null)
  const [loadingChart, setLoadingChart] = useState(false)
  const [customQuestion, setCustomQuestion] = useState('')
  const fileInputRef = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    validateAndSetFile(dropped)
  }

  function handleFileInput(e) {
    validateAndSetFile(e.target.files[0])
  }

  function validateAndSetFile(file) {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported')
      return
    }
    setError('')
    setCsvData(null)
    setQuestions(null)
    setChartResult(null)
    setSelectedQuestion(null)
    setFile(file)
  }

  function parseCSV(file) {
    setParsing(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        setParsing(false)
        if (result.errors.length > 0) {
          setError(result.errors[0].message)
          return
        }
        setCsvData({
          headers: result.meta.fields || [],
          rows: result.data || [],
          rowCount: result.data.length || 0
        })
      },
      error: (err) => {
        setParsing(false)
        setError(err.message)
      }
    })
  }

  async function handleGenerateQuestions() {
    setLoadingQuestions(true)
    setError('')
    try {
      const result = await suggestQuestions(
        file.name,
        csvData.headers,
        csvData.rows
      )
      setQuestions(result.questions)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate questions')
    } finally {
      setLoadingQuestions(false)
    }
  }

  async function handleQuestionClick(q) {
    setSelectedQuestion(q)
    setChartResult(null)
    setLoadingChart(true)
    setError('')
    try {
      const result = await askQuestion(
        q.question,
        q.chart_type,
        file.name,
        csvData.headers,
        csvData.rows
      )
      setSelectedQuestion({
        ...q,
        chart_type: result.chart_type || q.chart_type
      })
      setChartResult(result)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate chart')
    } finally {
      setLoadingChart(false)
    }
  }

  async function handleCustomQuestion() {
    if (!customQuestion.trim()) return
    const q = { question: customQuestion, chart_type: 'auto' }
    setCustomQuestion('')
    await handleQuestionClick(q)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-white text-xl font-semibold mb-1">Upload a CSV</h1>
      <p className="text-gray-400 text-sm mb-6">We'll analyze your data and suggest questions</p>

      {/* Upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
          dragging
            ? 'border-brand-400 bg-brand-900/20'
            : 'border-[#2a2a3e] hover:border-brand-600 hover:bg-[#1a1a2e]'
        }`}
      >
        <div className="text-4xl mb-4">📂</div>
        <div className="text-white font-medium mb-1">Drop your CSV here</div>
        <div className="text-gray-500 text-sm mb-4">or click to browse files</div>
        <div className="inline-block border border-[#2a2a3e] text-gray-400 text-xs px-4 py-2 rounded-lg">
          Browse files
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-3 py-2 mt-3">
          {error}
        </p>
      )}

      {/* File info */}
      {file && !csvData && (
        <div className="mt-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <div className="text-white text-sm font-medium">{file.name}</div>
              <div className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-red-400 text-xs transition"
          >
            Remove
          </button>
        </div>
      )}

      {/* Analyze button */}
      {file && !csvData && (
        <button
          onClick={() => parseCSV(file)}
          disabled={parsing}
          className="mt-4 w-full bg-brand-600 text-brand-50 py-3 rounded-xl font-medium text-sm hover:bg-brand-800 transition disabled:opacity-50"
        >
          {parsing ? 'Parsing...' : 'Analyze CSV'}
        </button>
      )}

      {/* Preview table */}
      {csvData && csvData.headers && (
        <div className="mt-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Preview</h2>
            <span className="text-xs text-gray-400">
              {csvData.rowCount} rows · {csvData.headers.length} columns
            </span>
          </div>
          <VirtualTable headers={csvData.headers} rows={csvData.rows} />
        </div>
      )}

      {/* Generate questions button */}
      {csvData && !questions && (
        <button
          onClick={handleGenerateQuestions}
          disabled={loadingQuestions}
          className="mt-4 w-full bg-brand-600 text-brand-50 py-3 rounded-xl font-medium text-sm hover:bg-brand-800 transition disabled:opacity-50"
        >
          {loadingQuestions ? 'Generating questions...' : 'Generate AI Questions →'}
        </button>
      )}

      {/* AI Questions */}
      {questions && (
        <div className="mt-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <span>✨</span>
            <h2 className="text-white font-medium">AI Suggested Questions</h2>
          </div>
          <div className="flex flex-col gap-2">
            {questions.map((q, i) => (
              <div
                key={i}
                onClick={() => handleQuestionClick(q)}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition ${
                  selectedQuestion?.question === q.question
                    ? 'border-brand-600 bg-brand-900/30'
                    : 'bg-[#0f0f13] border-[#2a2a3e] hover:border-brand-600 hover:bg-brand-900/20'
                }`}
              >
                <span className="text-gray-300 text-sm">{q.question}</span>
                <span className="text-xs text-brand-400 border border-brand-800 px-2 py-1 rounded-md ml-4 flex-shrink-0">
                  {q.chart_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom question input */}
      {csvData && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomQuestion()}
            placeholder="Ask your own question about this data..."
            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
          />
          <button
            onClick={handleCustomQuestion}
            disabled={loadingChart || !customQuestion.trim()}
            className="bg-brand-600 text-brand-50 px-6 py-3 rounded-xl font-medium text-sm hover:bg-brand-800 transition disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      )}

      {/* Loading chart */}
      {loadingChart && (
        <div className="mt-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm">Analyzing your data...</span>
          </div>
        </div>
      )}

      {/* Chart result */}
      {chartResult && !loadingChart && (
        <div className="mt-6 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
          <h2 className="text-white font-medium mb-1">{selectedQuestion?.question}</h2>
          <p className="text-gray-400 text-sm mb-6">{chartResult.insight}</p>
          <div className="max-w-lg mx-auto">
            <ChartDisplay
              chartType={selectedQuestion?.chart_type}
              chartData={chartResult.chartData}
            />
          </div>
        </div>
      )}

    </div>
  )
}