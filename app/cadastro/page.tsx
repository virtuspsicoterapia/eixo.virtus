import { cadastrar } from '@/app/auth-actions'

export default async function PaginaCadastro({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <main className="tela-entrar">
      <div className="marca">
        <h1 className="wordmark">Criar conta</h1>
        <p className="wordmark-sub">Eixo — por Virtus Psicoterapia</p>
      </div>

      <form action={cadastrar} className="formulario">
        {erro && <div className="aviso-erro">{erro}</div>}

        <div className="campo">
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" type="text" placeholder="Seu nome" required />
        </div>

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" placeholder="seuemail@exemplo.com" required />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
        </div>

        <div className="campo">
          <label htmlFor="codigo_paciente">Código de paciente (opcional)</label>
          <input
            id="codigo_paciente"
            name="codigo_paciente"
            type="text"
            placeholder="Só preencha se você já é paciente"
          />
        </div>

        <button type="submit" className="botao-principal">
          Criar conta
        </button>
      </form>

      <a href="/entrar" className="link-secundario" style={{ marginTop: 18, display: 'block', textAlign: 'center' }}>
        Já tenho conta — entrar
      </a>
    </main>
  )
}
