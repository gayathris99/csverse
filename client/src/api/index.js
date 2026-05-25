import axios from 'axios'
import useAuthStore from '../context/AuthContext'

const BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function suggestQuestions(filename, headers, sampleRows) {
  const { data } = await api.post('/csv/suggest-questions', {
    filename,
    headers,
    sampleRows
  })
  return data
}

export async function askQuestion(question, chartType, filename, headers, rows) {
  const { data } = await api.post('/csv/ask', {
    question,
    chartType,
    filename,
    headers,
    rows
  })
  return data
}

export async function saveQuery(question, chartType, insight, chartData, filename, rowCount, headers) {
  const { data } = await api.post('/csv/save-query', {
    question,
    chartType,
    insight,
    chartData,
    filename,
    rowCount,
    headers
  })
  return data
}

export async function fetchQueries() {
  const { data } = await api.get('/csv/queries')
  return data
}

export async function fetchFiles() {
  const { data } = await api.get('/csv/files')
  return data
}