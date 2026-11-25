import { useEffect, useRef, useState } from 'react';
import {
  createPerson,
  fetchCharacterById,
  fetchCharacterList,
  fetchPersons,
  fetchPokemon,
} from './services/api.js';
import ProfileSection from './components/ProfileSection.jsx';
import CharacterSection from './components/CharacterSection.jsx';
import PokemonSection from './components/PokemonSection.jsx';
import MovieSection from './components/MovieSection.jsx';

// [CONTROLE DE ESTADO] formato padrão de cada seção: { data, loading, error }
const initial = { data: null, loading: true, error: null };

// Converte o resultado do Promise.allSettled no formato de estado acima.
// Uma requisição que falhou vira { error } e NÃO derruba as outras.
const fromSettled = (result) =>
  result.status === 'fulfilled'
    ? { data: result.value, loading: false, error: null }
    : { data: null, loading: false, error: result.reason?.message ?? 'Erro desconhecido' };

export default function App() {
  // ---------- [CONTROLE DE ESTADO] um estado independente por seção ----------
  const [persons, setPersons] = useState(initial);
  const [character, setCharacter] = useState(initial);
  const [pokemon, setPokemon] = useState(initial);

  // seleções do usuário
  const [characterList, setCharacterList] = useState([]); // todos os personagens (para navegar por índice)
  const [characterIndex, setCharacterIndex] = useState(0); // posição atual na lista (sempre válida)
  const [pokemonKey, setPokemonKey] = useState(1); // id ou nome
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  // Nome do personagem: vive no App (fora do personagem), por isso NÃO some ao navegar com ◀ ▶ / 🎲
  const [displayName, setDisplayName] = useState('Beatriz Oliveira');

  // booted: indica que o carregamento inicial (paralelo) terminou.
  // Os refs guardam o que já foi carregado, para os useEffect não repetirem a requisição inicial.
  const [booted, setBooted] = useState(false);
  const loadedCharacterIndex = useRef(null);
  const loadedPokemonKey = useRef(null);

  // ============================================================
  // [CONSUMO SIMULTÂNEO] + [SINCRONISMO]
  // As 3 requisições iniciais disparam ao mesmo tempo com Promise.allSettled.
  // O `await` pausa a função até TODAS terminarem (com sucesso ou erro).
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      const [personsResult, charactersResult, pokemonResult] = await Promise.allSettled([
        fetchPersons(),        // MockAPI /person
        fetchCharacterList(),  // Dragon Ball (lista paginada, já com imagem e raça)
        fetchPokemon(1),       // PokéAPI
      ]);

      if (cancelled) return;

      // Cada resultado atualiza só o seu estado: falhas individuais ficam isoladas.
      setPersons(fromSettled(personsResult));
      setPokemon(fromSettled(pokemonResult));

      if (charactersResult.status === 'fulfilled') {
        const list = charactersResult.value;
        setCharacterList(list);
        setCharacter({ data: list[0], loading: false, error: null }); // 1º personagem
      } else {
        setCharacter(fromSettled(charactersResult)); // mostra o erro claro na seção
      }

      loadedCharacterIndex.current = 0;
      loadedPokemonKey.current = 1;
      setBooted(true);
    }

    loadInitialData();
    return () => { cancelled = true; };
  }, []); // [] = roda uma única vez, ao montar

  // ============================================================
  // [DEPENDÊNCIAS] Desafio 1: ao mudar `characterIndex`, busca o detalhe do personagem por ID.
  // ============================================================
  useEffect(() => {
    if (!booted || characterList.length === 0) return;
    if (loadedCharacterIndex.current === characterIndex) return;

    const id = characterList[characterIndex]?.id;
    if (id == null) return;

    let cancelled = false;
    setCharacter((prev) => ({ ...prev, loading: true, error: null }));

    fetchCharacterById(id)
      .then((data) => {
        if (cancelled) return;
        loadedCharacterIndex.current = characterIndex;
        setCharacter({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        // mantém o personagem anterior em `data` e mostra o motivo real do erro
        setCharacter((prev) => ({ ...prev, loading: false, error: err.message }));
      });

    return () => { cancelled = true; };
  }, [booted, characterList, characterIndex]);

  // ============================================================
  // [DEPENDÊNCIAS] Desafio 1: ao mudar `pokemonKey`, busca o novo Pokémon.
  // (a cadeia de evolução reage ao `pokemon` dentro de EvolutionChain.jsx)
  // ============================================================
  useEffect(() => {
    if (!booted || loadedPokemonKey.current === pokemonKey) return;
    let cancelled = false;
    setPokemon((prev) => ({ ...prev, loading: true, error: null }));

    fetchPokemon(pokemonKey)
      .then((data) => {
        if (cancelled) return;
        loadedPokemonKey.current = pokemonKey;
        setPokemon({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setPokemon((prev) => ({
          ...prev,
          loading: false,
          error: `Pokémon "${pokemonKey}": ${err.message}`,
        }));
      });

    return () => { cancelled = true; };
  }, [booted, pokemonKey]);

  // ---------- handlers ----------
  function handleSelectPerson(person) {
    setSelectedPersonId(person.id);
    if (person.name) setDisplayName(person.name); // o perfil define o nome do personagem
  }

  async function handleCreatePerson(name) {
    const created = await createPerson({ name }); // POST na MockAPI
    setPersons((prev) => ({ ...prev, data: [...(prev.data ?? []), created] }));
    handleSelectPerson(created);
  }

  // Navegação sempre dentro de 0..total-1: nunca gera índice/ID inválido.
  const total = characterList.length;
  const goPrev = () => setCharacterIndex((i) => (i - 1 + total) % total);
  const goNext = () => setCharacterIndex((i) => (i + 1) % total);
  const goRandom = () =>
    setCharacterIndex((i) => {
      if (total <= 1) return 0;
      let next = i;
      while (next === i) next = Math.floor(Math.random() * total); // evita repetir o mesmo
      return next;
    });

  return (
    <main className="container">
      <h1>Página de consumo de APIs</h1>
      <p className="muted lead">
        React + Vite · MockAPI, Dragon Ball API, PokéAPI e OMDb
      </p>

      <div className="grid">
        <ProfileSection
          state={persons}
          selectedId={selectedPersonId}
          onSelect={handleSelectPerson}
          onCreate={handleCreatePerson}
        />

        <CharacterSection
          state={character}
          position={characterIndex + 1}
          total={total}
          name={displayName}
          onApplyName={setDisplayName}
          onPrev={goPrev}
          onNext={goNext}
          onRandom={goRandom}
        />

        <PokemonSection state={pokemon} onSelect={setPokemonKey} />

        <MovieSection />
      </div>
    </main>
  );
}
