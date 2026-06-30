'use server'

import { criarClienteServidor } from '@/lib/supabase/servidor'
import { revalidatePath } from 'next/cache'

export async function alternarCompartilhamento(entradaId: string, novoEstado: boolean) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('entradas_diario')
    .update({ compartilhada: novoEstado, atualizado_em: new Date().toISOString() })
    .eq('id', entradaId)
    .eq('usuario_id', user.id)

  revalidatePath(`/diario/${entradaId}`)
  revalidatePath('/diario')
}
