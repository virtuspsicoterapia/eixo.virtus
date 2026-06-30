'use server'

import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'

export async function entrar(formData: FormData) {
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string

  const supabase = await criarClienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error) {
    redirect(`/entrar?erro=${encodeURIComponent('E-mail ou senha incorretos.')}`)
  }

  redirect('/inicio')
}

export async function cadastrar(formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const codigoPaciente = (formData.get('codigo_paciente') as string)?.trim()

  const supabase = await criarClienteServidor()

  const { data: authData, error: erroAuth } = await supabase.auth.signUp({
    email,
    password: senha,
  })

  if (erroAuth || !authData.user) {
    redirect(`/cadastro?erro=${encodeURIComponent(erroAuth?.message || 'Não foi possível criar a conta.')}`)
  }

  const usuarioId = authData.user!.id
  let tipo: 'assinante' | 'paciente_ativo' = 'assinante'
  let codigoValido: string | null = null

  // Se um código de paciente foi informado, valida e consome via
  // função do banco (validar_codigo_convite), que roda com privilégio
  // elevado pois nesse momento o perfil ainda não existe.
  if (codigoPaciente) {
    const { data: valido } = await supabase.rpc('validar_codigo_convite', {
      p_codigo: codigoPaciente,
      p_usuario_id: usuarioId,
    })

    if (valido) {
      tipo = 'paciente_ativo'
      codigoValido = codigoPaciente
    }
  }

  const { error: erroPerfil } = await supabase.from('perfis').insert({
    id: usuarioId,
    nome,
    email,
    tipo,
    codigo_paciente_usado: codigoValido,
  })

  if (erroPerfil) {
    redirect(`/cadastro?erro=${encodeURIComponent('Conta criada, mas houve um problema ao salvar o perfil. Entre em contato.')}`)
  }

  redirect('/auth/confirmar')
}

export async function sair() {
  const supabase = await criarClienteServidor()
  await supabase.auth.signOut()
  redirect('/entrar')
}
