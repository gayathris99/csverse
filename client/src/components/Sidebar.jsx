import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'upload', label: 'Upload', icon: '📁', path: '/upload' },
    { id: 'history', label: 'History', icon: '🕐', path: '/history' }    
]

export default function Sidebar () {
    const navigate = useNavigate()
    const location = useLocation()
    return (
        <div className='w-52 bg-[#1a1a2e] border-r border-[#2a2a3e] p-4 flex flex-col gap-1'>
            { navItems.map(item => (
                <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                    location.pathname === item.path
                      ? 'bg-brand-900 text-brand-200'
                      : 'text-gray-400 hover:bg-[#2a2a3e]'
                  }`}
                >
                    <span>{item.icon}</span> {item.label}
                </div>
            ))}
        </div>
    )
}