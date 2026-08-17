import { Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
    defaultGroupStats,
    deleteGroup,
    updateGroupName,
    updateGroupStats,
    type Group,
    type GroupStats,
} from "../../services/groups";

interface GroupSettingsModalProps {
    open: boolean;
    onClose: () => void;
    group: Group;
    onUpdated: (data: {
        name: string;
        stats: GroupStats;
    }) => void;
    onDeleted: () => void;
}

function GroupSettingsModal({
    open,
    onClose,
    group,
    onUpdated,
    onDeleted,
}: GroupSettingsModalProps) {
    const [name, setName] = useState(group.name);

    const [stats, setStats] =
        useState<GroupStats>(
            group.stats || defaultGroupStats,
        );

    const [loading, setLoading] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (open) {
            setName(group.name);

            setStats(
                group.stats || defaultGroupStats,
            );

            setError("");
        }
    }, [open, group]);

    if (!open) {
        return null;
    }

    const handleToggle = (
        key: keyof GroupStats,
    ) => {
        setStats((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError(
                "Digite um nome para o grupo.",
            );

            return;
        }

        try {
            setLoading(true);
            setError("");

            await Promise.all([
                updateGroupName(
                    group.id,
                    name.trim(),
                ),
                updateGroupStats(
                    group.id,
                    stats,
                ),
            ]);

            onUpdated({
                name: name.trim(),
                stats,
            });

            onClose();
        } catch (error) {
            console.error(
                "Erro ao salvar configurações:",
                error,
            );

            setError(
                "Não foi possível salvar as configurações.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (
            !window.confirm(
                `Excluir o grupo "${group.name}"? Todas as partidas e estatísticas registradas serão apagadas para sempre. Essa ação não pode ser desfeita.`,
            )
        ) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteGroup(group.id);

            onDeleted();
        } catch (error) {
            console.error(
                "Erro ao excluir grupo:",
                error,
            );

            setError(
                "Não foi possível excluir o grupo.",
            );

            setDeleting(false);
        }
    };

    const options: {
        key: keyof GroupStats;
        label: string;
        description: string;
    }[] = [
        {
            key: "goals",
            label: "Gols",
            description:
                "Contabilizar gols marcados",
        },
        {
            key: "assists",
            label: "Assistências",
            description:
                "Contabilizar assistências",
        },
        {
            key: "wins",
            label: "Vitórias",
            description:
                "Contabilizar vitórias",
        },
        {
            key: "losses",
            label: "Derrotas",
            description:
                "Contabilizar derrotas",
        },
        {
            key: "draws",
            label: "Empates",
            description:
                "Contabilizar empates",
        },
        {
            key: "yellowCards",
            label: "Cartões amarelos",
            description:
                "Contabilizar cartões amarelos",
        },
        {
            key: "redCards",
            label: "Cartões vermelhos",
            description:
                "Contabilizar cartões vermelhos",
        },
        {
            key: "mvp",
            label: "MVP",
            description:
                "Permitir escolher o destaque da partida",
        },
    ];

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="settings-modal"
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

                <div className="settings-header">
                    <span className="eyebrow">
                        CONFIGURAÇÕES
                    </span>

                    <h2>
                        {group.name}
                    </h2>

                    <p>
                        Altere o nome do grupo e
                        escolha quais estatísticas
                        serão utilizadas nas partidas.
                    </p>
                </div>

                <div className="form-field">
                    <label htmlFor="settings-group-name">
                        Nome do grupo
                    </label>

                    <input
                        id="settings-group-name"
                        type="text"
                        placeholder="Ex.: Futebol de Quarta"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        disabled={loading || deleting}
                    />
                </div>

                <div className="settings-options">
                    {options.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={`settings-option ${
                                stats[option.key]
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleToggle(
                                    option.key,
                                )
                            }
                        >
                            <div>
                                <strong>
                                    {option.label}
                                </strong>

                                <span>
                                    {option.description}
                                </span>
                            </div>

                            <span className="settings-switch">
                                <span />
                            </span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <button
                    className="button button-primary settings-save"
                    onClick={handleSave}
                    disabled={loading || deleting}
                >
                    <Save size={17} />

                    {loading
                        ? "Salvando..."
                        : "Salvar configurações"}
                </button>

                <div className="settings-danger-zone">
                    <h4>
                        Zona de perigo
                    </h4>

                    <p>
                        Excluir o grupo remove
                        permanentemente todas as
                        partidas, estatísticas e a
                        lista de jogadores. Não pode
                        ser desfeito.
                    </p>

                    <button
                        type="button"
                        className="button button-danger"
                        onClick={handleDeleteGroup}
                        disabled={loading || deleting}
                    >
                        <Trash2 size={16} />

                        {deleting
                            ? "Excluindo..."
                            : "Excluir grupo"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GroupSettingsModal;
