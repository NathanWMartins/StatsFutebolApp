import {
    CalendarDays,
    ChevronRight,
    Trophy,
} from "lucide-react";

import type { Match } from "../../services/matches";

interface MatchCardProps {
    match: Match;
    onClick?: () => void;
}

function MatchCard({
    match,
    onClick,
}: MatchCardProps) {
    const date = new Date(
        `${match.date}T00:00:00`,
    );

    const formattedDate =
        date.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            },
        );

    const teamAPlayers =
        match.players.filter(
            (player) =>
                player.team === "A",
        );

    const teamBPlayers =
        match.players.filter(
            (player) =>
                player.team === "B",
        );

    let resultLabel = "Empate";

    if (match.scoreA > match.scoreB) {
        resultLabel = "Vitória do Time A";
    } else if (
        match.scoreB > match.scoreA
    ) {
        resultLabel = "Vitória do Time B";
    }

    return (
        <article
            className="match-card"
            onClick={onClick}
        >
            {match.photoBase64 ? (
                <div className="match-card-photo">
                    <img
                        src={match.photoBase64}
                        alt="Foto da partida"
                    />
                </div>
            ) : (
                <div className="match-card-photo match-card-photo-empty">
                    <Trophy size={25} />
                </div>
            )}

            <div className="match-card-body">
                <div className="match-card-date">
                    <CalendarDays size={14} />

                    <span>
                        {formattedDate}
                    </span>
                </div>

                <div className="match-card-score">
                    <div className="match-card-team">
                        <span>Time A</span>

                        <strong>
                            {match.scoreA}
                        </strong>
                    </div>

                    <span className="match-card-x">
                        ×
                    </span>

                    <div className="match-card-team">
                        <span>Time B</span>

                        <strong>
                            {match.scoreB}
                        </strong>
                    </div>
                </div>

                <div className="match-card-result">
                    <Trophy size={14} />

                    <span>
                        {resultLabel}
                    </span>
                </div>

                <div className="match-card-footer">
                    <span>
                        {teamAPlayers.length +
                            teamBPlayers.length}{" "}
                        jogadores
                    </span>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick?.();
                        }}
                    >
                        Ver partida
                        <ChevronRight
                            size={15}
                        />
                    </button>
                </div>
            </div>
        </article>
    );
}

export default MatchCard;