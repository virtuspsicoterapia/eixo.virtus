'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarEntradaDiario } from './acoes'
import type { Humor } from '@/lib/tipos'

const opcoesHumor: { valor: Humor; rotulo: string }[] = [
  { valor: 'pesado', rotulo: 'Pesado' },
  { valor: 'inquieto', rotulo: 'Inquieto' },
  { valor: 'neutro', rotulo: 'Neutro' },
  { valor: 'leve', rotulo: 'Leve' },
  { valor: 'em_paz', rotulo: 'Em paz' },
]

export default function FormularioNovaEntrada({ ehPaciente }: { ehPaciente: boolean }) {
  const router = useRouter()
  const [humor, setHumor] = useState<Humor | null>(null)
  const [compartilhar, setCompartilhar] = useState(false)
  const [conteudo, setConteudo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  async function aoSalvar() {
    if (!conteudo.trim() || enviando) return
    setEnviando(true)
    const formData = new FormData()
    formData.set('conteudo', conteudo)
    if (humor) formData.set('humor', humor)
    formData.set('compartilhada', String(compartilhar))
    await criarEntradaDiario(formData)
  }

  return (
    <div className="app-shell">
      <div className="app-conteudo" style={{ paddingBottom: 40 }}>
        <div className="entry-header">
          <button type="button" className="cancel" onClick={() => router.push('/diario')}>
            Cancelar
          </button>
          <button type="button" className="save" onClick={aoSalvar} disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        <div className="entry-date-lbl">Hoje · {hoje}</div>

        <div className="mood-row">
          {opcoesHumor.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              className={`mood-chip ${humor === opcao.valor ? 'sel' : ''}`}
              onClick={() => setHumor(opcao.valor)}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>

        <textarea
          className="entry-textarea"
          placeholder="Escreva sem se preocupar com forma. Este espaço é seu."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          autoFocus
        />

        {ehPaciente && (
          <div className="share-toggle">
            <div>
              <div className="t">Compartilhar com Julismar</div>
              <div className="s">Ele só verá esta entrada se você ativar. Pode mudar depois.</div>
            </div>
            <button
              type="button"
              className={`switch ${compartilhar ? 'on' : ''}`}
              onClick={() => setCompartilhar(!compartilhar)}
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
