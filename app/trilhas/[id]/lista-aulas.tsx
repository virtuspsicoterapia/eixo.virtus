'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { alternarConclusaoAula } from './acoes'
import type { AulaTrilha } from '@/lib/tipos'

export default function ListaAulas({
  trilhaId,
  aulas,
  concluidasIniciais,
}: {
  trilhaId: string
  aulas: AulaTrilha[]
  concluidasIniciais: string[]
}) {
  const router = useRouter()
  const [concluidas, setConcluidas] = useState(new Set(concluidasIniciais))

  async function aoMarcar(aulaId: string) {
    const novoEstado = !concluidas.has(aulaId)
    const novoSet = new Set(concluidas)
    novoEstado ? novoSet.add(aulaId) : novoSet.delete(aulaId)
    setConcluidas(novoSet)
    await alternarConclusaoAula(aulaId, trilhaId, novoEstado)
  }

  return (
    <div className="app-shell">
      <div className="app-conteudo">
        <div className="entry-header">
          <button type="button" className="cancel" onClick={() => router.push('/trilhas')}>
            Voltar
          </button>
          <span />
        </div>

        <div className="entry-list" style={{ marginTop: 10 }}>
          {aulas.map((aula, i) => {
            const feita = concluidas.has(aula.id)
            return (
              <div key={aula.id} className="entry-row" onClick={() => aoMarcar(aula.id)}>
                <div className="meta">
                  <div className="date">Aula {i + 1}</div>
                  <div className="snippet">{aula.titulo}</div>
                </div>
                <div className={`state-pill ${feita ? 'shared' : 'private'}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {feita ? 'Concluída' : 'Pendente'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
