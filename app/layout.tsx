import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BVCE Portail',
  description: 'Accès sécurisé à votre espace BVCE',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
