import { useState } from 'react';
import Section from './Section.jsx';

// MockAPI /person: lista os perfis e permite criar um novo (POST).
// Escolher um perfil define o nome do personagem da Atividade 1.
export default function ProfileSection({ state, selectedId, onSelect, onCreate }) {
  // [CONTROLE DE ESTADO] estado local só do formulário de criação
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await onCreate(name.trim());
      setName('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const persons = state.data ?? [];

  return (
    <Section
      title="Perfis (MockAPI /person)"
      subtitle="Requisição inicial — clique em um perfil para usar o nome no personagem."
      loading={state.loading}
      error={state.error}
    >
      {persons.length === 0 ? (
        <p className="muted">Nenhum perfil cadastrado ainda.</p>
      ) : (
        <ul className="chips">
          {persons.map((person) => (
            <li key={person.id}>
              <button
                className={`chip ${String(person.id) === String(selectedId) ? 'active' : ''}`}
                onClick={() => onSelect(person)}
              >
                {person.avatar && <img src={person.avatar} alt="" />}
                {person.name ?? `Perfil ${person.id}`}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Novo perfil (seu nome)"
        />
        <button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Criar perfil'}</button>
      </form>
      {formError && <p className="status error">⚠ {formError}</p>}
    </Section>
  );
}
