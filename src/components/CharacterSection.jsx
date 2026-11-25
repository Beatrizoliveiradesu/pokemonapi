import { useEffect, useState } from 'react';
import Section from './Section.jsx';
import Navigator from './Navigator.jsx';

// Atividade 1: personagem com o nome do usuário + imagem principal e raça da Dragon Ball API.
// O `name` vem do App: trocar de personagem (◀ ▶ 🎲) NÃO altera o nome.
export default function CharacterSection({
  state, position, total, name, onApplyName, onPrev, onNext, onRandom,
}) {
  const character = state.data;

  // [CONTROLE DE ESTADO] `draft` é o texto digitado; `name` (vindo do App) é o nome aplicado.
  const [draft, setDraft] = useState(name);

  // [DEPENDÊNCIAS] se o nome mudar fora daqui (ex.: clicou num perfil da MockAPI), atualiza o campo.
  useEffect(() => {
    setDraft(name);
  }, [name]);

  const handleApply = (event) => {
    event.preventDefault();
    if (draft.trim()) onApplyName(draft.trim());
  };

  return (
    <Section
      title="Atividade 1 · Personagem"
      subtitle="Imagem e raça vindas da Dragon Ball API, com o seu nome."
      loading={state.loading}
      error={state.error}
      controls={
        <Navigator
          label={total ? `${position} / ${total}` : ''}
          onPrev={onPrev}
          onNext={onNext}
          onRandom={onRandom}
          disabled={state.loading || total === 0}
        />
      }
      toolbar={
        <form className="inline-form" onSubmit={handleApply}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nome do personagem"
          />
          <button type="submit">Aplicar nome</button>
        </form>
      }
    >
      {character && (
        <div className="hero">
          <img src={character.image} alt={character.name} className="hero-image" />
          <div className="hero-info">
            <h3>{name}</h3>
            <div className="race-tag">
              <small>Raça</small>
              <strong>{character.race ?? 'Desconhecida'}</strong>
            </div>
            <p className="muted">Visual inspirado em {character.name}</p>
            <dl>
              <dt>Gênero</dt><dd>{character.gender ?? '—'}</dd>
              <dt>Ki</dt><dd>{character.ki ?? '—'}</dd>
              <dt>Afiliação</dt><dd>{character.affiliation ?? '—'}</dd>
            </dl>
            <p className="description">{character.description}</p>
          </div>
        </div>
      )}
    </Section>
  );
}
