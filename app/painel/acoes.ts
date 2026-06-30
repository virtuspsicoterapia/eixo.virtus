'use server'

import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function exigirTerapeuta() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase.from('perfis').select('tipo').eq('id', user.id).single()
  if (perfil?.tipo !== 'terapeuta') redirect('/inicio')

  return supabase
}

export async function gerarCodigoConvite(formData: FormData) {
  const supabase = await exigirTerapeuta()
  const nomePaciente = (formData.get('paciente_nome') as string)?.trim()

  const sufixo = Math.random().toString(36).slice(2, 7).toUpperCase()
  const codigo = `VIRTUS-${sufixo}`

  await supabase.from('codigos_convite').insert({
    codigo,
    paciente_nome: nomePaciente || null,
  })

  revalidatePath('/painel')
}

export async function criarRecado(formData: FormData) {
  const supabase = await exigirTerapeuta()

  const texto = (formData.get('texto') as string)?.trim()
  const dataPublicacao = formData.get('data_publicacao') as string
  const publicoAlvo = formData.get('publico_alvo') as string

  if (!texto || !dataPublicacao) return

  await supabase.from('recados').insert({
    texto,
    data_publicacao: dataPublicacao,
    publico_alvo: publicoAlvo || 'todos',
  })

  revalidatePath('/painel')
  revalidatePath('/inicio')
}

export async function marcarEntradaComoLida(entradaId: string) {
  const supabase = await exigirTerapeuta()

  await supabase
    .from('entradas_diario')
    .update({ lida_pelo_terapeuta: true })
    .eq('id', entradaId)

  revalidatePath('/painel')
}
