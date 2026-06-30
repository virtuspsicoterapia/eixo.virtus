import { criarClienteServidor } from '@/lib/supabase/servidor'
import { redirect } from 'next/navigation'
import BarraNavegacao from '@/app/componentes/barra-navegacao'
import type { EntradaDiario } from '@/lib/tipos'

function formatarDataEntrada(iso: string) {
  const data = new Date(iso)
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)

  const mesmoDia = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (mesmoDia(data, hoje)) return `Hoje · ${hora}`
  if (mesmoDia(data, ontem)) return `Ontem · ${hora}`
  return `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${hora}`
}

export default async function PaginaDiario() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: entradas } = await supabase
    .from('entradas_diario')
    .select('*')
    .eq('usuario_id', user.id)
    .order('criado_em', { ascending: false })
    .returns<EntradaDiario[]>()

  const { data: perfil } = await supabase.from('perfis').select('tipo').eq('id', user.id).single()

  return (
    <div className="app-shell">
      <div className="app-conteudo">
        <header className="page-header">
          <h1 className="display">Diário</h1>
          <p>Suas entradas ficam privadas por padrão. Você escolhe o que compartilhar, e quando.</p>
        </header>

        <div className="safety-strip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
          </svg>
          <p>
            Conteúdo privado não é acompanhado em tempo real. Em crise, <a href="tel:188">ligue 188 (CVV)</a> ou
            use o botão de emergência.
          </p>
        </div>

        <a href="/diario/nova" className="new-entry-btn" style={{ textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova entrada
        </a>

        {!entradas || entradas.length === 0 ? (
          <div className="estado-vazio">
            Você ainda não escreveu nenhuma entrada. Quando escrever, ela aparece aqui.
          </div>
        ) : (
          <div className="entry-list">
            {entradas.map((entrada) => (
              <a
                key={entrada.id}
                href={`/diario/${entrada.id}`}
                className="entry-row"
                style={{ textDecoration: 'none' }}
              >
                <div className="meta">
                  <div className="date">{formatarDataEntrada(entrada.criado_em)}</div>
                  <div className="snippet">
                    {entrada.conteudo.length > 60 ? `${entrada.conteudo.slice(0, 60)}...` : entrada.conteudo}
                  </div>
                </div>
                <div className={`state-pill ${entrada.compartilhada ? 'shared' : 'private'}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {entrada.compartilhada ? 'Compartilhada' : 'Privada'}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <BarraNavegacao ehTerapeuta={perfil?.tipo === 'terapeuta'} />
    </div>
  )
}
