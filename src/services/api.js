// ============================================================
// Camada de serviços: TODAS as requisições HTTP ficam aqui.
// Os componentes nunca chamam fetch diretamente.
// ============================================================

const MOCKAPI_URL = 'https://6a79e554674f43f4db11ebc8.mockapi.io/api/person';

// ⚠ CORREÇÃO DO "Failed to fetch":
// web.dragonball-api.com é o SITE (documentação). A API em si responde em
// dragonball-api.com/api — chamar o endereço "web." gera erro de rede/CORS no navegador.
const DRAGONBALL_URL = 'https://dragonball-api.com/api/characters';
const DRAGONBALL_PAGE_SIZE = 100;

const POKEAPI_URL = 'https://pokeapi.co/api/v2';
const OMDB_URL = 'https://www.omdbapi.com/';

// A chave vem do arquivo .env (VITE_OMDB_API_KEY). Nunca coloque a chave direto no código.
export const OMDB_API_KEY = (import.meta.env.VITE_OMDB_API_KEY ?? '').trim();

// Considera "não configurada" se estiver vazia ou ainda com o texto de exemplo do .env.example
const PLACEHOLDER_KEYS = ['', 'sua_chave_aqui', '[sua_omdb_api_key]'];
export const OMDB_KEY_CONFIGURED = !PLACEHOLDER_KEYS.includes(OMDB_API_KEY.toLowerCase());

export const POKEMON_TOTAL = 1025;

// [SINCRONISMO] Toda função é async/await: o código "espera" a resposta antes de seguir.
// Aqui os erros viram mensagens claras (em vez de apenas "Failed to fetch").
async function request(url, options) {
  const { host, pathname } = new URL(url);

  let response;
  try {
    response = await fetch(url, options);
  } catch (networkError) {
    // fetch só lança erro aqui quando NÃO chegou resposta: URL errada, sem internet,
    // bloqueio de CORS, VPN/antivírus/bloqueador de anúncios.
    console.error('[api] falha de rede/CORS ao chamar', url, networkError);
    throw new Error(
      `Sem resposta de ${host}${pathname}. Verifique a URL, a internet, CORS ou bloqueadores (${networkError.message}).`
    );
  }

  if (!response.ok) {
    console.error('[api] HTTP', response.status, url);
    throw new Error(`HTTP ${response.status} ${response.statusText} em ${host}${pathname}`.trim());
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${host}${pathname} respondeu algo que não é JSON.`);
  }
}

// ---------------- MockAPI (perfis) ----------------
export const fetchPersons = () => request(MOCKAPI_URL);

export const createPerson = (person) =>
  request(MOCKAPI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(person),
  });

// ---------------- Dragon Ball (Atividade 1) ----------------

// Lista PAGINADA: a API responde { items: [...], meta: { totalItems, totalPages, ... }, links }.
// Buscamos todas as páginas e devolvemos só o array de personagens.
// Navegar por ÍNDICE nessa lista evita pedir IDs que não existem (anterior/próximo/aleatório).
export async function fetchCharacterList() {
  const first = await request(`${DRAGONBALL_URL}?page=1&limit=${DRAGONBALL_PAGE_SIZE}`);

  const firstItems = Array.isArray(first) ? first : first?.items;
  if (!Array.isArray(firstItems) || firstItems.length === 0) {
    throw new Error('Resposta inesperada da Dragon Ball API: lista "items" vazia ou ausente.');
  }

  const totalPages = first?.meta?.totalPages ?? 1;
  const otherPages = [];
  for (let page = 2; page <= totalPages; page += 1) {
    otherPages.push(request(`${DRAGONBALL_URL}?page=${page}&limit=${DRAGONBALL_PAGE_SIZE}`));
  }
  const pages = await Promise.all(otherPages);

  return [...firstItems, ...pages.flatMap((page) => page?.items ?? [])];
}

// Busca por ID: aqui a resposta é UM OBJETO direto (sem "items").
export async function fetchCharacterById(id) {
  const character = await request(`${DRAGONBALL_URL}/${id}`);
  if (!character || character.id == null) {
    throw new Error(`Personagem ${id} não retornou dados válidos.`);
  }
  return character;
}

// ---------------- PokéAPI (Atividade 2 + Desafio 2) ----------------
// key pode ser id (25) ou nome ("pikachu")
export const fetchPokemon = (key) =>
  request(`${POKEAPI_URL}/pokemon/${String(key).toLowerCase().trim()}`);

// Usada nas requisições encadeadas: pokemon -> species -> evolution_chain
export const fetchByUrl = (url) => request(url);

// Transforma a árvore da evolution_chain em "níveis" (lista de listas),
// ex.: [[bulbasaur], [ivysaur], [venusaur]]. Funciona também para ramificações (Eevee).
export function flattenEvolutionChain(chain) {
  const levels = [];
  const walk = (node, depth) => {
    if (!levels[depth]) levels[depth] = [];
    const detail = node.evolution_details?.[0];
    levels[depth].push({
      id: node.species.url.split('/').filter(Boolean).pop(),
      name: node.species.name,
      minLevel: detail?.min_level ?? null,
      item: detail?.item?.name ?? null,
      trigger: detail?.trigger?.name ?? null,
    });
    node.evolves_to.forEach((next) => walk(next, depth + 1));
  };
  walk(chain, 0);
  return levels;
}

export const spriteUrlById = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// ---------------- OMDb (Atividade 3) ----------------
// A OMDb responde 200 mesmo em erro ({ Response: "False", Error: "..." }), então tratamos aqui.
async function omdb(params) {
  if (!OMDB_KEY_CONFIGURED) throw new Error('Chave da OMDb não configurada (VITE_OMDB_API_KEY).');
  const query = new URLSearchParams({ ...params, apikey: OMDB_API_KEY });
  const data = await request(`${OMDB_URL}?${query.toString()}`);
  if (data.Response === 'False') throw new Error(data.Error || 'Erro na OMDb');
  return data;
}

// Passo 1: pesquisa por termo (?s=)
export async function searchMovies(term) {
  const data = await omdb({ s: term, type: 'movie' });
  return data.Search;
}

// Passo 2: detalhe pelo imdbID (?i=)
export const fetchMovieDetails = (imdbID) => omdb({ i: imdbID, plot: 'short' });

export function getRottenTomatoes(ratings = []) {
  return ratings.find((r) => r.Source === 'Rotten Tomatoes')?.Value ?? 'N/D';
}
