import { useEffect, useState } from 'react';
import Section from './Section.jsx';
import Navigator from './Navigator.jsx';
import {
  OMDB_KEY_CONFIGURED, searchMovies, fetchMovieDetails, getRottenTomatoes,
} from '../services/api.js';

const initial = { data: null, loading: true, error: null };

// Lê o favorito salvo no navegador (se existir)
function loadFavorite() {
  try {
    return JSON.parse(localStorage.getItem('favoriteMovie')) ?? null;
  } catch {
    return null;
  }
}

function MovieInfo({ movie }) {
  return (
    <div className="profile">
      {movie.Poster && movie.Poster !== 'N/A' && (
        <img src={movie.Poster} alt={movie.Title} className="poster" />
      )}
      <div>
        <h3>{movie.Title} <small className="muted">({movie.Year})</small></h3>
        <dl>
          <dt>Gênero</dt><dd>{movie.Genre}</dd>
          <dt>Premiações</dt><dd>{movie.Awards}</dd>
          <dt>IMDb</dt><dd>⭐ {movie.imdbRating}</dd>
          <dt>Rotten Tomatoes</dt><dd>🍅 {getRottenTomatoes(movie.Ratings)}</dd>
        </dl>
        {movie.Plot && <p className="description">{movie.Plot}</p>}
      </div>
    </div>
  );
}

// Atividade 3: filme favorito. Fluxo em 2 passos dependentes:
//   busca (?s=termo)  ->  seleção  ->  detalhe (?i=imdbID)
export default function MovieSection() {
  // [CONTROLE DE ESTADO] cada etapa tem o seu próprio estado independente
  const [query, setQuery] = useState('Matrix');        // texto digitado no input
  const [searchTerm, setSearchTerm] = useState('Matrix'); // termo confirmado (dispara a busca)
  const [search, setSearch] = useState(initial);       // resultado da busca
  const [selectedIndex, setSelectedIndex] = useState(0); // posição escolhida (Desafio 1)
  const [detail, setDetail] = useState({ ...initial, loading: false }); // detalhe do filme
  const [favorite, setFavorite] = useState(loadFavorite);

  // Derivado: o imdbID do filme selecionado é o que dispara o segundo useEffect
  const selectedId = search.data?.[selectedIndex]?.imdbID;

  // [DEPENDÊNCIAS] passo 1: roda quando o termo de busca (`searchTerm`) muda
  useEffect(() => {
    if (!OMDB_KEY_CONFIGURED) {
      setSearch({
        data: null,
        loading: false,
        error:
          'Chave da OMDb não configurada. Crie o arquivo ".env" na raiz do projeto (ao lado do package.json) ' +
          'com a linha VITE_OMDB_API_KEY=sua_chave_aqui e reinicie o "npm run dev".',
      });
      return;
    }
    let cancelled = false;
    setSearch({ data: null, loading: true, error: null });
    setSelectedIndex(0);

    searchMovies(searchTerm)
      .then((data) => !cancelled && setSearch({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setSearch({ data: null, loading: false, error: err.message }));

    return () => { cancelled = true; };
  }, [searchTerm]);

  // [DEPENDÊNCIAS] passo 2: roda quando o imdbID selecionado (`selectedId`) muda
  useEffect(() => {
    if (!selectedId) {
      setDetail({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setDetail({ data: null, loading: true, error: null });

    fetchMovieDetails(selectedId)
      .then((data) => !cancelled && setDetail({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setDetail({ data: null, loading: false, error: err.message }));

    return () => { cancelled = true; };
  }, [selectedId]);

  const results = search.data ?? [];
  const count = results.length;

  const handleSearch = (event) => {
    event.preventDefault();
    if (query.trim()) setSearchTerm(query.trim());
  };

  function toggleFavorite() {
    const next = favorite?.imdbID === detail.data.imdbID ? null : detail.data;
    setFavorite(next);
    try {
      if (next) localStorage.setItem('favoriteMovie', JSON.stringify(next));
      else localStorage.removeItem('favoriteMovie');
    } catch { /* localStorage indisponível: ignora */ }
  }

  return (
    <Section
      title="Atividade 3 · Filme favorito"
      subtitle="Busca na OMDb por termo e detalhes por imdbID."
      loading={search.loading}
      error={search.error}
      controls={
        <Navigator
          label={count ? `${selectedIndex + 1} / ${count}` : ''}
          onPrev={() => setSelectedIndex((i) => (i - 1 + count) % count)}
          onNext={() => setSelectedIndex((i) => (i + 1) % count)}
          onRandom={() => setSelectedIndex(Math.floor(Math.random() * count))}
          disabled={!count}
        />
      }
      toolbar={
        <form className="inline-form" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar filme (ex.: Matrix)"
          />
          <button type="submit">Buscar</button>
        </form>
      }
    >
      {favorite && (
        <div className="favorite">
          <h4>⭐ Meu filme favorito</h4>
          <MovieInfo movie={favorite} />
        </div>
      )}

      <ul className="chips">
        {results.map((movie, index) => (
          <li key={movie.imdbID}>
            <button
              className={`chip ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              {movie.Title} ({movie.Year})
            </button>
          </li>
        ))}
      </ul>

      {detail.loading && <p className="status loading">Carregando detalhes…</p>}
      {detail.error && <p className="status error">⚠ {detail.error}</p>}
      {detail.data && (
        <>
          <MovieInfo movie={detail.data} />
          <button onClick={toggleFavorite} className="accent">
            {favorite?.imdbID === detail.data.imdbID ? 'Remover dos favoritos' : '⭐ Marcar como favorito'}
          </button>
        </>
      )}
    </Section>
  );
}
