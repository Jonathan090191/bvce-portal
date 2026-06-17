'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/souscriptions', label: 'Souscriptions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/dashboard/bordereaux', label: 'Bordereaux', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
]

const ADMIN_NAV = [
  { href: '/dashboard/mandataires', label: 'Mandataires', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const isAdmin = role === 'admin'

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">BVCE Portail</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Menu</p>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <svg className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 mt-5">Admin</p>
            {ADMIN_NAV.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <svg className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
