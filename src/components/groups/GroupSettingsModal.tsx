import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
    defaultGroupStats,
    updateGroupStats,
    type Group,
    type GroupStats,
} from "../../services/groups";

interface GroupSettingsModalProps {
    open: boolean;
    onClose: () => void;
    group: Group;
    onUpdated: (stats: GroupStats) => void;
}

function GroupSettingsModal({
    open,
    onClose,
    group,
    onUpdated,
}: GroupSettingsModalProps) {
    const [stats, setStats] =
        useState<GroupStats>(
            group.stats || defaultGroupStats,
        );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (open) {
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
        try {
            setLoading(true);
            setError("");

            await updateGroupStats(
                group.id,
                stats,
            );

            onUpdated(stats);
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
                        Escolha quais estatísticas
                        serão utilizadas nas partidas
                        deste grupo.
                    </p>
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
                    disabled={loading}
                >
                    <Save size={17} />

                    {loading
                        ? "Salvando..."
                        : "Salvar configurações"}
                </button>
            </div>
        </div>
    );
}

export default GroupSettingsModal;