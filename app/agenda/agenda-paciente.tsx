'use client'

import { useState } from 'react'
import { remarcarSessao, cancelarSessao } from './acoes'
import type { SessaoAgendamento } from '@/lib/tipos'
import type { DiaComSlots } from '@/lib/google/disponibilidade'

function formatarSessao(iso: string) {
  const data = new Date(iso)
  return {
    quando: data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
    hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function AgendaPaciente({
  proximaSessao,
  historico,
  gradeRemarcacao,
}: {
  proximaSessao: SessaoAgendamento | null
  historico: SessaoAgendamento[]
  gradeRemarcacao: DiaComSlots[]
}) {
  const [remarcando, setRemarcando] = useState(false)
  const [slotEscolhido, setSlotEscolhido] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  async function aoConfirmarRemarcacao() {
    if (!proximaSessao || !slotEscolhido) return
    setProcessando(true)
    await remarcarSessao(proximaSessao.id, slotEscolhido)
    setProcessando(false)
    setRemarcando(false)
    setSlotEscolhido(null)
  }

  async function aoCancelar() {
    if (!proximaSessao) return
    if (!confirm('Cancelar esta sessão? Você pode agendar uma nova depois.')) return
    setProcessando(true)
    await cancelarSessao(proximaSessao.id)
    setProcessando(false)
  }

  return (
    <>
      <header className="page-header" style={{ paddingBottom: 0 }}>
        <h1 className="display">Agenda</h1>
        <p>Acompanhamento das suas sessões.</p>
      </header>

      {proximaSessao && !remarcando && (
        <div className="session-hero">
          <span className="eyebrow">Próxima sessão</span>
          <div className="when">
            {formatarSessao(proximaSessao.data_hora).quando} · {formatarSessao(proximaSessao.data_hora).hora}
          </div>
          <div className="fmt">
            {proximaSessao.formato === 'online' ? 'Online · Google Meet' : 'Presencial'} ·{' '}
            {proximaSessao.duracao_minutos} min
          </div>
          <div className="session-hero-actions">
            <button type="button" className="btn-secondary" onClick={() => setRemarcando(true)} disabled={processando}>
              Remarcar
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ color: '#c98a61' }}
              onClick={aoCancelar}
              disabled={processando}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!proximaSessao && !remarcando && (
        <div className="estado-vazio">
          Você não tem sessão marcada.
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn-primary" onClick={() => setRemarcando(true)}>
              Agendar sessão
            </button>
          </div>
        </div>
      )}

      {remarcando && (
        <>
          {gradeRemarcacao.map((dia) => (
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
          <div className="confirm-bar">
            <button type="button" className="btn-secondary" style={{ marginBottom: 10 }} onClick={() => setRemarcando(false)}>
              Cancelar remarcação
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!slotEscolhido || processando}
              onClick={aoConfirmarRemarcacao}
            >
              {processando ? 'Confirmando...' : 'Confirmar novo horário'}
            </button>
          </div>
        </>
      )}

      {historico.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 10 }}>Histórico de sessões</div>
          <div style={{ margin: '0 24px' }}>
            {historico.map((s, i) => {
              const f = formatarSessao(s.data_hora)
              return (
                <div key={s.id}>
                  {i > 0 && <hr className="hairline" />}
                  <div className="history-row">
                    <div>
                      <div className="d">{f.quando}</div>
                      <div className="s">{s.formato === 'online' ? 'Online' : 'Presencial'} · {s.duracao_minutos} min</div>
                    </div>
                    <div className="status">{s.status === 'realizada' ? 'Realizada' : s.status === 'cancelada' ? 'Cancelada' : s.status}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
