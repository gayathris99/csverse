import { Navigate } from 'react-router-dom'
import useAuthStore from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)

  if (!accessToken || !user) {
    return <Navigate to="/" />
  }

  return children
}