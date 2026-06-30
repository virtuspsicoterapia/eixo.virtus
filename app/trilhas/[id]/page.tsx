import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect, notFound } from 'next/navigation'
import ListaAulas from './lista-aulas'
import type { Perfil, Trilha, AulaTrilha, ProgressoTrilha } from '@/lib/tipos'

export default async function PaginaDetalheTrilha({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single<Perfil>()
  if (!perfil) redirect('/entrar')

  const { data: trilha } = await supabase.from('trilhas').select('*').eq('id', id).single<Trilha>()
  if (!trilha) notFound()

  const ehPaciente = perfil.tipo === 'paciente_ativo' || perfil.tipo === 'terapeuta'
  if (trilha.nivel_exigido === 'paciente_ativo' && !ehPaciente) {
    redirect('/trilhas')
  }

  const { data: aulas } = await supabase
    .from('aulas_trilha')
    .select('*')
    .eq('trilha_id', id)
    .order('ordem', { ascending: true })
    .returns<AulaTrilha[]>()

  const { data: progresso } = await supabase
    .from('progresso_trilha')
    .select('*')
    .eq('usuario_id', user.id)
    .returns<ProgressoTrilha[]>()

  const concluidasIniciais = (progresso ?? []).filter((p) => p.concluida).map((p) => p.aula_id)

  return <ListaAulas trilhaId={id} aulas={aulas ?? []} concluidasIniciais={concluidasIniciais} />
}
