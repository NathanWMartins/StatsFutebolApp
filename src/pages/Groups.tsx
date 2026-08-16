import {
    Plus,
    Users,
    Trophy,
    ArrowRight,
    LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import CreateGroupModal from "../components/groups/CreateGroupModal";

import {
    getUserGroups,
    type Group,
} from "../services/groups";
import { useNavigate } from "react-router-dom";

function Groups() {
    const {
        user,
        logout,
    } = useAuth();
    const navigate = useNavigate();

    const [createGroupOpen, setCreateGroupOpen] = useState(false);

    const [groups, setGroups] = useState<Group[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    const loadGroups = async () => {
        if (!user) {
            return;
        }

        try {
            setLoadingGroups(true);

            const userGroups = await getUserGroups(user.uid);

            setGroups(userGroups);
        } catch (error) {
            console.error(
                "Erro ao carregar grupos:",
                error,
            );
        } finally {
            setLoadingGroups(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, [user]);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <span className="dashboard-logo">
                        ⚽
                    </span>

                    <span>Pelada</span>
                </div>

                <div className="dashboard-user">
                    <div className="user-info">
                        <strong>
                            {user?.displayName || "Usuário"}
                        </strong>

                        <span>
                            {user?.email}
                        </span>
                    </div>

                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={
                                user.displayName ||
                                "Usuário"
                            }
                            className="user-avatar"
                        />
                    ) : (
                        <div className="user-avatar-placeholder">
                            {user?.displayName?.charAt(0) ||
                                "U"}
                        </div>
                    )}

                    <button
                        className="logout-button"
                        title="Sair"
                        onClick={logout}
                    >
                        <LogOut size={17} />
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-welcome">
                    <div>
                        <span className="eyebrow">
                            MEUS GRUPOS
                        </span>

                        <h1>
                            Olá,{" "}
                            {user?.displayName?.split(
                                " ",
                            )[0] || "jogador"}{" "}
                            👋
                        </h1>

                        <p>
                            Escolha um grupo para
                            acompanhar suas partidas ou
                            crie um novo.
                        </p>
                    </div>

                    <button
                        className="button button-primary"
                        onClick={() =>
                            setCreateGroupOpen(true)
                        }
                    >
                        <Plus size={18} />
                        Criar grupo
                    </button>
                </section>

                <section className="groups-section">
                    <div className="section-title">
                        <h2>Seus grupos</h2>

                        <span>
                            {groups.length}{" "}
                            {groups.length === 1
                                ? "grupo"
                                : "grupos"}
                        </span>
                    </div>

                    {loadingGroups ? (
                        <div className="empty-groups">
                            <div className="empty-icon">
                                ⚽
                            </div>

                            <h3>
                                Carregando seus grupos...
                            </h3>

                            <p>
                                Estamos buscando seus
                                grupos.
                            </p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="empty-groups">
                            <div className="empty-icon">
                                <Users size={25} />
                            </div>

                            <h3>
                                Você ainda não possui
                                grupos
                            </h3>

                            <p>
                                Crie seu primeiro grupo e
                                convide seus amigos para
                                começar a registrar as
                                partidas.
                            </p>

                            <button
                                className="button button-primary"
                                onClick={() =>
                                    setCreateGroupOpen(
                                        true,
                                    )
                                }
                            >
                                <Plus size={17} />
                                Criar meu primeiro grupo
                            </button>
                        </div>
                    ) : (
                        <div className="groups-grid">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="group-card"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                        navigate(`/groups/${group.id}`)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            navigate(`/groups/${group.id}`);
                                        }
                                    }}
                                >
                                    <div className="group-card-icon">
                                        ⚽
                                    </div>

                                    <div className="group-card-content">
                                        <h3>
                                            {group.name}
                                        </h3>

                                        <span>
                                            {group.ownerId ===
                                                user?.uid
                                                ? "Administrador"
                                                : "Membro"}
                                        </span>
                                    </div>

                                    <button
                                        className="group-card-arrow"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigate(`/groups/${group.id}`);
                                        }}
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="quick-section">
                    <div className="quick-card">
                        <div className="quick-icon">
                            <Trophy size={21} />
                        </div>

                        <div>
                            <strong>
                                Transforme suas peladas em
                                estatísticas
                            </strong>

                            <p>
                                Registre gols,
                                assistências, vitórias e
                                muito mais.
                            </p>
                        </div>

                        <ArrowRight size={18} />
                    </div>
                </section>
            </main>

            <CreateGroupModal
                open={createGroupOpen}
                onClose={() =>
                    setCreateGroupOpen(false)
                }
                onCreated={async () => {
                    setCreateGroupOpen(false);

                    await loadGroups();
                }}
            />
        </div>
    );
}

export default Groups;