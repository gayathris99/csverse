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