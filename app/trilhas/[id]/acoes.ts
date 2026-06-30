'use server'

import { criarClienteServidor } from '@/lib/supabase/servidor'
import { revalidatePath } from 'next/cache'

export async function alternarConclusaoAula(aulaId: string, trilhaId: string, concluida: boolean) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('progresso_trilha')
    .upsert({
      usuario_id: user.id,
      aula_id: aulaId,
      concluida,
      concluida_em: concluida ? new Date().toISOString() : null,
    })

  revalidatePath(`/trilhas/${trilhaId}`)
  revalidatePath('/trilhas')
}
