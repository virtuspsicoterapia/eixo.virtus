import { entrar } from '@/app/auth-actions'

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <main className="tela-entrar">
      <div className="marca">
        <div className="selo">
          <svg viewBox="0 0 100 100" fill="none">
            <path
              d="M50 12 C30 12 14 28 14 50 C14 72 30 88 50 88 C42 80 37 66 37 50 C37 34 42 20 50 12 Z"
              fill="#C9A961"
              opacity="0.9"
            />
            <g transform="translate(50,50)">
              <circle r="9" fill="#0B1422" stroke="#C9A961" strokeWidth="1.5" />
              <g stroke="#C9A961" strokeWidth="1.4" strokeLinecap="round">
                <line x1="0" y1="-13" x2="0" y2="-20" />
                <line x1="9.2" y1="-9.2" x2="14.5" y2="-14.5" />
                <line x1="13" y1="0" x2="20" y2="0" />
                <line x1="9.2" y1="9.2" x2="14.5" y2="14.5" />
                <line x1="0" y1="13" x2="0" y2="20" />
                <line x1="-9.2" y1="9.2" x2="-14.5" y2="14.5" />
                <line x1="-9.2" y1="-9.2" x2="-14.5" y2="-14.5" />
              </g>
            </g>
          </svg>
        </div>
        <h1 className="wordmark">Eixo</h1>
        <p className="wordmark-sub">por Virtus Psicoterapia</p>
      </div>

      <form action={entrar} className="formulario">
        {erro && <div className="aviso-erro">{erro}</div>}

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" placeholder="seuemail@exemplo.com" required />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" placeholder="••••••••••" required />
        </div>

        <button type="submit" className="botao-principal">
          Entrar
        </button>

        <a href="/recuperar-senha" className="link-secundario">
          Esqueci minha senha
        </a>
      </form>

      <div className="divisor">
        <span /> ou <span />
      </div>

      <a href="/cadastro" className="botao-secundario">
        Criar conta
      </a>

      <div className="nota-convite">
        É paciente da Virtus? No cadastro, insira seu <b>código de paciente</b> para liberar o
        acesso completo, sem custo.
      </div>
    </main>
  )
}
