import { useState } from 'react'
import { useNavigate} from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../context/AuthContext'

export default function Login () {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const login = useAuthStore(state => state.login)

    // Login Function
    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            setLoading(true)
            setError('')
            const data = await axios.post(
                'http://localhost:8000/api/auth/login',
                {
                    email, password
                },
                {
                    withCredentials: true
                }
            )
            login(data.user, data.accessToken)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f13]">
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-8 w-full max-w-sm">
      
            <div className="text-2xl font-semibold text-brand-400 mb-6">
              CSV<span className="text-gray-500 font-normal">erse</span>
            </div>
      
            <h1 className="text-lg font-semibold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500 mb-6">Sign in to analyze your data</p>
      
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#0f0f13] border border-[#2a2a3e] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
      
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0f0f13] border border-[#2a2a3e] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
      
              {error && (
                <p className="text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
      
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 text-brand-50 py-2.5 rounded-lg font-medium text-sm hover:bg-brand-800 transition disabled:opacity-50 mt-1"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
      
              <p className="text-center text-xs text-gray-500">
                Don't have an account?{' '}
                <span
                  onClick={() => navigate('/signup')}
                  className="text-brand-400 cursor-pointer hover:underline font-medium"
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      )
    
}