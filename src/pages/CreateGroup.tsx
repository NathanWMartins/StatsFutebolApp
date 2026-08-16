import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { createGroup } from "../services/groups";

function CreateGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateGroup = async () => {
    if (!user) {
      setError("Usuário não autenticado.");
      return;
    }

    if (!name.trim()) {
      setError("Digite o nome do grupo.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const groupId = await createGroup(
        user.uid,
        name.trim(),
        user.displayName || "Jogador",
        user.photoURL,
      );

      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error(error);
      setError("Não foi possível criar o grupo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Criar grupo</h1>

      <p>
        Crie um grupo para começar a registrar os jogos.
      </p>

      <input
        type="text"
        placeholder="Nome do grupo"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={loading}
      />

      {error && <p>{error}</p>}

      <button
        onClick={handleCreateGroup}
        disabled={loading}
      >
        {loading ? "Criando..." : "Criar grupo"}
      </button>
    </div>
  );
}

export default CreateGroup;