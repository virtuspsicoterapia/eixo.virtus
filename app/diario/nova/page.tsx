import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import FormularioNovaEntrada from './formulario'

export default async function PaginaNovaEntrada() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('tipo')
    .eq('id', user.id)
    .single()

  const ehPaciente = perfil?.tipo === 'paciente_ativo'

  return <FormularioNovaEntrada ehPaciente={ehPaciente} />
}
