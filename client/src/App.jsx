import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import History from './pages/History'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './context/AuthContext'

function App() {
  const [checking, setChecking] = useState(true)
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    async function tryRefresh() {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        login(data.user, data.accessToken)
      } catch {
        // no valid refresh token — stay logged out
      } finally {
        setChecking(false)
      }
    }
    tryRefresh()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f13]">
        <div className="text-brand-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/upload' element={
            <ProtectedRoute>
              <Upload/>
            </ProtectedRoute>
          }/>
          <Route path='/history' element={
            <ProtectedRoute>
              <History/>
            </ProtectedRoute>
          }/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App