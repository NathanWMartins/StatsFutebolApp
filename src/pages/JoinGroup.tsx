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
        loading: authLoading,
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
            if (authLoading) {
                return;
            }

            // Usuário ainda não está autenticado.
            // Não tentamos acessar o Firestore.
            if (!user) {
                setLoading(false);
                return;
            }

            if (!inviteCode) {
                setError("Convite inválido.");
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
    }, [inviteCode, user, authLoading]);

    const handleLogin = async () => {
        try {
            setError("");

            await loginWithGoogle();

            // Não precisamos navegar.
            // Depois do login, o AuthContext atualiza
            // "user" e o useEffect acima será executado novamente.
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

            navigate(`/groups/${group.id}`);
        } catch (error) {
            console.error(
                "Erro ao entrar no grupo:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível entrar no grupo.",
            );
        } finally {
            setJoining(false);
        }
    };

    if (authLoading) {
        return (
            <div className="join-page">
                <div className="join-card">
                    <div className="join-icon">
                        <Goal size={28} />
                    </div>

                    <h1>
                        Verificando acesso...
                    </h1>

                    <p>
                        Aguarde enquanto verificamos
                        sua conta.
                    </p>
                </div>
            </div>
        );
    }

    // Usuário não autenticado
    if (!user) {
        return (
            <div className="join-page">
                <div className="join-card">
                    <div className="join-icon">
                        <LogIn size={28} />
                    </div>

                    <span className="eyebrow">
                        CONVITE PARA GRUPO
                    </span>

                    <h1>
                        Entre para continuar
                    </h1>

                    <p>
                        Faça login com sua conta Google
                        para acessar o convite e entrar
                        no grupo.
                    </p>

                    <button
                        className="button button-primary join-button"
                        onClick={handleLogin}
                    >
                        <LogIn size={18} />

                        Entrar com Google
                    </button>

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <button
                        className="join-back-button"
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
                        Estamos verificando o convite.
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

                <button
                    className="button button-primary join-button"
                    onClick={handleJoin}
                    disabled={joining}
                >
                    {joining ? (
                        "Entrando..."
                    ) : (
                        <>
                            <Check size={18} />

                            Entrar no grupo
                        </>
                    )}
                </button>

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