import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import BarraNavegacao from '@/app/componentes/barra-navegacao'
import PainelTerapeuta from './painel-cliente'
import type { Perfil } from '@/lib/tipos'

export default async function PaginaPainel() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single<Perfil>()
  if (!perfil || perfil.tipo !== 'terapeuta') redirect('/inicio')

  const { count: totalPacientes } = await supabase
    .from('perfis')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'paciente_ativo')

  const { count: totalAssinantes } = await supabase
    .from('perfis')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'assinante')

  const { data: solicitacoes } = await supabase
    .from('sessoes_agendamento')
    .select('id, data_hora, perfis(nome)')
    .eq('status', 'pendente')
    .order('data_hora', { ascending: true })

  const { data: entradasCompartilhadas } = await supabase
    .from('entradas_diario')
    .select('id, conteudo, criado_em, perfis(nome)')
    .eq('compartilhada', true)
    .eq('lida_pelo_terapeuta', false)
    .order('criado_em', { ascending: false })

  const { data: ultimoCodigo } = await supabase
    .from('codigos_convite')
    .select('codigo')
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="app-shell">
      <div className="app-conteudo">
        <PainelTerapeuta
          totalPacientes={totalPacientes ?? 0}
          totalAssinantes={totalAssinantes ?? 0}
          solicitacoes={(solicitacoes as unknown as { id: string; data_hora: string; perfis: { nome: string } | null }[]) ?? []}
          entradasCompartilhadas={
            (entradasCompartilhadas as unknown as {
              id: string
              conteudo: string
              criado_em: string
              perfis: { nome: string } | null
            }[]) ?? []
          }
          ultimoCodigoGerado={ultimoCodigo?.codigo ?? null}
        />
      </div>
      <BarraNavegacao ehTerapeuta />
    </div>
  )
}
