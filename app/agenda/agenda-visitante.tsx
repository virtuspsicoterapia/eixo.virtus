'use client'

import { useState } from 'react'
import { solicitarPrimeiraSessao } from './acoes'
import type { DiaComSlots } from '@/lib/google/disponibilidade'

export default function AgendaVisitante({ grade }: { grade: DiaComSlots[] }) {
  const [slotEscolhido, setSlotEscolhido] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function aoSolicitar(formData: FormData) {
    if (!slotEscolhido) return
    setEnviando(true)
    formData.set('data_hora', slotEscolhido)
    formData.set('formato', 'online')
    await solicitarPrimeiraSessao(formData)
  }

  const dataFormatada = slotEscolhido
    ? new Date(slotEscolhido).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) +
      ' · ' +
      new Date(slotEscolhido).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <>
      <header className="page-header" style={{ paddingBottom: 0 }}>
        <h1 className="display">Agendar sessão</h1>
        <p>Marque uma primeira conversa com Julismar.</p>
      </header>

      <div className="intro-banner">
        <p>Esta é sua primeira sessão. Julismar confirma o horário em até 24h — você recebe um aviso quando for aprovado.</p>
      </div>

      <div className="therapist-card">
        <div className="ph">J</div>
        <div>
          <div className="t">Julismar Rodrigues</div>
          <div className="s">Sessão presencial ou online · 50 min</div>
        </div>
      </div>

      {grade.map((dia) => (
        <div key={dia.data}>
          <div className="slot-group-lbl">{dia.rotuloDia}</div>
          <div className="slot-grid">
            {dia.slots.map((slot) => (
              <button
                key={slot.dataHoraISO}
                type="button"
                disabled={slot.ocupado}
                className={`slot ${slot.ocupado ? 'taken' : ''} ${slotEscolhido === slot.dataHoraISO ? 'sel' : ''}`}
                onClick={() => setSlotEscolhido(slot.dataHoraISO)}
              >
                {new Date(slot.dataHoraISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>
      ))}

      <form action={aoSolicitar}>
        <div className="reason-field">
          <label>Motivo do contato (opcional)</label>
          <textarea name="motivo_contato" placeholder="Em poucas palavras, o que te trouxe até aqui..." />
        </div>

        <div className="confirm-bar" style={{ marginTop: 0 }}>
          {slotEscolhido && (
            <>
              <div className="confirm-row">
                <span>Horário</span>
                <b>{dataFormatada}</b>
              </div>
              <div className="confirm-row">
                <span>Formato</span>
                <b>Online · Google Meet</b>
              </div>
            </>
          )}
          <button type="submit" className="btn-primary" disabled={!slotEscolhido || enviando}>
            {enviando ? 'Enviando...' : 'Solicitar agendamento'}
          </button>
          <div className="pending-note" style={{ margin: '10px 0 0', textAlign: 'center' }}>
            Fica pendente até confirmação de Julismar.
          </div>
        </div>
      </form>
    </>
  )
}
