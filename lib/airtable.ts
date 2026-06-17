const TOKEN = process.env.AIRTABLE_TOKEN!
const BASE_ID = process.env.AIRTABLE_BASE_ID!

export const TABLES = {
  souscriptions: 'tblkPEOnvks4lJ1fA',
  mandataires: 'tblbNe300RZXs8urk',
  bordereaux: 'tblc4R2PpALZhoIOx',
}

async function fetchTable(
  tableId: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Airtable ${res.status}: ${err}`)
  }

  return res.json()
}

// ── Mandataires ──────────────────────────────────────────────────────────────

export async function getMandataireByEmail(email: string) {
  const data = await fetchTable(TABLES.mandataires, {
    filterByFormula: `{Email} = "${email}"`,
    maxRecords: '1',
    fields: [
      'Nom mandataire',
      'Prénom mandataire',
      'Email',
      'Statut',
      'Niveau',
      'Bureaux',
      'Société mandataire',
    ].join(','),
  })
  return data.records?.[0] ?? null
}

export async function getAllMandataires() {
  const records: any[] = []
  let offset: string | undefined

  do {
    const params: Record<string, string> = {
      fields: [
        'Nom mandataire',
        'Prénom mandataire',
        'Email',
        'Statut',
        'Niveau',
        'Bureaux',
        'Société mandataire',
        'Date d\'entrée',
      ].join(','),
      sort: JSON.stringify([{ field: 'Nom mandataire', direction: 'asc' }]),
    }
    if (offset) params.offset = offset

    const data = await fetchTable(TABLES.mandataires, params)
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
    const params: Record<string, string> = {
      filterByFormula: `FIND("${mandataireId}", ARRAYJOIN({Mandataires})) > 0`,
      fields: [
        'Nom souscripteur',
        'Prénom souscripteur',
        'Date de souscription',
        'Date d\'effet',
        'VP/mois',
        'VP/an',
        'N°Contrat',
        'Etat du dossier',
        'Type d\'action',
        'Produits text',
        'Compagnie texte',
        'Email',
        'Phone',
      ].join(','),
      sort: JSON.stringify([{ field: 'Date de souscription', direction: 'desc' }]),
    }
    if (offset) params.offset = offset

    const data = await fetchTable(TABLES.souscriptions, params)
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

export async function getAllSouscriptions() {
  const records: any[] = []
  let offset: string | undefined

  do {
    const params: Record<string, string> = {
      fields: [
        'Nom souscripteur',
        'Prénom souscripteur',
        'Date de souscription',
        'VP/mois',
        'VP/an',
        'N°Contrat',
        'Etat du dossier',
        'Mandataire text',
        'Produits text',
      ].join(','),
      sort: JSON.stringify([{ field: 'Date de souscription', direction: 'desc' }]),
    }
    if (offset) params.offset = offset

    const data = await fetchTable(TABLES.souscriptions, params)
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

// ── Bordereaux acquisition ────────────────────────────────────────────────────

export async function getBordereauxByMandataire(mandataireId: string) {
  const records: any[] = []
  let offset: string | undefined

  do {
    const params: Record<string, string> = {
      filterByFormula: `FIND("${mandataireId}", ARRAYJOIN({Mandataires})) > 0`,
      fields: [
        'Name',
        'Dates bordereau',
        'Etat du bordereau',
        'Total Acquisitions',
        'Total Commissions',
        'Total Mensualités',
        'Mandataires text',
      ].join(','),
      sort: JSON.stringify([{ field: 'Dates bordereau', direction: 'desc' }]),
    }
    if (offset) params.offset = offset

    const data = await fetchTable(TABLES.bordereaux, params)
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

export async function getAllBordereaux() {
  const records: any[] = []
  let offset: string | undefined

  do {
    const params: Record<string, string> = {
      fields: [
        'Name',
        'Dates bordereau',
        'Etat du bordereau',
        'Total Acquisitions',
        'Total Commissions',
        'Total Mensualités',
        'Mandataires text',
      ].join(','),
      sort: JSON.stringify([{ field: 'Dates bordereau', direction: 'desc' }]),
    }
    if (offset) params.offset = offset

    const data = await fetchTable(TABLES.bordereaux, params)
    records.push(...(data.records ?? []))
    offset = data.offset
  } while (offset)

  return records
}

// ── Create / Update ───────────────────────────────────────────────────────────

export async function createRecord(tableId: string, fields: Record<string, unknown>) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`Airtable create error: ${res.status}`)
  return res.json()
}

export async function updateRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
) {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )
  if (!res.ok) throw new Error(`Airtable update error: ${res.status}`)
  return res.json()
}
