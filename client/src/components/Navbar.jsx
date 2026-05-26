import { useNavigate } from 'react-router-dom'
import useAuthStore from '../context/AuthContext'
import axios from 'axios'

export default function Navbar () {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
        withCredentials: true
      })
      logout()
      navigate('/')
    } catch (error) {
      console.log(error.message || 'Logout error')
    }
  }
  return (
    <nav className="bg-[#1a1a2e] border-b border-[#2a2a3e] px-6 py-3 flex items-center justify-between">
    <div className="text-lg font-semibold text-brand-400">
      CSV<span className="text-gray-500 font-normal">erse</span>
    </div>

    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400">{user?.name}</span>
      <button
        onClick={handleLogout}
        className="text-xs text-gray-400 border border-[#2a2a3e] px-3 py-1.5 rounded-lg hover:bg-[#2a2a3e] transition"
      >
        Logout
      </button>
    </div>
  </nav>
  )
}
