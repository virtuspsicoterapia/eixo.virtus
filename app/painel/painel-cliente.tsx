'use client'

import { useState } from 'react'
import { gerarCodigoConvite, criarRecado, marcarEntradaComoLida } from './acoes'
import { confirmarSessao } from '@/app/agenda/acoes'

interface SolicitacaoPendente {
  id: string
  data_hora: string
  perfis: { nome: string } | null
}

interface EntradaCompartilhada {
  id: string
  conteudo: string
  criado_em: string
  perfis: { nome: string } | null
}

export default function PainelTerapeuta({
  totalPacientes,
  totalAssinantes,
  solicitacoes,
  entradasCompartilhadas,
  ultimoCodigoGerado,
}: {
  totalPacientes: number
  totalAssinantes: number
  solicitacoes: SolicitacaoPendente[]
  entradasCompartilhadas: EntradaCompartilhada[]
  ultimoCodigoGerado: string | null
}) {
  const [modalAberto, setModalAberto] = useState<'codigo' | 'recado' | null>(null)
  const [entradaAberta, setEntradaAberta] = useState<EntradaCompartilhada | null>(null)
  const [processandoId, setProcessandoId] = useState<string | null>(null)

  async function aoConfirmar(id: string) {
    setProcessandoId(id)
    await confirmarSessao(id)
    setProcessandoId(null)
  }

  async function aoAbrirEntrada(entrada: EntradaCompartilhada) {
    setEntradaAberta(entrada)
    await marcarEntradaComoLida(entrada.id)
  }

  return (
    <>
      <header className="home-header">
        <div className="home-greeting">
          <span className="eyebrow">Painel Eixo</span>
          <h1 style={{ fontSize: 21 }}>Visão geral</h1>
        </div>
        <div className="home-avatar" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>J</div>
      </header>

      <div className="admin-stats">
        <div className="admin-stat"><div className="n">{totalPacientes}</div><div className="l">Pacientes ativos</div></div>
        <div className="admin-stat"><div className="n">{totalAssinantes}</div><div className="l">Assinantes</div></div>
        <div className="admin-stat"><div className="n">{solicitacoes.length}</div><div className="l">Solicitações</div></div>
      </div>

      <div className="section-label">Solicitações de 1ª sessão</div>
      {solicitacoes.length === 0 ? (
        <div className="estado-vazio" style={{ padding: '0 24px 20px', textAlign: 'left' }}>Nenhuma solicitação pendente.</div>
      ) : (
        solicitacoes.map((s) => (
          <button key={s.id} className="queue-item" onClick={() => aoConfirmar(s.id)} disabled={processandoId === s.id}>
            <div className="ph" style={{ background: 'var(--olive)', color: 'var(--navy)' }}>
              {(s.perfis?.nome ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="name">
                {s.perfis?.nome ?? 'Visitante'} <span style={{ color: '#7e8ba0', fontWeight: 400 }}>· não-paciente</span>
              </div>
              <div className="when">
                {new Date(s.data_hora).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} ·{' '}
                {new Date(s.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {processandoId === s.id ? ' · confirmando...' : ' · tocar para confirmar'}
              </div>
            </div>
            <div className="dot" style={{ background: 'var(--gold)' }} />
          </button>
        ))
      )}

      <div className="section-label" style={{ marginTop: 6 }}>Entradas compartilhadas</div>
      {entradasCompartilhadas.length === 0 ? (
        <div className="estado-vazio" style={{ padding: '0 24px 20px', textAlign: 'left' }}>Nada compartilhado por enquanto.</div>
      ) : (
        entradasCompartilhadas.map((e) => (
          <button key={e.id} className="queue-item" onClick={() => aoAbrirEntrada(e)}>
            <div className="ph">{(e.perfis?.nome ?? '?').charAt(0).toUpperCase()}</div>
            <div>
              <div className="name">{e.perfis?.nome ?? 'Paciente'}</div>
              <div className="when">
                {new Date(e.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · entrada compartilhada
              </div>
            </div>
            <div className="dot" />
          </button>
        ))
      )}

      <div style={{ height: 10 }} />
      <div className="section-label">Ações rápidas</div>
      <div className="admin-action-row">
        <button type="button" className="btn-primary" onClick={() => setModalAberto('recado')}>
          + Recado do dia
        </button>
        <button type="button" className="btn-secondary" onClick={() => setModalAberto('codigo')}>
          + Código convite
        </button>
      </div>

      {ultimoCodigoGerado && (
        <div className="nota-convite" style={{ margin: '0 24px 20px' }}>
          Último código gerado: <b>{ultimoCodigoGerado}</b> — envie para o paciente usar no cadastro.
        </div>
      )}

      {/* ---- Modal: gerar código de convite ---- */}
      {modalAberto === 'codigo' && (
        <div className="modal-overlay" onClick={() => setModalAberto(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Gerar código de convite</h2>
            <form action={async (fd) => { await gerarCodigoConvite(fd); setModalAberto(null) }}>
              <div className="campo">
                <label>Nome do paciente (opcional)</label>
                <input name="paciente_nome" type="text" placeholder="Ex: Idalina M." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Gerar código</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Modal: novo recado ---- */}
      {modalAberto === 'recado' && (
        <div className="modal-overlay" onClick={() => setModalAberto(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Novo recado / reflexão</h2>
            <form action={async (fd) => { await criarRecado(fd); setModalAberto(null) }}>
              <div className="campo">
                <label>Texto</label>
                <textarea
                  name="texto"
                  required
                  style={{
                    width: '100%', minHeight: 90, background: 'rgba(245,241,232,0.04)',
                    border: '1px solid var(--line)', borderRadius: 'var(--radius)', color: 'var(--bone)',
                    fontFamily: 'Fraunces', fontSize: 14.5, padding: '12px 13px', resize: 'none',
                  }}
                  placeholder="A ordem não é a ausência de tempestade..."
                />
              </div>
              <div className="campo">
                <label>Data de publicação</label>
                <input name="data_publicacao" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="campo">
                <label>Público</label>
                <select
                  name="publico_alvo"
                  style={{
                    width: '100%', background: 'rgba(245,241,232,0.04)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)', color: 'var(--bone)', fontFamily: 'Inter', fontSize: 14.5,
                    padding: '13px 14px',
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="pacientes">Só pacientes ativos</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Modal: leitura de entrada compartilhada ---- */}
      {entradaAberta && (
        <div className="modal-overlay" onClick={() => setEntradaAberta(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{entradaAberta.perfis?.nome ?? 'Paciente'}</h2>
            <div className="diario-leitura" style={{ margin: 0 }}>{entradaAberta.conteudo}</div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setEntradaAberta(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
