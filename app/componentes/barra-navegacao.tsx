'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const abas = [
  {
    href: '/inicio',
    label: 'Início',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: '/diario',
    label: 'Diário',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 4h10l3 3v13H6z" />
        <path d="M10 9h6M10 13h6" />
      </svg>
    ),
  },
  {
    href: '/trilhas',
    label: 'Trilhas',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    href: '/agenda',
    label: 'Agenda',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="5" width="18" height="16" rx="1" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
]

const abaPainel = {
  href: '/painel',
  label: 'Painel',
  icone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
}

export default function BarraNavegacao({ ehTerapeuta = false }: { ehTerapeuta?: boolean }) {
  const caminho = usePathname()
  const itens = ehTerapeuta ? [...abas, abaPainel] : abas

  return (
    <nav className="tabbar">
      {itens.map((aba) => {
        const ativa = caminho.startsWith(aba.href)
        return (
          <Link key={aba.href} href={aba.href} className={`tab ${ativa ? 'active' : ''}`}>
            {aba.icone}
            <span>{aba.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
