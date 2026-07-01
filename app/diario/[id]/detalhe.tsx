'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { alternarCompartilhamento } from './acoes'
import type { EntradaDiario } from '@/lib/tipos'

const rotuloHumor: Record<string, string> = {
  pesado: 'Pesado',
  inquieto: 'Inquieto',
  neutro: 'Neutro',
  leve: 'Leve',
  em_paz: 'Em paz',
}

export default function DetalheEntrada({ entrada, ehPaciente }: { entrada: EntradaDiario; ehPaciente: boolean }) {
  const router = useRouter()
  const [compartilhar, setCompartilhar] = useState(entrada.compartilhada)
  const [salvando, setSalvando] = useState(false)

  const dataFormatada = new Date(entrada.criado_em).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  async function aoAlternar() {
    const novoEstado = !compartilhar
    setSalvando(true)
    setCompartilhar(novoEstado)
    await alternarCompartilhamento(entrada.id, novoEstado)
    setSalvando(false)
  }

  return (
    <div className="app-shell">
      <div className="app-conteudo" style={{ paddingBottom: 40 }}>
        <div className="entry-header">
          <button type="button" className="cancel" onClick={() => router.push('/diario')}>
            Voltar
          </button>
          <span />
        </div>
        <div className="entry-date-lbl">
          {dataFormatada}
          {entrada.humor && ` · ${rotuloHumor[entrada.humor]}`}
        </div>

        <p
          style={{
            margin: '0 24px',
            fontFamily: 'Fraunces',
            fontSize: 16.5,
            lineHeight: 1.6,
            color: 'var(--bone)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {entrada.conteudo}
        </p>

        {ehPaciente && (
          <div className="share-toggle">
            <div>
              <div className="t">Compartilhar com Julismar</div>
              <div className="s">Ele só verá esta entrada se você ativar. Pode mudar a qualquer momento.</div>
            </div>
            <button
              type="button"
              className={`switch ${compartilhar ? 'on' : ''}`}
              onClick={aoAlternar}
              disabled={salvando}
              aria-pressed={compartilhar}
              aria-label="Compartilhar esta entrada com o terapeuta"
            >
              <div className="knob" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
