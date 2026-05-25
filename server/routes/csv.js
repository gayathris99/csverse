const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const OpenAI = require('openai')

const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
})

// Generate AI questions
router.post('/suggest-questions', async (req, res) => {
    const { headers, sampleRows, fileName } = req.body
    try {
        const sample = JSON.stringify(sampleRows.slice(0,5), null, 2)
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
                    content: `File Name: ${fileName}\nColumns: ${headers.join(', ')}\nSample data:\n${sample}`
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
    "chartData": {
      "labels": ["label1", "label2"],
      "datasets": [{
        "label": "dataset label",
        "data": [10, 20, 30]
      }]
    }
  }
  chartData must follow Chart.js format exactly.`
          },
          {
            role: 'user',
            content: `Filename: ${filename}
  Question: ${question}
  Chart type: ${chartType}
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

module.exports = router