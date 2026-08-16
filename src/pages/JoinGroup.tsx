import {
    Check,
    Goal,
    LogIn,
    Users,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import {
    getGroupByInviteCode,
    joinGroup,
    type Group,
} from "../services/groups";

function JoinGroup() {
    const { inviteCode } = useParams();

    const navigate = useNavigate();

    const {
        user,
        loginWithGoogle,
    } = useAuth();

    const [group, setGroup] =
        useState<Group | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [joining, setJoining] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadGroup = async () => {
            if (!inviteCode) {
                setError(
                    "Convite inválido.",
                );

                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError("");

                const groupData =
                    await getGroupByInviteCode(
                        inviteCode,
                    );

                if (!groupData) {
                    setError(
                        "Esse convite não é válido ou o grupo não existe mais.",
                    );

                    return;
                }

                setGroup(groupData);
            } catch (error) {
                console.error(
                    "Erro ao carregar convite:",
                    error,
                );

                setError(
                    "Não foi possível carregar o convite.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [inviteCode]);

    const handleJoin = async () => {
        if (!group || !user) {
            return;
        }

        try {
            setJoining(true);
            setError("");

            await joinGroup(
                group.id,
                user.uid,
                user.displayName || "Jogador",
                user.photoURL,
            );

            navigate(
                `/groups/${group.id}`,
            );
        } catch (error) {
            console.error(
                "ERRO COMPLETO AO CARREGAR CONVITE:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar o convite.",
            );
        } finally {
            setJoining(false);
        }
    };

    const handleLogin = async () => {
        try {
            setError("");

            await loginWithGoogle();
        } catch (error) {
            console.error(
                "Erro ao fazer login:",
                error,
            );

            setError(
                "Não foi possível fazer login com o Google.",
            );
        }
    };

    if (loading) {
        return (
            <div className="join-page">
                <div className="join-card">
                    <div className="join-icon">
                        <Goal size={28} />
                    </div>

                    <h1>
                        Carregando convite...
                    </h1>

                    <p>
                        Estamos verificando o
                        convite.
                    </p>
                </div>
            </div>
        );
    }

    if (error && !group) {
        return (
            <div className="join-page">
                <div className="join-card">
                    <div className="join-icon join-error">
                        !
                    </div>

                    <h1>
                        Convite inválido
                    </h1>

                    <p>
                        {error}
                    </p>

                    <button
                        className="button button-primary"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Voltar para o início
                    </button>
                </div>
            </div>
        );
    }

    if (!group) {
        return null;
    }

    return (
        <div className="join-page">
            <div className="join-card">

                <div className="join-icon">
                    <Goal size={28} />
                </div>

                <span className="eyebrow">
                    VOCÊ FOI CONVIDADO
                </span>

                <h1>
                    {group.name}
                </h1>

                <p>
                    Entre para esse grupo e
                    acompanhe as partidas,
                    estatísticas e rankings
                    da pelada.
                </p>

                <div className="join-group-info">
                    <Users size={18} />

                    <span>
                        Grupo de futebol
                    </span>
                </div>

                {user ? (
                    <button
                        className="button button-primary join-button"
                        onClick={handleJoin}
                        disabled={joining}
                    >
                        {joining ? (
                            "Entrando..."
                        ) : (
                            <>
                                <Check
                                    size={18}
                                />

                                Entrar no grupo
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        className="button button-primary join-button"
                        onClick={handleLogin}
                    >
                        <LogIn size={18} />

                        Entrar com Google
                    </button>
                )}

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

            </div>
        </div>
    );
}

export default JoinGroup;