export default function PaginaConfirmar() {
  return (
    <main className="tela-entrar">
      <div className="marca">
        <h1 className="wordmark">Quase lá</h1>
        <p className="wordmark-sub">Confirme seu e-mail para continuar</p>
      </div>
      <p style={{ textAlign: 'center', color: '#9aa6b8', fontSize: 14, lineHeight: 1.6, padding: '0 12px' }}>
        Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta e
        depois volte para entrar.
      </p>
      <a href="/entrar" className="botao-secundario" style={{ marginTop: 28 }}>
        Voltar para entrar
      </a>
    </main>
  )
}
