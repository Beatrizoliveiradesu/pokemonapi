import { useState } from 'react';
import Section from './Section.jsx';
import Navigator from './Navigator.jsx';
import EvolutionChain from './EvolutionChain.jsx';
import { POKEMON_TOTAL, spriteUrlById } from '../services/api.js';

// Atividade 2: pet do personagem (nome, tipos e sprite) + Desafio 2 (cadeia de evolução).
export default function PokemonSection({ state, onSelect }) {
  const [search, setSearch] = useState('');
  const pokemon = state.data;
  const currentId = pokemon?.id ?? 1;

  const handleSearch = (event) => {
    event.preventDefault();
    if (search.trim()) onSelect(search.trim());
  };

  return (
    <Section
      title="Atividade 2 · Pet Pokémon"
      subtitle="Nome, tipos e sprite da PokéAPI, mais a cadeia de evolução."
      loading={state.loading}
      error={state.error}
      controls={
        <Navigator
          label={`#${currentId}`}
          onPrev={() => onSelect(currentId <= 1 ? POKEMON_TOTAL : currentId - 1)}
          onNext={() => onSelect(currentId >= POKEMON_TOTAL ? 1 : currentId + 1)}
          onRandom={() => onSelect(Math.floor(Math.random() * POKEMON_TOTAL) + 1)}
          disabled={state.loading}
        />
      }
      toolbar={
        <form className="inline-form" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome ou número (ex.: pikachu, 25)"
          />
          <button type="submit">Buscar</button>
        </form>
      }
    >
      {pokemon && (
        <>
          <div className="profile">
            <img
              src={pokemon.sprites.front_default ?? spriteUrlById(pokemon.id)}
              alt={pokemon.name}
              className="sprite"
            />
            <div>
              <h3 className="capitalize">{pokemon.name}</h3>
              <div className="types">
                {pokemon.types.map((t) => (
                  <span key={t.type.name} className={`badge type-${t.type.name}`}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* [DEPENDÊNCIAS] a cadeia depende do `pokemon` carregado acima */}
          <EvolutionChain pokemon={pokemon} onSelect={onSelect} />
        </>
      )}
    </Section>
  );
}
