const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const OpenAI = require('openai')

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY
})

// Generate AI suggested questions
router.post('/suggest-questions', async (req, res) => {
  const { headers, sampleRows, fileName } = req.body
  try {
    const sample = JSON.stringify(sampleRows.slice(0, 5), null, 2)
    const response = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      messages: [
        {
          role: 'system',
          content: `You are a senior data analyst with 10 years of experience. You are given some CSV Data. Suggest 5 insightful questions any user might have after looking at the data.
Always respond with valid JSON only, no extra text, no markdown.
Format:
{
  "questions": [
    { "question": "Which month had the highest sales?", "chart_type": "bar" },
    { "question": "What is the revenue trend over time?", "chart_type": "line" },
    { "question": "What is the distribution by region?", "chart_type": "pie" }
  ]
}
chart_type must be one of: bar, line, pie`
        },
        {
          role: 'user',
          content: `Filename: ${fileName}\nColumns: ${headers.join(', ')}\nSample data:\n${sample}`
        }
      ]
    })
    const text = response.choices[0].message.content
    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

// Answer a question
router.post('/ask', async (req, res) => {
  const { question, chartType, headers, rows, filename } = req.body

  try {
    const dataStr = JSON.stringify(rows, null, 2)

    const response = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      messages: [
        {
          role: 'system',
          content: `You are a senior data analyst. You are given CSV data and a question.
Analyze the data and respond with valid JSON only, no extra text, no markdown.
Format:
{
  "insight": "plain english explanation of the answer",
  "chart_type": "bar",
  "chartData": {
    "labels": ["label1", "label2"],
    "datasets": [{
      "label": "dataset label",
      "data": [10, 20, 30]
    }]
  }
}
chart_type must be one of: bar, line, pie
chartData must follow Chart.js format exactly.`
        },
        {
          role: 'user',
          content: `Filename: ${filename}
Question: ${question}
Chart type: ${chartType === 'auto' ? 'Choose the most appropriate chart type (bar, line, or pie) based on the question' : chartType}
Columns: ${headers.join(', ')}
Data:\n${dataStr}`
        }
      ]
    })

    const text = response.choices[0].message.content
    const parsed = JSON.parse(text)
    res.json(parsed)

  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

// Save a query
router.post('/save-query', async (req, res) => {
  const { question, chartType, insight, chartData, filename, rowCount, headers } = req.body
  const userId = req.user.id

  try {
    let fileResult = await pool.query(
      'SELECT id FROM csv_files WHERE user_id = $1 AND original_name = $2',
      [userId, filename]
    )

    let fileId
    if (fileResult.rows.length === 0) {
      const newFile = await pool.query(
        'INSERT INTO csv_files (user_id, filename, original_name, row_count, columns) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, filename, filename, rowCount, JSON.stringify(headers)]
      )
      fileId = newFile.rows[0].id
    } else {
      fileId = fileResult.rows[0].id
    }

    const result = await pool.query(
      'INSERT INTO queries (user_id, file_id, question, answer, chart_type, chart_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, fileId, question, insight, chartType, JSON.stringify(chartData)]
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

// Get all queries for current user
router.get('/queries', async (req, res) => {
  const userId = req.user.id
  try {
    const result = await pool.query(
      `SELECT q.*, f.original_name as filename 
       FROM queries q
       JOIN csv_files f ON q.file_id = f.id
       WHERE q.user_id = $1
       ORDER BY q.created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

// Get recent files for current user
router.get('/files', async (req, res) => {
  const userId = req.user.id
  try {
    const result = await pool.query(
      'SELECT * FROM csv_files WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ detail: error.message })
  }
})

module.exports = router