import { useEffect, useState } from 'react';
import { fetchByUrl, flattenEvolutionChain, spriteUrlById } from '../services/api.js';

const initial = { data: null, loading: false, error: null };

// Desafio 2: requisições ENCADEADAS em 3 níveis
//   1) pokemon (API principal, já carregado e recebido por props)
//   2) species          -> pokemon.species.url
//   3) evolution_chain  -> species.evolution_chain.url
export default function EvolutionChain({ pokemon, onSelect }) {
  // [CONTROLE DE ESTADO] um estado { data, loading, error } para cada nível
  const [species, setSpecies] = useState(initial);
  const [chain, setChain] = useState(initial);

  // [DEPENDÊNCIAS] nível 2: roda sempre que o `pokemon` muda
  useEffect(() => {
    let cancelled = false; // evita aplicar resposta antiga (race condition)
    setSpecies({ data: null, loading: true, error: null });
    setChain(initial); // a cadeia antiga deixa de valer

    fetchByUrl(pokemon.species.url)
      .then((data) => !cancelled && setSpecies({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setSpecies({ data: null, loading: false, error: err.message }));

    return () => { cancelled = true; };
  }, [pokemon]);

  // [DEPENDÊNCIAS] nível 3: só roda quando `species` chegou (species.data é a dependência)
  useEffect(() => {
    const url = species.data?.evolution_chain?.url;
    if (!url) return;
    let cancelled = false;
    setChain({ data: null, loading: true, error: null });

    fetchByUrl(url)
      .then((data) => !cancelled && setChain({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setChain({ data: null, loading: false, error: err.message }));

    return () => { cancelled = true; };
  }, [species.data]);

  if (species.loading || chain.loading) return <p className="status loading">Buscando evoluções…</p>;
  if (species.error) return <p className="status error">⚠ species: {species.error}</p>;
  if (chain.error) return <p className="status error">⚠ evolution_chain: {chain.error}</p>;
  if (!chain.data) return null;

  const levels = flattenEvolutionChain(chain.data.chain);

  return (
    <div className="evolution">
      <h4>Cadeia de evolução</h4>
      {levels.length === 1 && <p className="muted">Este Pokémon não evolui.</p>}
      <div className="evolution-levels">
        {levels.map((level, index) => (
          <div className="evolution-level" key={index}>
            {index > 0 && <span className="arrow">➜</span>}
            <div className="evolution-group">
              {level.map((stage) => (
                <button
                  key={stage.id}
                  className={`stage ${stage.name === pokemon.name ? 'current' : ''}`}
                  onClick={() => onSelect(stage.id)}
                  title="Carregar este Pokémon"
                >
                  <img src={spriteUrlById(stage.id)} alt={stage.name} />
                  <strong>{stage.name}</strong>
                  <small>
                    {index === 0
                      ? 'Estágio inicial'
                      : stage.minLevel
                        ? `Nível ${stage.minLevel}`
                        : stage.item ?? stage.trigger ?? ''}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
