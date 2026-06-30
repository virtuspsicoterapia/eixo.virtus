import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import BarraNavegacao from '@/app/componentes/barra-navegacao'
import type { Perfil, Recado, SessaoAgendamento } from '@/lib/tipos'

function formatarDataExtensa(data: Date) {
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function primeiroNome(nomeCompleto: string) {
  return nomeCompleto.trim().split(' ')[0]
}

export default async function PaginaInicio() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single<Perfil>()

  if (!perfil) redirect('/entrar')

  const ehPaciente = perfil.tipo === 'paciente_ativo'
  const hojeISO = new Date().toISOString().slice(0, 10)

  // Busca o recado de hoje: geral, ou específico para este usuário,
  // ou (se for paciente) o recado segmentado para pacientes.
  const { data: recados } = await supabase
    .from('recados')
    .select('*')
    .eq('data_publicacao', hojeISO)
    .returns<Recado[]>()

  const recadoDoDia =
    recados?.find((r) => r.publico_alvo === 'usuario_especifico' && r.usuario_especifico_id === user.id) ||
    recados?.find((r) => r.publico_alvo === 'pacientes' && ehPaciente) ||
    recados?.find((r) => r.publico_alvo === 'todos')

  // Próxima sessão confirmada (só relevante para pacientes ativos)
  let proximaSessao: SessaoAgendamento | null = null
  if (ehPaciente) {
    const { data } = await supabase
      .from('sessoes_agendamento')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('status', 'confirmada')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
      .returns<SessaoAgendamento[]>()
    proximaSessao = data?.[0] ?? null
  }

  return (
    <div className="app-shell">
      <div className="app-conteudo">
        <header className="home-header">
          <div className="home-greeting">
            <span className="eyebrow">{formatarDataExtensa(new Date())}</span>
            <h1>
              Bom te ver,
              <br />
              {primeiroNome(perfil.nome)}.
            </h1>
          </div>
          <div className="home-avatar">{perfil.nome.charAt(0).toUpperCase()}</div>
        </header>

        {ehPaciente && (
          <div className="badge-row">
            <span className="badge">Acompanhamento ativo</span>
          </div>
        )}

        <div className="reflection-card">
          <div className="reflection-date">Reflexão do dia</div>
          {recadoDoDia ? (
            <p className="quote">{recadoDoDia.texto}</p>
          ) : (
            <p className="reflection-empty">Nenhuma reflexão publicada hoje. Volte mais tarde.</p>
          )}
          <div className="attribution">— Julismar, para você</div>
        </div>

        {ehPaciente && (
          <>
            <div className="section-label">Continue de onde parou</div>
            <a href="/diario/nova" className="schedule-strip" style={{ textDecoration: 'none' }}>
              <div>
                <div className="t">Escrever no diário hoje</div>
                <div className="s">Um espaço para organizar o que sentiu</div>
              </div>
              <button type="button">Abrir</button>
            </a>

            {proximaSessao && (
              <div className="schedule-strip">
                <div>
                  <div className="t">Próxima sessão</div>
                  <div className="s">
                    {new Date(proximaSessao.data_hora).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}{' '}
                    ·{' '}
                    {new Date(proximaSessao.data_hora).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <a href="/agenda">
                  <button type="button">Ver agenda</button>
                </a>
              </div>
            )}
          </>
        )}

        {!ehPaciente && (
          <div className="schedule-strip">
            <div>
              <div className="t">Quer começar um acompanhamento?</div>
              <div className="s">Agende uma primeira conversa</div>
            </div>
            <a href="/agenda">
              <button type="button">Agendar</button>
            </a>
          </div>
        )}
      </div>
      <BarraNavegacao ehTerapeuta={perfil.tipo === 'terapeuta'} />
    </div>
  )
}
