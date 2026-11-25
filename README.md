# Primeira Entrega - Página de consumo de APIs

React + Vite consumindo MockAPI, Dragon Ball API, PokéAPI e OMDb.

## Como rodar
1. `npm install`
2. Copie `.env.example` para `.env` (na raiz, ao lado do `package.json`) e troque `sua_chave_aqui` pela sua chave da OMDb
3. `npm run dev` (se já estava rodando, pare e rode de novo para o Vite ler o `.env`)

No Windows, também dá para dar dois cliques em `INICIAR.bat`.

## Onde estão os 4 pilares (procure os comentários no código)
- `[CONSUMO SIMULTÂNEO]` -> `src/App.jsx` (Promise.allSettled no carregamento inicial)
- `[SINCRONISMO]` -> `src/App.jsx`, `src/services/api.js` (async/await)
- `[DEPENDÊNCIAS]` -> `useEffect` em `App.jsx`, `EvolutionChain.jsx`, `MovieSection.jsx`
- `[CONTROLE DE ESTADO]` -> estados { data, loading, error } independentes por seção
