import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(user.id)

  // Vérifier abonnement actif
  if (profile?.subscription_status !== 'active' && profile?.role !== 'admin') {
    redirect('/abonnement-expire')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={profile?.role ?? 'viewer'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} profile={profile} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
