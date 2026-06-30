import { redirect } from 'next/navigation'
import { criarClienteServidor } from '@/lib/supabase/servidor'

// Rota raiz: encaminha quem já está logado para /inicio, e quem
// não está logado para a tela de entrada.
export default async function PaginaRaiz() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()

  redirect(user ? '/inicio' : '/entrar')
}
