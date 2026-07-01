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
          <img src="/icons/icon-192.png" alt="Eixo — por Virtus Psicoterapia" style={{ width: '100%', height: '100%', borderRadius: 16 }} />
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
