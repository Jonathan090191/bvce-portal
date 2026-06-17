export const dynamic = 'force-dynamic'
import { getUser, getUserProfile } from '@/lib/supabase-server'
import { getMandataireByEmail, getBordereauxByMandataire, getAllBordereaux } from '@/lib/airtable'

function fmt(n: number | null | undefined) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

const ETAT_COLORS: Record<string, string> = {
  'Validé': 'bg-green-50 text-green-700',
  'En attente': 'bg-yellow-50 text-yellow-700',
  'Rejeté': 'bg-red-50 text-red-700',
  'Payé': 'bg-blue-50 text-blue-700',
}

export default async function BordereauxPage() {
  const user = await getUser()
  const profile = await getUserProfile(user!.id)
  const isAdmin = profile?.role === 'admin'

  let bordereaux: any[] = []

  if (isAdmin) {
    bordereaux = await getAllBordereaux()
  } else {
    const mandataire = await getMandataireByEmail(user!.email!)
    if (mandataire) {
      bordereaux = await getBordereauxByMandataire(mandataire.id)
    }
  }

  const totalCommissions = bordereaux.reduce(
    (s, r) => s + (Number(r.fields['Total Commissions']) || 0), 0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bordereaux d'acquisition</h1>
          <p className="text-sm text-gray-500 mt-0.5">{bordereaux.length} bordereau{bordereaux.length > 1 ? 'x' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total commissions</p>
          <p className="text-lg font-semibold text-indigo-600">{fmt(totalCommissions)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Référence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total acquisitions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Mensualités</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Commissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">État</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Mandataire</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bordereaux.map(r => {
                const f = r.fields
                const etat = f['Etat du bordereau'] ?? ''
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">
                      {f['Name'] || r.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {f['Dates bordereau']
                        ? new Date(f['Dates bordereau']).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {fmt(f['Total Acquisitions'])}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {fmt(f['Total Mensualités'])}
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-700 whitespace-nowrap">
                      {fmt(f['Total Commissions'])}
                    </td>
                    <td className="px-4 py-3">
                      {etat ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ETAT_COLORS[etat] ?? 'bg-gray-100 text-gray-600'}`}>
                          {etat}
                        </span>
                      ) : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {f['Mandataires text'] || '—'}
                      </td>
                    )}
                  </tr>
                )
              })}
              {bordereaux.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-12 text-center text-gray-400">
                    Aucun bordereau trouvé
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
