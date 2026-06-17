import { getUser, getUserProfile } from '@/lib/supabase-server'
import { getMandataireByEmail, getSouscriptionsByMandataire, getBordereauxByMandataire, getAllSouscriptions, getAllBordereaux } from '@/lib/airtable'

function fmt(n: number | null | undefined) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

export default async function DashboardPage() {
  const user = await getUser()
  const profile = await getUserProfile(user!.id)
  const isAdmin = profile?.role === 'admin'

  let souscriptions: any[] = []
  let bordereaux: any[] = []
  let mandataireId: string | null = null

  if (isAdmin) {
    ;[souscriptions, bordereaux] = await Promise.all([getAllSouscriptions(), getAllBordereaux()])
  } else {
    const mandataire = await getMandataireByEmail(user!.email!)
    if (mandataire) {
      mandataireId = mandataire.id
      ;[souscriptions, bordereaux] = await Promise.all([
        getSouscriptionsByMandataire(mandataire.id),
        getBordereauxByMandataire(mandataire.id),
      ])
    }
  }

  const totalVPan = souscriptions.reduce(
    (s, r) => s + (Number(r.fields['VP/an']) || 0), 0
  )
  const totalVPmois = souscriptions.reduce(
    (s, r) => s + (Number(r.fields['VP/mois']) || 0), 0
  )
  const dossierActifs = souscriptions.filter(
    r => r.fields['Etat du dossier'] === 'En vigueur'
  ).length
  const totalCommissions = bordereaux.reduce(
    (s, r) => s + (Number(r.fields['Total Commissions']) || 0), 0
  )

  const stats = [
    { label: 'Souscriptions', value: souscriptions.length.toString(), sub: 'total' },
    { label: 'Dossiers actifs', value: dossierActifs.toString(), sub: 'en vigueur' },
    { label: 'VP / an', value: fmt(totalVPan), sub: 'versements périodiques' },
    { label: 'Commissions', value: fmt(totalCommissions), sub: 'tous bordereaux' },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        {isAdmin ? 'Vue globale' : 'Mon espace'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {isAdmin ? 'Toutes les données de la base BVCE' : `Données liées à votre profil mandataire`}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Dernières souscriptions */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Dernières souscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Souscripteur</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Produit</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">VP/mois</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">État</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {souscriptions.slice(0, 8).map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.fields['Prénom souscripteur']} {r.fields['Nom souscripteur']}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">
                    {r.fields['Produits text'] || r.fields['Compagnie texte'] || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {r.fields['VP/mois'] ? fmt(r.fields['VP/mois']) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <EtatBadge etat={r.fields['Etat du dossier']} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {r.fields['Date de souscription']
                      ? new Date(r.fields['Date de souscription']).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                </tr>
              ))}
              {souscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
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

function EtatBadge({ etat }: { etat?: string }) {
  if (!etat) return <span className="text-gray-400">—</span>
  const colors: Record<string, string> = {
    'En vigueur': 'bg-green-50 text-green-700',
    'En attente': 'bg-yellow-50 text-yellow-700',
    'Annulé': 'bg-red-50 text-red-700',
    'Terminé': 'bg-gray-100 text-gray-600',
  }
  const cls = colors[etat] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {etat}
    </span>
  )
}
