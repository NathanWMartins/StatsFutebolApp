import {
    ArrowLeft,
    CalendarDays,
    Goal,
    Star,
    Trophy,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getGroupById,
    type Group as GroupType,
} from "../services/groups";

import {
    getMatchById,
    type Match,
    type MatchPlayer,
} from "../services/matches";

function MatchDetails() {
    const navigate = useNavigate();
    const { groupId, matchId } = useParams();

    const [match, setMatch] =
        useState<Match | null>(null);

    const [group, setGroup] =
        useState<GroupType | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadMatch = async () => {
            if (!groupId || !matchId) {
                setError(
                    "Partida não encontrada.",
                );

                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError("");

                const [
                    groupData,
                    matchData,
                ] = await Promise.all([
                    getGroupById(groupId),
                    getMatchById(matchId),
                ]);

                if (
                    !matchData ||
                    matchData.groupId !== groupId
                ) {
                    setError(
                        "Essa partida não existe ou foi removida.",
                    );

                    return;
                }

                setGroup(groupData);
                setMatch(matchData);
            } catch (error) {
                console.error(
                    "Erro ao carregar partida:",
                    error,
                );

                setError(
                    "Não foi possível carregar a partida.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadMatch();
    }, [groupId, matchId]);

    /*
     * LOADING
     */

    if (loading) {
        return (
            <div className="group-page">
                <header className="group-header">
                    <div className="group-header-left">
                        <button
                            className="back-button"
                            onClick={() =>
                                navigate(
                                    groupId
                                        ? `/groups/${groupId}`
                                        : "/groups",
                                )
                            }
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="group-header-info">
                            <span className="group-header-icon">
                                <Trophy size={18} />
                            </span>

                            <div>
                                <span className="eyebrow">
                                    PARTIDA
                                </span>

                                <h1>
                                    Carregando...
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="group-content">
                    <div className="group-loading-state">
                        <div className="group-loading-icon">
                            <Trophy size={24} />
                        </div>

                        <h2>
                            Carregando partida...
                        </h2>

                        <p>
                            Estamos buscando as
                            informações da partida.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    /*
     * ERROR
     */

    if (error || !match) {
        return (
            <div className="group-page">
                <header className="group-header">
                    <div className="group-header-left">
                        <button
                            className="back-button"
                            onClick={() =>
                                navigate(
                                    groupId
                                        ? `/groups/${groupId}`
                                        : "/groups",
                                )
                            }
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="group-header-info">
                            <span className="group-header-icon">
                                <Trophy size={18} />
                            </span>

                            <div>
                                <span className="eyebrow">
                                    PARTIDA
                                </span>

                                <h1>
                                    Partida
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="group-content">
                    <div className="group-error-state">
                        <div className="group-error-icon">
                            !
                        </div>

                        <h2>
                            {error ||
                                "Partida não encontrada."}
                        </h2>

                        <p>
                            Verifique o endereço ou
                            volte para o grupo.
                        </p>

                        <button
                            className="button button-primary"
                            onClick={() =>
                                navigate(
                                    groupId
                                        ? `/groups/${groupId}`
                                        : "/groups",
                                )
                            }
                        >
                            Voltar para o grupo
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const formattedDate = new Date(
        `${match.date}T00:00:00`,
    ).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const teamAPlayers = match.players.filter(
        (player) => player.team === "A",
    );

    const teamBPlayers = match.players.filter(
        (player) => player.team === "B",
    );

    let resultLabel = "Empate";

    if (match.scoreA > match.scoreB) {
        resultLabel = "Vitória do Time A";
    } else if (match.scoreB > match.scoreA) {
        resultLabel = "Vitória do Time B";
    }

    const stats = group?.stats;

    return (
        <div className="group-page">

            {/* HEADER */}

            <header className="group-header">
                <div className="group-header-left">
                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                `/groups/${groupId}`,
                            )
                        }
                        title="Voltar"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="group-header-info">
                        <span className="group-header-icon">
                            <Trophy size={18} />
                        </span>

                        <div>
                            <span className="eyebrow">
                                PARTIDA
                            </span>

                            <h1>
                                {formattedDate}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENT */}

            <main className="group-content">

                {match.photoBase64 && (
                    <section className="match-details-photo">
                        <img
                            src={match.photoBase64}
                            alt="Foto da partida"
                        />
                    </section>
                )}

                {/* SCORE */}

                <section className="match-details-score">
                    <div className="match-summary">
                        <span>
                            Time A
                        </span>

                        <strong>
                            {match.scoreA} ×{" "}
                            {match.scoreB}
                        </strong>

                        <span>
                            Time B
                        </span>
                    </div>

                    <div className="match-details-meta">
                        <span className="match-details-result">
                            <Trophy size={14} />
                            {resultLabel}
                        </span>

                        <span className="match-details-date">
                            <CalendarDays size={14} />
                            {formattedDate}
                        </span>
                    </div>
                </section>

                {/* TEAMS */}

                <section className="match-details-teams">

                    <div className="match-details-team">
                        <div className="group-section-header">
                            <div>
                                <span className="eyebrow">
                                    TIME A
                                </span>

                                <h3>
                                    {match.scoreA}{" "}
                                    {match.scoreA === 1
                                        ? "gol"
                                        : "gols"}
                                </h3>
                            </div>
                        </div>

                        <div className="match-details-players">
                            {teamAPlayers.length === 0 ? (
                                <p className="match-details-empty">
                                    Nenhum jogador
                                    escalado.
                                </p>
                            ) : (
                                teamAPlayers.map(
                                    (player) => (
                                        <PlayerStatRow
                                            key={
                                                player.userId
                                            }
                                            player={player}
                                            stats={stats}
                                        />
                                    ),
                                )
                            )}
                        </div>
                    </div>

                    <div className="match-details-team">
                        <div className="group-section-header">
                            <div>
                                <span className="eyebrow">
                                    TIME B
                                </span>

                                <h3>
                                    {match.scoreB}{" "}
                                    {match.scoreB === 1
                                        ? "gol"
                                        : "gols"}
                                </h3>
                            </div>
                        </div>

                        <div className="match-details-players">
                            {teamBPlayers.length === 0 ? (
                                <p className="match-details-empty">
                                    Nenhum jogador
                                    escalado.
                                </p>
                            ) : (
                                teamBPlayers.map(
                                    (player) => (
                                        <PlayerStatRow
                                            key={
                                                player.userId
                                            }
                                            player={player}
                                            stats={stats}
                                        />
                                    ),
                                )
                            )}
                        </div>
                    </div>

                </section>

            </main>
        </div>
    );
}

interface PlayerStatRowProps {
    player: MatchPlayer;
    stats?: GroupType["stats"];
}

function PlayerStatRow({
    player,
    stats,
}: PlayerStatRowProps) {
    return (
        <div className="match-details-player">
            <div className="match-player-info">
                <div className="member-avatar">
                    {player.photoURL ? (
                        <img
                            src={player.photoURL}
                            alt={
                                player.name || "Jogador"
                            }
                        />
                    ) : (
                        (player.name || "J")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <strong>
                    {player.name || "Jogador"}
                </strong>

                {stats?.mvp && player.mvp && (
                    <span className="match-details-mvp-badge">
                        <Star size={11} />
                        MVP
                    </span>
                )}
            </div>

            <div className="match-details-player-stats">
                {stats?.goals && (
                    <span className="stat-pill">
                        <Goal size={12} />
                        {player.goals || 0}
                    </span>
                )}

                {stats?.assists && (
                    <span className="stat-pill">
                        Assist.
                        <strong>
                            {player.assists || 0}
                        </strong>
                    </span>
                )}

                {stats?.yellowCards && (
                    <span className="stat-pill stat-pill-yellow">
                        <em />
                        {player.yellowCards || 0}
                    </span>
                )}

                {stats?.redCards && (
                    <span className="stat-pill stat-pill-red">
                        <em />
                        {player.redCards || 0}
                    </span>
                )}
            </div>
        </div>
    );
}

export default MatchDetails;
