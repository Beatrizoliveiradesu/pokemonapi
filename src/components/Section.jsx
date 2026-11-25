// Cartão genérico: mostra título, controles e os estados de loading / error.
// [CONTROLE DE ESTADO] Cada seção recebe o SEU loading/error, então uma falha não afeta as outras.
export default function Section({ title, subtitle, loading, error, controls, toolbar, children }) {
  return (
    <section className="card">
      <header className="card-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {controls}
      </header>

      {toolbar}

      {loading && <p className="status loading">Carregando…</p>}
      {!loading && error && <p className="status error">⚠ {error}</p>}
      {!loading && !error && children}
    </section>
  );
}
