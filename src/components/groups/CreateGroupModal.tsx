import { useState } from "react";
import { X, ArrowRight, Goal } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { createGroup } from "../../services/groups";

interface CreateGroupModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (groupId: string) => void;
}

function CreateGroupModal({
    open,
    onClose,
    onCreated,
}: CreateGroupModalProps) {
    const { user } = useAuth();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open) {
        return null;
    }

    const handleCreate = async () => {
        if (!user) {
            setError("Usuário não autenticado.");
            return;
        }

        if (!name.trim()) {
            setError("Digite um nome para o grupo.");
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

            setName("");

            onCreated(groupId);
        } catch (error) {
            console.error(error);
            setError("Não foi possível criar o grupo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="create-group-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <X size={20} />
                </button>

                <div className="create-group-icon">
                    <Goal size={22} />
                </div>

                <h2>Criar seu grupo</h2>

                <p>
                    Dê um nome para a sua pelada e comece a
                    registrar seus jogos.
                </p>

                <div className="form-field">
                    <label htmlFor="group-name">
                        Nome do grupo
                    </label>

                    <input
                        id="group-name"
                        type="text"
                        placeholder="Ex.: Futebol de Quarta"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleCreate();
                            }
                        }}
                        disabled={loading}
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <button
                    className="button button-primary create-group-button"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        "Criando..."
                    ) : (
                        <>
                            Criar grupo
                            <ArrowRight size={17} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default CreateGroupModal;