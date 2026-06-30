import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import BarraNavegacao from '@/app/componentes/barra-navegacao'
import type { Perfil, Trilha, AulaTrilha, ProgressoTrilha } from '@/lib/tipos'

export default async function PaginaTrilhas() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single<Perfil>()
  if (!perfil) redirect('/entrar')

  const ehPaciente = perfil.tipo === 'paciente_ativo' || perfil.tipo === 'terapeuta'

  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('*')
    .eq('publicada', true)
    .order('ordem', { ascending: true })
    .returns<Trilha[]>()

  const { data: aulas } = await supabase
    .from('aulas_trilha')
    .select('*')
    .returns<AulaTrilha[]>()

  const { data: progresso } = await supabase
    .from('progresso_trilha')
    .select('*')
    .eq('usuario_id', user.id)
    .returns<ProgressoTrilha[]>()

  return (
    <div className="app-shell">
      <div className="app-conteudo">
        <header className="page-header">
          <h1 className="display">Trilhas</h1>
          <p>Conteúdo estruturado, no seu tempo.</p>
        </header>

        {!trilhas || trilhas.length === 0 ? (
          <div className="estado-vazio">Nenhuma trilha publicada ainda.</div>
        ) : (
          trilhas.map((trilha) => {
            const aulasDaTrilha = (aulas ?? []).filter((a) => a.trilha_id === trilha.id)
            const totalAulas = aulasDaTrilha.length
            const concluidas = aulasDaTrilha.filter((a) =>
              progresso?.some((p) => p.aula_id === a.id && p.concluida)
            ).length
            const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0

            const exigePaciente = trilha.nivel_exigido === 'paciente_ativo'
            const acessoLiberado = !exigePaciente || ehPaciente

            return (
              <a
                key={trilha.id}
                href={acessoLiberado ? `/trilhas/${trilha.id}` : '#'}
                className="trilha-card"
                style={{ opacity: acessoLiberado ? 1 : 0.55 }}
              >
                <div className="trilha-top">
                  <div>
                    <h3>{trilha.titulo}</h3>
                    {trilha.descricao && <p>{trilha.descricao}</p>}
                  </div>
                  {exigePaciente ? <span className="lock-tag">Pacientes</span> : <span className="free-tag">Incluída</span>}
                </div>
                {totalAulas > 0 && (
                  <>
                    <div className="trilha-progress">
                      <div style={{ width: `${percentual}%` }} />
                    </div>
                    <div className="trilha-meta">
                      Aula {Math.min(concluidas + 1, totalAulas)} de {totalAulas} · {percentual}% concluído
                    </div>
                  </>
                )}
              </a>
            )
          })
        )}
      </div>
      <BarraNavegacao ehTerapeuta={perfil.tipo === 'terapeuta'} />
    </div>
  )
}
