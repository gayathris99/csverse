import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

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
    setFile(file)
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

      {/* File preview */}
      {file && (
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

      {file && (
        <button className="mt-4 w-full bg-brand-600 text-brand-50 py-3 rounded-xl font-medium text-sm hover:bg-brand-800 transition">
          Analyze CSV
        </button>
      )}
    </div>
  )
}