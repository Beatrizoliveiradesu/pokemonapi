// Desafio 1: botões de busca sequencial (anterior/próximo) e randômica.
export default function Navigator({ label, onPrev, onNext, onRandom, disabled }) {
  return (
    <div className="navigator">
      <button onClick={onPrev} disabled={disabled} title="Anterior">◀</button>
      {label && <span className="nav-label">{label}</span>}
      <button onClick={onNext} disabled={disabled} title="Próximo">▶</button>
      <button onClick={onRandom} disabled={disabled} className="accent">🎲 Aleatório</button>
    </div>
  );
}
