'use client'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function AbonnementExpirePage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Abonnement expiré</h1>
        <p className="text-gray-500 text-sm mb-8">
          Votre accès au portail BVCE a expiré. Contactez votre administrateur pour renouveler votre abonnement.
        </p>
        <div className="space-y-3">
          <a
            href="mailto:j.illouz@afinancea.fr"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            Contacter l'administrateur
          </a>
          <button
            onClick={handleLogout}
            className="block w-full text-gray-500 hover:text-gray-900 text-sm py-2 transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
