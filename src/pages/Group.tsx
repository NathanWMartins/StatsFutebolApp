import {
    ArrowLeft,
    Settings,
    Users,
    Trophy,
    Plus,
    Goal,
    UserX,
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
    removeGroupMember,
    type Group as GroupType,
    type GroupMember,
} from "../services/groups";

import InviteGroupModal from "../components/groups/InviteGroupModal";
import GroupSettingsModal from "../components/groups/GroupSettingsModal";
import RegisterMatchModal from "../components/matches/RegisterMatchModal";
import {
    deleteMatch,
    getGroupMatches,
    type Match,
} from "../services/matches";
import MatchCard from "../components/groups/MatchCard";

function Group() {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { user, isMaxAdmin } = useAuth();

    const [matches, setMatches] =
        useState<Match[]>([]);

    const [loadingMatches, setLoadingMatches] =
        useState(true);

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

    const [settingsModalOpen, setSettingsModalOpen] =
        useState(false);

    const [registerMatchOpen, setRegisterMatchOpen] =
        useState(false);

    const [editingMatch, setEditingMatch] =
        useState<Match | null>(null);

    useEffect(() => {
        const loadGroup = async () => {
            if (!groupId) {
                setError("Grupo não encontrado.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setLoadingMatches(true);
                setError("");

                const [
                    groupData,
                    groupMembers,
                    groupMatches,
                ] = await Promise.all([
                    getGroupById(groupId),
                    getGroupMembers(groupId),
                    getGroupMatches(groupId),
                ]);

                if (!groupData) {
                    setError(
                        "Esse grupo não existe ou foi removido.",
                    );

                    return;
                }

                setGroup(groupData);
                setMembers(groupMembers);
                setMatches(groupMatches);
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
                setLoadingMatches(false);
            }
        };

        loadGroup();
    }, [groupId]);

    const refreshMatches = async () => {
        if (!groupId) {
            return;
        }

        try {
            setLoadingMatches(true);

            const groupMatches =
                await getGroupMatches(groupId);

            setMatches(groupMatches);
        } catch (error) {
            console.error(
                "Erro ao atualizar partidas:",
                error,
            );
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleDeleteMatch = async (
        matchId: string,
    ) => {
        try {
            await deleteMatch(matchId);

            setMatches((current) =>
                current.filter(
                    (match) => match.id !== matchId,
                ),
            );
        } catch (error) {
            console.error(
                "Erro ao excluir partida:",
                error,
            );

            window.alert(
                "Não foi possível excluir a partida.",
            );
        }
    };

    const handleRemoveMember = async (
        member: GroupMember,
    ) => {
        if (
            !window.confirm(
                `Remover ${member.name || "esse jogador"
                } do grupo? As estatísticas das partidas já registradas serão mantidas.`,
            )
        ) {
            return;
        }

        try {
            await removeGroupMember(member.id);

            setMembers((current) =>
                current.filter(
                    (existing) => existing.id !== member.id,
                ),
            );
        } catch (error) {
            console.error(
                "Erro ao remover jogador:",
                error,
            );

            window.alert(
                "Não foi possível remover o jogador.",
            );
        }
    };

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
                                <Goal size={18} />
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
                            <Goal size={24} />
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
                                <Goal size={18} />
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

    const currentMember = members.find(
        (member) => member.userId === user?.uid,
    );

    const isAdmin =
        isMaxAdmin ||
        currentMember?.role === "admin";

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
                            <Goal size={18} />
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
                        onClick={() =>
                            setSettingsModalOpen(true)
                        }
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
                            onClick={() => {
                                setEditingMatch(null);
                                setRegisterMatchOpen(true);
                            }}
                        >
                            <Plus size={17} />
                            Registrar partida
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
                            <Goal size={19} />
                        </div>

                        <div>

                            <span>
                                PARTIDAS
                            </span>

                            <strong>
                                {matches.length}
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

                                    {isAdmin &&
                                        member.userId !==
                                        group.ownerId && (
                                            <button
                                                type="button"
                                                className="member-remove"
                                                title="Remover jogador"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        member,
                                                    )
                                                }
                                            >
                                                <UserX size={15} />
                                            </button>
                                        )}

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                {/* MATCHES */}

                <section className="group-section matches-section">
                    <div className="section-title">
                        <div>
                            <span className="eyebrow">
                                HISTÓRICO
                            </span>

                            <h2>Últimas partidas</h2>
                        </div>

                        <span>
                            {matches.length}{" "}
                            {matches.length === 1
                                ? "partida"
                                : "partidas"}
                        </span>
                    </div>

                    {loadingMatches ? (
                        <div className="empty-groups">
                            <div className="empty-icon">
                                <Goal size={25} />
                            </div>

                            <h3>
                                Carregando partidas...
                            </h3>

                            <p>
                                Buscando o histórico do
                                grupo.
                            </p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="empty-groups">
                            <div className="empty-icon">
                                <Trophy size={25} />
                            </div>

                            <h3>
                                Nenhuma partida registrada
                            </h3>

                            <p>
                                Registre a primeira partida
                                para começar a construir o
                                histórico do grupo.
                            </p>
                            {(isAdmin) && (
                                <button
                                    className="button button-primary"
                                    onClick={() => {
                                        setEditingMatch(null);
                                        setRegisterMatchOpen(true);
                                    }}
                                >
                                    Registrar primeira partida
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="matches-grid">
                            {matches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    canEditOrCreate={isAdmin}
                                    onClick={() => {
                                        navigate(
                                            `/groups/${group.id}/matches/${match.id}`,
                                        );
                                    }}
                                    onEdit={() => {
                                        setEditingMatch(match);
                                        setRegisterMatchOpen(true);
                                    }}
                                    onDelete={() => {
                                        handleDeleteMatch(
                                            match.id,
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* RANKING */}

                {/* <section className="group-section">

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
                            <Trophy size={22} />
                        </span>

                        <p>
                            O ranking aparecerá aqui
                            conforme os jogos forem
                            registrados.
                        </p>

                    </div>

                </section> */}

            </main>
            <GroupSettingsModal
                open={settingsModalOpen}
                onClose={() =>
                    setSettingsModalOpen(false)
                }
                group={group}
                onUpdated={({ name, stats }) => {
                    setGroup((current) =>
                        current
                            ? {
                                ...current,
                                name,
                                stats,
                            }
                            : current,
                    );
                }}
                onDeleted={() => {
                    navigate("/groups");
                }}
            />
            <RegisterMatchModal
                open={registerMatchOpen}
                onClose={() => {
                    setRegisterMatchOpen(false);
                    setEditingMatch(null);
                }}
                groupId={group.id}
                group={group}
                members={members}
                editingMatch={editingMatch}
                onCreated={() => {
                    refreshMatches();
                    setRegisterMatchOpen(false);
                    setEditingMatch(null);
                }}
            />
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