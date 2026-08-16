import {
    CalendarDays,
    Camera,
    ImagePlus,
    Minus,
    Plus,
    Trash2,
    Trophy,
    X,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

import {
    createMatch,
    type MatchPlayer,
} from "../../services/matches";

import type {
    Group,
    GroupMember,
} from "../../services/groups";
import { compressImage } from "../../utils/compressImage";

interface RegisterMatchModalProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    group: Group;
    members: GroupMember[];
    onCreated: () => void;
}

interface PlayerStats {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    mvp: boolean;
}

interface StatControlProps {
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
}

function StatControl({
    label,
    value,
    onDecrease,
    onIncrease,
}: StatControlProps) {
    return (
        <div className="stat-control">
            <span>{label}</span>

            <div>
                <button
                    type="button"
                    onClick={onDecrease}
                    disabled={value === 0}
                >
                    <Minus size={14} />
                </button>

                <strong>{value}</strong>

                <button
                    type="button"
                    onClick={onIncrease}
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}

function RegisterMatchModal({
    open,
    onClose,
    groupId,
    group,
    members,
    onCreated,
}: RegisterMatchModalProps) {
    const { user } = useAuth();

    const [step, setStep] =
        useState<1 | 2>(1);

    const [date, setDate] =
        useState("");

    const [scoreA, setScoreA] =
        useState(0);

    const [scoreB, setScoreB] =
        useState(0);

    const [selectedPlayers, setSelectedPlayers] =
        useState<Record<string, "A" | "B">>(
            {},
        );

    const [playerStats, setPlayerStats] =
        useState<Record<string, PlayerStats>>(
            {},
        );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [photoPreview, setPhotoPreview] =
        useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        setStep(1);
        setDate(today);
        setScoreA(0);
        setScoreB(0);
        setSelectedPlayers({});
        setPlayerStats({});
        setPhotoPreview(null);
        setError("");
    }, [open]);

    if (!open) {
        return null;
    }

    const togglePlayer = (
        userId: string,
        team: "A" | "B",
    ) => {
        setSelectedPlayers((current) => {
            const next = {
                ...current,
            };

            if (next[userId] === team) {
                delete next[userId];

                setPlayerStats((stats) => {
                    const nextStats = {
                        ...stats,
                    };

                    delete nextStats[userId];

                    return nextStats;
                });
            } else {
                next[userId] = team;

                setPlayerStats((stats) => ({
                    ...stats,

                    [userId]:
                        stats[userId] || {
                            goals: 0,
                            assists: 0,
                            yellowCards: 0,
                            redCards: 0,
                            mvp: false,
                        },
                }));
            }

            return next;
        });
    };

    const teamAPlayers =
        members.filter(
            (member) =>
                selectedPlayers[
                member.userId
                ] === "A",
        );

    const teamBPlayers =
        members.filter(
            (member) =>
                selectedPlayers[
                member.userId
                ] === "B",
        );

    const updatePlayerStat = (
        userId: string,
        stat:
            | "goals"
            | "assists"
            | "yellowCards"
            | "redCards",
        value: number,
    ) => {
        setPlayerStats((current) => ({
            ...current,

            [userId]: {
                ...current[userId],
                [stat]: Math.max(0, value),
            },
        }));
    };

    const toggleMvp = (
        userId: string,
    ) => {
        setPlayerStats((current) => {
            const next = {
                ...current,
            };

            Object.keys(next).forEach(
                (id) => {
                    next[id] = {
                        ...next[id],

                        mvp:
                            id === userId
                                ? !next[id].mvp
                                : false,
                    };
                },
            );

            return next;
        });
    };

    const validateStepOne = () => {
        if (!date) {
            setError(
                "Informe a data da partida.",
            );

            return false;
        }

        if (
            teamAPlayers.length === 0 ||
            teamBPlayers.length === 0
        ) {
            setError(
                "Selecione pelo menos um jogador para cada time.",
            );

            return false;
        }

        return true;
    };

    const validateStats = () => {
        const teamAGoals =
            teamAPlayers.reduce(
                (total, player) =>
                    total +
                    (playerStats[
                        player.userId
                    ]?.goals || 0),
                0,
            );

        const teamBGoals =
            teamBPlayers.reduce(
                (total, player) =>
                    total +
                    (playerStats[
                        player.userId
                    ]?.goals || 0),
                0,
            );

        if (
            group.stats?.goals &&
            teamAGoals !== scoreA
        ) {
            setError(
                `Os gols do Time A totalizam ${teamAGoals}, mas o placar é ${scoreA}.`,
            );

            return false;
        }

        if (
            group.stats?.goals &&
            teamBGoals !== scoreB
        ) {
            setError(
                `Os gols do Time B totalizam ${teamBGoals}, mas o placar é ${scoreB}.`,
            );

            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (!validateStepOne()) {
            return;
        }

        setError("");
        setStep(2);
    };

    const handleCreate = async () => {
        if (!user) {
            setError(
                "Usuário não autenticado.",
            );

            return;
        }

        if (!validateStepOne()) {
            setStep(1);

            return;
        }

        if (!validateStats()) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const players: MatchPlayer[] =
                members
                    .filter(
                        (member) =>
                            selectedPlayers[
                            member.userId
                            ],
                    )
                    .map((member) => {
                        const stats =
                            playerStats[
                            member.userId
                            ];

                        return {
                            userId:
                                member.userId,

                            name:
                                member.name ||
                                "Jogador",

                            photoURL:
                                member.photoURL ||
                                null,

                            team:
                                selectedPlayers[
                                member.userId
                                ]!,

                            goals:
                                stats?.goals ||
                                0,

                            assists:
                                stats?.assists ||
                                0,

                            yellowCards:
                                stats
                                    ?.yellowCards ||
                                0,

                            redCards:
                                stats?.redCards ||
                                0,

                            mvp:
                                stats?.mvp ||
                                false,
                        };
                    });

            await createMatch(
                groupId,
                user.uid,
                date,
                scoreA,
                scoreB,
                players,
                photoPreview,
            );

            onCreated();
            onClose();
        } catch (error) {
            console.error(
                "Erro ao registrar partida:",
                error,
            );

            setError(
                "Não foi possível registrar a partida.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoSelected = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError(
                "Selecione um arquivo de imagem.",
            );

            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError(
                "A imagem original deve ter no máximo 10 MB.",
            );

            return;
        }

        try {
            setError("");

            const compressedImage =
                await compressImage(file);

            setPhotoPreview(compressedImage);
        } catch (error) {
            console.error(
                "Erro ao processar imagem:",
                error,
            );

            setError(
                "Não foi possível processar a imagem.",
            );
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="register-match-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Fechar"
                    type="button"
                >
                    <X size={20} />
                </button>

                {step === 1 ? (
                    <>
                        <div className="register-match-header">
                            <div className="register-match-icon">
                                <Trophy size={22} />
                            </div>

                            <div>
                                <span className="eyebrow">
                                    ETAPA 1 DE 2
                                </span>

                                <h2>
                                    Registrar partida
                                </h2>

                                <p>
                                    Registre o resultado
                                    e quem participou.
                                </p>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="match-date">
                                Data
                            </label>

                            <div className="input-with-icon">
                                <CalendarDays
                                    size={17}
                                />

                                <input
                                    id="match-date"
                                    type="date"
                                    value={date}
                                    onChange={(
                                        event,
                                    ) =>
                                        setDate(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                />
                            </div>
                        </div>

                        <div className="score-section">
                            <span className="form-label">
                                Placar
                            </span>

                            <div className="score-board">
                                <div className="score-team">
                                    <span>
                                        Time A
                                    </span>

                                    <div className="score-control">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setScoreA(
                                                    Math.max(
                                                        0,
                                                        scoreA -
                                                        1,
                                                    ),
                                                )
                                            }
                                        >
                                            <Minus
                                                size={
                                                    16
                                                }
                                            />
                                        </button>

                                        <strong>
                                            {
                                                scoreA
                                            }
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setScoreA(
                                                    scoreA +
                                                    1,
                                                )
                                            }
                                        >
                                            <Plus
                                                size={
                                                    16
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>

                                <span className="score-x">
                                    ×
                                </span>

                                <div className="score-team">
                                    <span>
                                        Time B
                                    </span>

                                    <div className="score-control">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setScoreB(
                                                    Math.max(
                                                        0,
                                                        scoreB -
                                                        1,
                                                    ),
                                                )
                                            }
                                        >
                                            <Minus
                                                size={
                                                    16
                                                }
                                            />
                                        </button>

                                        <strong>
                                            {
                                                scoreB
                                            }
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setScoreB(
                                                    scoreB +
                                                    1,
                                                )
                                            }
                                        >
                                            <Plus
                                                size={
                                                    16
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="match-photo-section">
                            <span className="form-label">
                                Foto da partida
                            </span>

                            {photoPreview ? (
                                <div className="match-photo-preview">
                                    <img
                                        src={photoPreview}
                                        alt="Prévia da partida"
                                    />

                                    <button
                                        type="button"
                                        className="remove-photo-button"
                                        onClick={() => {
                                            setPhotoPreview(null);
                                        }}
                                        disabled={loading}
                                    >
                                        <Trash2 size={16} />
                                        Remover foto
                                    </button>
                                </div>
                            ) : (
                                <div className="match-photo-actions">
                                    <label className="photo-option">
                                        <ImagePlus size={20} />

                                        <span>
                                            Escolher da galeria
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handlePhotoSelected
                                            }
                                            hidden
                                        />
                                    </label>

                                    <label className="photo-option">
                                        <Camera size={20} />

                                        <span>
                                            Tirar foto
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={
                                                handlePhotoSelected
                                            }
                                            hidden
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="players-section">
                            <div className="section-title">
                                <div>
                                    <span className="form-label">
                                        Jogadores
                                    </span>

                                    <small>
                                        Selecione o
                                        time de cada
                                        jogador
                                    </small>
                                </div>
                            </div>

                            <div className="match-players-list">
                                {members.length ===
                                    0 ? (
                                    <div className="empty-groups">
                                        <p>
                                            Nenhum
                                            membro
                                            encontrado.
                                        </p>
                                    </div>
                                ) : (
                                    members.map(
                                        (
                                            member,
                                        ) => {
                                            const team =
                                                selectedPlayers[
                                                member
                                                    .userId
                                                ];

                                            return (
                                                <div
                                                    key={
                                                        member.userId
                                                    }
                                                    className={`match-player ${team
                                                        ? "selected"
                                                        : ""
                                                        }`}
                                                >
                                                    <div className="match-player-info">
                                                        <div className="member-avatar">
                                                            {member.photoURL ? (
                                                                <img
                                                                    src={
                                                                        member.photoURL
                                                                    }
                                                                    alt={
                                                                        member.name
                                                                    }
                                                                />
                                                            ) : (
                                                                (
                                                                    member.name ||
                                                                    "J"
                                                                )
                                                                    .charAt(
                                                                        0,
                                                                    )
                                                                    .toUpperCase()
                                                            )}
                                                        </div>

                                                        <strong>
                                                            {
                                                                member.name
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div className="team-buttons">
                                                        <button
                                                            type="button"
                                                            className={
                                                                team ===
                                                                    "A"
                                                                    ? "active"
                                                                    : ""
                                                            }
                                                            onClick={() =>
                                                                togglePlayer(
                                                                    member.userId,
                                                                    "A",
                                                                )
                                                            }
                                                        >
                                                            A
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={
                                                                team ===
                                                                    "B"
                                                                    ? "active"
                                                                    : ""
                                                            }
                                                            onClick={() =>
                                                                togglePlayer(
                                                                    member.userId,
                                                                    "B",
                                                                )
                                                            }
                                                        >
                                                            B
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            className="button button-primary register-match-button"
                            onClick={
                                handleNext
                            }
                            disabled={loading}
                        >
                            Continuar
                        </button>
                    </>
                ) : (
                    <>
                        <div className="register-match-header">
                            <div className="register-match-icon">
                                <Trophy size={22} />
                            </div>

                            <div>
                                <span className="eyebrow">
                                    ETAPA 2 DE 2
                                </span>

                                <h2>
                                    Estatísticas
                                </h2>

                                <p>
                                    Registre o
                                    desempenho de
                                    cada jogador.
                                </p>
                            </div>
                        </div>

                        <div className="match-summary">
                            <span>
                                Time A
                            </span>

                            <strong>
                                {scoreA} ×{" "}
                                {scoreB}
                            </strong>

                            <span>
                                Time B
                            </span>
                        </div>

                        <div className="player-stats-list">
                            {members
                                .filter(
                                    (
                                        member,
                                    ) =>
                                        selectedPlayers[
                                        member
                                            .userId
                                        ],
                                )
                                .map(
                                    (
                                        member,
                                    ) => {
                                        const stats =
                                            playerStats[
                                            member
                                                .userId
                                            ];

                                        const team =
                                            selectedPlayers[
                                            member
                                                .userId
                                            ];

                                        return (
                                            <div
                                                key={
                                                    member.userId
                                                }
                                                className="player-stat-card"
                                            >
                                                <div className="player-stat-header">
                                                    <div className="match-player-info">
                                                        <div className="member-avatar">
                                                            {member.photoURL ? (
                                                                <img
                                                                    src={
                                                                        member.photoURL
                                                                    }
                                                                    alt={
                                                                        member.name
                                                                    }
                                                                />
                                                            ) : (
                                                                (
                                                                    member.name ||
                                                                    "J"
                                                                )
                                                                    .charAt(
                                                                        0,
                                                                    )
                                                                    .toUpperCase()
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    member.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Time{" "}
                                                                {
                                                                    team
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {group
                                                    .stats
                                                    ?.goals && (
                                                        <StatControl
                                                            label="Gols"
                                                            value={
                                                                stats?.goals ||
                                                                0
                                                            }
                                                            onDecrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "goals",
                                                                    (stats?.goals ||
                                                                        0) -
                                                                    1,
                                                                )
                                                            }
                                                            onIncrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "goals",
                                                                    (stats?.goals ||
                                                                        0) +
                                                                    1,
                                                                )
                                                            }
                                                        />
                                                    )}

                                                {group
                                                    .stats
                                                    ?.assists && (
                                                        <StatControl
                                                            label="Assistências"
                                                            value={
                                                                stats?.assists ||
                                                                0
                                                            }
                                                            onDecrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "assists",
                                                                    (stats?.assists ||
                                                                        0) -
                                                                    1,
                                                                )
                                                            }
                                                            onIncrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "assists",
                                                                    (stats?.assists ||
                                                                        0) +
                                                                    1,
                                                                )
                                                            }
                                                        />
                                                    )}

                                                {group
                                                    .stats
                                                    ?.yellowCards && (
                                                        <StatControl
                                                            label="Cartões amarelos"
                                                            value={
                                                                stats?.yellowCards ||
                                                                0
                                                            }
                                                            onDecrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "yellowCards",
                                                                    (stats?.yellowCards ||
                                                                        0) -
                                                                    1,
                                                                )
                                                            }
                                                            onIncrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "yellowCards",
                                                                    (stats?.yellowCards ||
                                                                        0) +
                                                                    1,
                                                                )
                                                            }
                                                        />
                                                    )}

                                                {group
                                                    .stats
                                                    ?.redCards && (
                                                        <StatControl
                                                            label="Cartões vermelhos"
                                                            value={
                                                                stats?.redCards ||
                                                                0
                                                            }
                                                            onDecrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "redCards",
                                                                    (stats?.redCards ||
                                                                        0) -
                                                                    1,
                                                                )
                                                            }
                                                            onIncrease={() =>
                                                                updatePlayerStat(
                                                                    member.userId,
                                                                    "redCards",
                                                                    (stats?.redCards ||
                                                                        0) +
                                                                    1,
                                                                )
                                                            }
                                                        />
                                                    )}

                                                {group
                                                    .stats
                                                    ?.mvp && (
                                                        <button
                                                            type="button"
                                                            className={`mvp-button ${stats?.mvp
                                                                ? "active"
                                                                : ""
                                                                }`}
                                                            onClick={() =>
                                                                toggleMvp(
                                                                    member.userId,
                                                                )
                                                            }
                                                        >
                                                            ⭐{" "}
                                                            {stats?.mvp
                                                                ? "MVP selecionado"
                                                                : "Marcar como MVP"}
                                                        </button>
                                                    )}
                                            </div>
                                        );
                                    },
                                )}
                        </div>

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        <div className="stats-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => {
                                    setError(
                                        "",
                                    );
                                    setStep(1);
                                }}
                                disabled={
                                    loading
                                }
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="button button-primary"
                                onClick={
                                    handleCreate
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Registrando..."
                                    : "Registrar partida"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default RegisterMatchModal;