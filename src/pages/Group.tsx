import {
    ArrowLeft,
    Settings,
    Users,
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

import { useAuth } from "../contexts/AuthContext";

import {
    getGroupById,
    getGroupMembers,
    type Group as GroupType,
    type GroupMember,
} from "../services/groups";

import InviteGroupModal from "../components/groups/InviteGroupModal";

function Group() {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { user } = useAuth();

    const [group, setGroup] =
        useState<GroupType | null>(null);

    const [members, setMembers] =
        useState<GroupMember[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [inviteModalOpen, setInviteModalOpen] =
        useState(false);

    useEffect(() => {
        const loadGroup = async () => {
            if (!groupId) {
                setError("Grupo não encontrado.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const groupData =
                    await getGroupById(groupId);

                if (!groupData) {
                    setError(
                        "Esse grupo não existe ou foi removido.",
                    );

                    return;
                }

                const groupMembers =
                    await getGroupMembers(groupId);

                setGroup(groupData);
                setMembers(groupMembers);
            } catch (error) {
                console.error(
                    "Erro ao carregar grupo:",
                    error,
                );

                setError(
                    "Não foi possível carregar o grupo.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [groupId]);

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
                                navigate("/groups")
                            }
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="group-header-info">
                            <span className="group-header-icon">
                                ⚽
                            </span>

                            <div>
                                <span className="eyebrow">
                                    GRUPO
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
                            ⚽
                        </div>

                        <h2>
                            Carregando grupo...
                        </h2>

                        <p>
                            Estamos buscando as
                            informações do grupo.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    /*
     * ERROR
     */

    if (error || !group) {
        return (
            <div className="group-page">
                <header className="group-header">
                    <div className="group-header-left">
                        <button
                            className="back-button"
                            onClick={() =>
                                navigate("/groups")
                            }
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="group-header-info">
                            <span className="group-header-icon">
                                ⚽
                            </span>

                            <div>
                                <span className="eyebrow">
                                    GRUPO
                                </span>

                                <h1>
                                    Grupo
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
                                "Grupo não encontrado."}
                        </h2>

                        <p>
                            Verifique o endereço ou
                            volte para seus grupos.
                        </p>

                        <button
                            className="button button-primary"
                            onClick={() =>
                                navigate("/groups")
                            }
                        >
                            Voltar para meus grupos
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const isAdmin =
        group.ownerId === user?.uid;

    return (
        <div className="group-page">

            {/* HEADER */}

            <header className="group-header">
                <div className="group-header-left">

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/groups")
                        }
                        title="Voltar"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="group-header-info">

                        <span className="group-header-icon">
                            ⚽
                        </span>

                        <div>
                            <span className="eyebrow">
                                GRUPO
                            </span>

                            <h1>
                                {group.name}
                            </h1>
                        </div>

                    </div>
                </div>

                {isAdmin && (
                    <button
                        className="group-settings-button"
                        title="Configurações"
                    >
                        <Settings size={18} />
                    </button>
                )}
            </header>

            {/* CONTENT */}

            <main className="group-content">

                {/* HERO */}

                <section className="group-hero">

                    <div>

                        <span className="eyebrow">
                            VISÃO GERAL
                        </span>

                        <h2>
                            {group.name}
                        </h2>

                        <p>
                            Gerencie suas partidas,
                            acompanhe os jogadores e
                            descubra quem está
                            dominando a pelada.
                        </p>

                    </div>

                    {isAdmin && (
                        <button
                            className="button button-primary"
                        >
                            + Registrar jogo
                        </button>
                    )}

                </section>

                {/* STATS */}

                <section className="group-stats">

                    <div className="group-stat-card">

                        <div className="group-stat-icon">
                            <Users size={19} />
                        </div>

                        <div>

                            <span>
                                JOGADORES
                            </span>

                            <strong>
                                {members.length}
                            </strong>

                        </div>

                    </div>

                    <div className="group-stat-card">

                        <div className="group-stat-icon">
                            ⚽
                        </div>

                        <div>

                            <span>
                                PARTIDAS
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>

                    </div>

                    <div className="group-stat-card">

                        <div className="group-stat-icon">
                            <Trophy size={19} />
                        </div>

                        <div>

                            <span>
                                CAMPEÃO
                            </span>

                            <strong>
                                —
                            </strong>

                        </div>

                    </div>

                </section>

                {/* MEMBERS */}

                <section className="group-section">

                    <div className="group-section-header">

                        <div>

                            <span className="eyebrow">
                                ELENCO
                            </span>

                            <h3>
                                Jogadores
                            </h3>

                        </div>

                        {isAdmin && (
                            <button
                                className="text-button"
                                onClick={() =>
                                    setInviteModalOpen(true)
                                }
                            >
                                Convidar jogadores
                            </button>
                        )}

                    </div>

                    {members.length === 0 ? (

                        <div className="group-empty-state">

                            <div className="group-empty-icon">
                                <Users size={21} />
                            </div>

                            <h3>
                                Nenhum jogador
                            </h3>

                            <p>
                                Convide seus amigos
                                para começar a
                                montar o elenco.
                            </p>

                        </div>

                    ) : (

                        <div className="members-grid">

                            {members.map((member) => (

                                <div
                                    key={member.id}
                                    className="member-card"
                                >

                                    <div className="member-avatar">
                                        {member.photoURL ? (
                                            <img
                                                src={member.photoURL}
                                                alt={member.name || "Jogador"}
                                            />
                                        ) : (
                                            (member.name || "Jogador")
                                                .charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>

                                    <div className="member-info">
                                        <strong>
                                            {member.name || "Jogador"}
                                        </strong>

                                        <span>
                                            {member.role === "admin"
                                                ? "Administrador"
                                                : "Jogador"}
                                        </span>
                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                {/* MATCHES */}

                <section className="group-section">

                    <div className="group-section-header">

                        <div>

                            <span className="eyebrow">
                                ATIVIDADE
                            </span>

                            <h3>
                                Últimos jogos
                            </h3>

                        </div>

                        <button className="text-button">
                            Ver todos
                        </button>

                    </div>

                    <div className="group-empty-state">

                        <div className="group-empty-icon">
                            ⚽
                        </div>

                        <h3>
                            Nenhum jogo registrado
                        </h3>

                        <p>
                            Registre a primeira
                            partida para começar
                            a construir as
                            estatísticas do grupo.
                        </p>

                        {isAdmin && (
                            <button
                                className="button button-primary"
                            >
                                Registrar primeiro jogo
                            </button>
                        )}

                    </div>

                </section>

                {/* RANKING */}

                <section className="group-section">

                    <div className="group-section-header">

                        <div>

                            <span className="eyebrow">
                                RANKING
                            </span>

                            <h3>
                                Destaques
                            </h3>

                        </div>

                    </div>

                    <div className="ranking-placeholder">

                        <span>
                            🏆
                        </span>

                        <p>
                            O ranking aparecerá aqui
                            conforme os jogos forem
                            registrados.
                        </p>

                    </div>

                </section>

            </main>
            <InviteGroupModal
                open={inviteModalOpen}
                onClose={() =>
                    setInviteModalOpen(false)
                }
                group={group}
            />
        </div>
    );
}

export default Group;