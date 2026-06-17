'use client'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function Navbar({ user, profile }: { user: any; profile: any }) {
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = profile?.subscription_status === 'active' || profile?.role === 'admin'

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        {/* Badge abonnement */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          {isActive ? 'Abonnement actif' : 'Abonnement expiré'}
        </span>

        {/* Rôle admin */}
        {profile?.role === 'admin' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            Admin
          </span>
        )}

        {/* Email */}
        <span className="text-sm text-gray-600">{user?.email}</span>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </header>
  )
}
