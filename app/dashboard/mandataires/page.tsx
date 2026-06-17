export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/supabase-server'
import { getAllMandataires } from '@/lib/airtable'

const STATUT_COLORS: Record<string, string> = {
  'Actif': 'bg-green-50 text-green-700',
  'Inactif': 'bg-gray-100 text-gray-500',
  'Suspendu': 'bg-red-50 text-red-700',
}

export default async function MandatairesPage() {
  const user = await getUser()
  const profile = await getUserProfile(user!.id)

  // Réservé aux admins uniquement
  if (profile?.role !== 'admin') redirect('/dashboard')

  const mandataires = await getAllMandataires()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mandataires</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mandataires.length} mandataire{mandataires.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Société</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Niveau</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Bureau</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date d'entrée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mandataires.map(r => {
                const f = r.fields
                const statut = f['Statut'] ?? ''
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {f['Prénom mandataire']} {f['Nom mandataire']}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {f['Société mandataire'] || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {f['Email'] || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {f['Niveau'] || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {f['Bureaux'] || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {statut ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUT_COLORS[statut] ?? 'bg-gray-100 text-gray-600'}`}>
                          {statut}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {f['Date d\'entrée']
                        ? new Date(f['Date d\'entrée']).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
              {mandataires.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Aucun mandataire trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
