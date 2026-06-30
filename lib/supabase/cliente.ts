import { createBrowserClient } from '@supabase/ssr'

// Cliente Supabase para uso em componentes do navegador ("use client").
// As variáveis vêm do arquivo .env.local — você vai preenchê-las
// com os dados do seu projeto Supabase no guia de configuração.
export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
