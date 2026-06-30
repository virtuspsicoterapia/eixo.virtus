'use server'

import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import type { Humor } from '@/lib/tipos'

export async function criarEntradaDiario(formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const conteudo = (formData.get('conteudo') as string)?.trim()
  const humor = (formData.get('humor') as Humor) || null
  const compartilhada = formData.get('compartilhada') === 'true'

  if (!conteudo) {
    redirect('/diario/nova?erro=Escreva algo antes de salvar.')
  }

  const { error } = await supabase.from('entradas_diario').insert({
    usuario_id: user!.id,
    conteudo,
    humor,
    compartilhada,
  })

  if (error) {
    redirect(`/diario/nova?erro=${encodeURIComponent('Não foi possível salvar. Tente novamente.')}`)
  }

  redirect('/diario')
}
