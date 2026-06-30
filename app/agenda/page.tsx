import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import BarraNavegacao from '@/app/componentes/barra-navegacao'
import AgendaPaciente from './agenda-paciente'
import AgendaVisitante from './agenda-visitante'
import { gerarGradeDisponibilidade } from '@/lib/google/disponibilidade'
import type { Perfil, SessaoAgendamento } from '@/lib/tipos'

export default async function PaginaAgenda() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single<Perfil>()
  if (!perfil) redirect('/entrar')

  const ehPaciente = perfil.tipo === 'paciente_ativo'

  if (ehPaciente) {
    const { data: proximaSessao } = await supabase
      .from('sessoes_agendamento')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('status', 'confirmada')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
      .returns<SessaoAgendamento[]>()

    const { data: historico } = await supabase
      .from('sessoes_agendamento')
      .select('*')
      .eq('usuario_id', user.id)
      .in('status', ['realizada', 'cancelada'])
      .order('data_hora', { ascending: false })
      .returns<SessaoAgendamento[]>()

    const gradeRemarcacao = await gerarGradeDisponibilidade(5)

    return (
      <div className="app-shell">
        <div className="app-conteudo">
          <AgendaPaciente
            proximaSessao={proximaSessao?.[0] ?? null}
            historico={historico ?? []}
            gradeRemarcacao={gradeRemarcacao}
          />
        </div>
        <BarraNavegacao ehTerapeuta={perfil.tipo === 'terapeuta'} />
      </div>
    )
  }

  const grade = await gerarGradeDisponibilidade(5)

  return (
    <div className="app-shell">
      <div className="app-conteudo">
        <AgendaVisitante grade={grade} />
      </div>
      <BarraNavegacao ehTerapeuta={perfil.tipo === 'terapeuta'} />
    </div>
  )
}
