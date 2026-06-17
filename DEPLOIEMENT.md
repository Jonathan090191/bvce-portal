# Guide de déploiement BVCE Portail

## Étape 1 — Supabase (auth + base de données)

1. Va sur https://supabase.com et crée un compte (gratuit)
2. Clique "New project" → nomme-le "bvce-portal" → crée un mot de passe fort
3. Une fois créé, va dans **Settings → API** et copie :
   - `Project URL` → c'est ta `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → c'est ta `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → c'est ta `SUPABASE_SERVICE_ROLE_KEY`
4. Va dans **SQL Editor** et colle le contenu du fichier `supabase-setup.sql` → clique **Run**

---

## Étape 2 — Stripe (facturation)

1. Va sur https://stripe.com et crée un compte
2. Dans **Developers → API keys** :
   - `Secret key` → c'est ta `STRIPE_SECRET_KEY`
   - `Publishable key` → c'est ta `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Crée un produit : **Products → Add product** → nomme-le "Accès BVCE Portail"
   - Ajoute un prix (ex: 29€/mois) → copie le `Price ID` (ex: `price_1234abc`)
4. Pour le webhook (après déploiement Vercel) :
   - **Developers → Webhooks → Add endpoint**
   - URL : `https://ton-site.vercel.app/api/stripe/webhook`
   - Évènements : `customer.subscription.*` + `invoice.payment_failed`
   - Copie le `Signing secret` → c'est ta `STRIPE_WEBHOOK_SECRET`

---

## Étape 3 — Vercel (hébergement)

1. Va sur https://vercel.com et crée un compte (gratuit)
2. Clique **Add New → Project**
3. Importe le dossier `bvce-portal` (via GitHub ou upload direct)
4. Dans **Environment Variables**, ajoute toutes les variables du fichier `.env.local.example` avec leurs vraies valeurs
5. Clique **Deploy** → ton site sera accessible en quelques minutes

---

## Étape 4 — Créer ton compte admin

1. Va sur `https://ton-site.vercel.app/login`
2. Inscris-toi avec `j.illouz@afinancea.fr`
3. Va dans Supabase → **Table Editor → profiles**
4. Trouve ta ligne → change `role` en `admin` et `subscription_status` en `active`

---

## Étape 5 — Ajouter un mandataire

1. Dans Supabase → **Authentication → Users → Invite user**
2. Entre l'email du mandataire → il reçoit un lien pour créer son mot de passe
3. Dans **Table Editor → profiles**, trouve sa ligne :
   - `subscription_status` → `active` (ou laisse `inactive` jusqu'au paiement Stripe)
   - `role` → `viewer`
4. Stripe gérera automatiquement le blocage/déblocage via webhook

---

## Variables d'environnement complètes

```env
AIRTABLE_TOKEN=patOasGQvC3ZaV5Jx
AIRTABLE_BASE_ID=apph14oBHYuqwDokA
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://ton-site.vercel.app
```
