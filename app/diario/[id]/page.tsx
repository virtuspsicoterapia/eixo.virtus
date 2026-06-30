import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect, notFound } from 'next/navigation'
import DetalheEntrada from './detalhe'
import type { EntradaDiario } from '@/lib/tipos'

export default async function PaginaDetalheEntrada({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: entrada } = await supabase
    .from('entradas_diario')
    .select('*')
    .eq('id', id)
    .eq('usuario_id', user.id)
    .single<EntradaDiario>()

  if (!entrada) notFound()

  return <DetalheEntrada entrada={entrada} />
}
