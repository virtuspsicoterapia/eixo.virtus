'use server'

import { criarClienteServidor } from '@/lib/supabase/servidor'
import { criarEventoAgenda, atualizarEventoAgenda, cancelarEventoAgenda } from '@/lib/google/calendario'
import { DURACAO_PADRAO_MINUTOS } from '@/lib/google/disponibilidade'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Perfil } from '@/lib/tipos'

// Usado por NÃO-PACIENTES: cria uma solicitação pendente.
// Não cria evento no Google Agenda ainda — isso só acontece quando
// o terapeuta confirma manualmente no painel (ver confirmarSessao).
export async function solicitarPrimeiraSessao(formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const dataHora = formData.get('data_hora') as string
  const motivo = (formData.get('motivo_contato') as string)?.trim() || null
  const formato = (formData.get('formato') as string) || 'online'

  await supabase.from('sessoes_agendamento').insert({
    usuario_id: user!.id,
    data_hora: dataHora,
    duracao_minutos: DURACAO_PADRAO_MINUTOS,
    formato,
    status: 'pendente',
    motivo_contato: motivo,
  })

  redirect('/agenda?solicitado=1')
}

// Usado pelo TERAPEUTA no painel: aprova uma solicitação pendente,
// criando o evento real no Google Agenda com Meet incluído.
export async function confirmarSessao(sessaoId: string) {
  const supabase = await criarClienteServidor()

  const { data: sessao } = await supabase
    .from('sessoes_agendamento')
    .select('*, perfis(nome, email)')
    .eq('id', sessaoId)
    .single()

  if (!sessao) return

  const perfil = sessao.perfis as unknown as Perfil

  const { eventId } = await criarEventoAgenda({
    titulo: `Sessão — ${perfil.nome}`,
    descricao: sessao.motivo_contato ? `Motivo do contato: ${sessao.motivo_contato}` : undefined,
    dataHoraInicioISO: sessao.data_hora,
    duracaoMinutos: sessao.duracao_minutos,
    comGoogleMeet: sessao.formato === 'online',
    emailConvidado: perfil.email,
  })

  await supabase
    .from('sessoes_agendamento')
    .update({ status: 'confirmada', google_event_id: eventId, atualizado_em: new Date().toISOString() })
    .eq('id', sessaoId)

  revalidatePath('/painel')
  revalidatePath('/agenda')
}

// Usado por PACIENTES ATIVOS para remarcar uma sessão já confirmada.
export async function remarcarSessao(sessaoId: string, novaDataHoraISO: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: sessao } = await supabase
    .from('sessoes_agendamento')
    .select('*')
    .eq('id', sessaoId)
    .eq('usuario_id', user.id)
    .single()

  if (!sessao) return

  if (sessao.google_event_id) {
    await atualizarEventoAgenda(sessao.google_event_id, novaDataHoraISO, sessao.duracao_minutos)
  }

  await supabase
    .from('sessoes_agendamento')
    .update({ data_hora: novaDataHoraISO, atualizado_em: new Date().toISOString() })
    .eq('id', sessaoId)

  revalidatePath('/agenda')
}

export async function cancelarSessao(sessaoId: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: sessao } = await supabase
    .from('sessoes_agendamento')
    .select('*')
    .eq('id', sessaoId)
    .eq('usuario_id', user.id)
    .single()

  if (!sessao) return

  if (sessao.google_event_id) {
    await cancelarEventoAgenda(sessao.google_event_id)
  }

  await supabase
    .from('sessoes_agendamento')
    .update({ status: 'cancelada', atualizado_em: new Date().toISOString() })
    .eq('id', sessaoId)

  revalidatePath('/agenda')
}
