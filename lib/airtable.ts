const TOKEN = process.env.AIRTABLE_TOKEN!
const BASE_ID = process.env.AIRTABLE_BASE_ID!

export const TABLES = {
  souscriptions: 'tblkPEOnvks4lJ1fA',
  mandataires: 'tblbNe300RZXs8urk',
  bordereaux: 'tblc4R2PpALZhoIOx',
}

interface FetchParams {
  fields?: string[]
  filterByFormula?: string
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
  maxRecords?: number
  offset?: string
}

async function fetchTable(tableId: string, params: FetchParams = {}) {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`)

  if (params.fields) {
    params.fields.forEach(f => url.searchParams.append('fields[]', f))
  }
  if (params.filterByFormula) {
    url.searchParams.set('filterByFormula', params.filterByFormula)
  }
  if (params.sort) {
    params.sort.forEach((s, i) => {
      url.searchParams.set(`sort[${i}][field]`, s.field)
      url.searchParams.set(`sort[${i}][direction]`, s.direction)
    })
  }
  if (params.maxRecords) {
    url.searchParams.set('maxRecords', String(params.maxRecords))
  }
  if (params.offset) {
    url.searchParams.set('offset', params.offset)
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Airtable ${res.status}: ${err}`)
  }

  return res.json()
}

// ── Mandataires ───────────────────────────────────────────────────────────────

export async function getMandataireByEmail(email: string) {
  const data = await fetchTable(TABLES.mandataires, {
    filterByFormula: `{Email} = "${email}"`,
    maxRecords: 1,
    fields: ['Nom mandataire', 'Prénom mandataire', 'Email', 'Statut', 'Niveau', 'Bureaux', 'Société mandataire'],
  })
  return data.records?.[0] ?? null
}

export async function getAllMandataires() {
  const records: any[] = []
  let offset: string | undefined

  do {
    const data = await fetchTable(TABLES.mandataires, {
      fields: ['Nom mandataire', 'Prénom mandataire', 'Email', 'Statut', 'Niveau', 'Bureaux', 'Société mandataire', "Date d'entrée"],
      sort: [{ field: 'Nom mandataire', direction: 'asc' }],
      ...(offset ? { offset } : {}),
    })
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

// ── Souscriptions ─────────────────────────────────────────────────────────────

export async function getSouscriptionsByMandataire(mandataireId: string) {
  const records: any[] = []
  let offset: string | undefined

  do {
    const data = await fetchTable(TABLES.souscriptions, {
      filterByFormula: `FIND("${mandataireId}", ARRAYJOIN({Mandataires})) > 0`,
      fields: [
        'Nom souscripteur', 'Prénom souscripteur', 'Date de souscription',
        "Date d'effet", 'VP/mois', 'VP/an', 'N°Contrat', 'Etat du dossier',
        "Type d'action", 'Produits text', 'Compagnie texte', 'Email', 'Phone',
      ],
      sort: [{ field: 'Date de souscription', direction: 'desc' }],
      ...(offset ? { offset } : {}),
    })
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

export async function getAllSouscriptions() {
  const records: any[] = []
  let offset: string | undefined

  do {
    const data = await fetchTable(TABLES.souscriptions, {
      fields: [
        'Nom souscripteur', 'Prénom souscripteur', 'Date de souscription',
        'VP/mois', 'VP/an', 'N°Contrat', 'Etat du dossier',
        'Mandataire text', 'Produits text',
      ],
      sort: [{ field: 'Date de souscription', direction: 'desc' }],
      ...(offset ? { offset } : {}),
    })
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

// ── Bordereaux ────────────────────────────────────────────────────────────────

export async function getBordereauxByMandataire(mandataireId: string) {
  const records: any[] = []
  let offset: string | undefined

  do {
    const data = await fetchTable(TABLES.bordereaux, {
      filterByFormula: `FIND("${mandataireId}", ARRAYJOIN({Mandataires})) > 0`,
      fields: [
        'Name', 'Dates bordereau', 'Etat du bordereau',
        'Total Acquisitions', 'Total Commissions', 'Total Mensualités', 'Mandataires text',
      ],
      sort: [{ field: 'Dates bordereau', direction: 'desc' }],
      ...(offset ? { offset } : {}),
    })
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

export async function getAllBordereaux() {
  const records: any[] = []
  let offset: string | undefined

  do {
    const data = await fetchTable(TABLES.bordereaux, {
      fields: [
        'Name', 'Dates bordereau', 'Etat du bordereau',
        'Total Acquisitions', 'Total Commissions', 'Total Mensualités', 'Mandataires text',
      ],
      sort: [{ field: 'Dates bordereau', direction: 'desc' }],
      ...(offset ? { offset } : {}),
    })
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

// ── Create / Update ───────────────────────────────────────────────────────────

export async function createRecord(tableId: string, fields: Record<string, unknown>) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Airtable create error: ${res.status}`)
  return res.json()
}

export async function updateRecord(tableId: string, recordId: string, fields: Record<string, unknown>) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Airtable update error: ${res.status}`)
  return res.json()
}
