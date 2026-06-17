export const dynamic = 'force-dynamic'
import { getUser, getUserProfile } from '@/lib/supabase-server'
import { getMandataireByEmail, getSouscriptionsByMandataire, getAllSouscriptions } from '@/lib/airtable'

function fmt(n: number | null | undefined) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

const ETAT_COLORS: Record<string, string> = {
  'En vigueur': 'bg-green-50 text-green-700',
  'En attente': 'bg-yellow-50 text-yellow-700',
  'Annulé': 'bg-red-50 text-red-700',
  'Terminé': 'bg-gray-100 text-gray-600',
}

export default async function SouscriptionsPage() {
  const user = await getUser()
  const profile = await getUserProfile(user!.id)
  const isAdmin = profile?.role === 'admin'

  let souscriptions: any[] = []

  if (isAdmin) {
    souscriptions = await getAllSouscriptions()
  } else {
    const mandataire = await getMandataireByEmail(user!.email!)
    if (mandataire) {
      souscriptions = await getSouscriptionsByMandataire(mandataire.id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Souscriptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{souscriptions.length} enregistrement{souscriptions.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Souscripteur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Contrat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">VP/mois</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">VP/an</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">État</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date souscription</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date d'effet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {souscriptions.map(r => {
                const f = r.fields
                const etat = f['Etat du dossier'] ?? ''
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {f['Prénom souscripteur']} {f['Nom souscripteur']}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {f['N°Contrat'] || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {f['Produits text'] || f['Compagnie texte'] || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {f['VP/mois'] != null ? fmt(f['VP/mois']) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {f['VP/an'] != null ? fmt(f['VP/an']) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {etat ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ETAT_COLORS[etat] ?? 'bg-gray-100 text-gray-600'}`}>
                          {etat}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {f['Date de souscription']
                        ? new Date(f['Date de souscription']).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {f['Date d\'effet']
                        ? new Date(f['Date d\'effet']).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
              {souscriptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucune souscription trouvée
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
