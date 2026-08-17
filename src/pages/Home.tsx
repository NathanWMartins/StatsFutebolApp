import {
  ArrowRight,
  BarChart3,
  Goal,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

import LoginModal from "../components/auth/LoginModal";

function Home() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">

          {/* Marca */}
          <div className="landing-brand">
            <img
              src="/LogoSuaPelada.png"
              alt=""
              className="landing-logo"
            />

            <span>Sua Pelada</span>
          </div>

          <div className="hero-badge">
            <span className="badge-dot" />

            Feito para quem não perde uma pelada
          </div>

          <h1>
            Sua pelada.
            <br />
            <span>Sua história.</span>
          </h1>

          <p className="hero-description">
            Registre seus jogos, acompanhe gols e assistências,
            monte rankings e descubra quem realmente manda no campo.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={() => setLoginOpen(true)}
            >
              Criar meu grupo

              <ArrowRight size={18} />
            </button>

            <button
              className="button button-secondary"
              onClick={() => setLoginOpen(true)}
            >
              Já tenho um grupo
            </button>
          </div>

          <div className="hero-note">
            <Zap size={15} />

            Grátis para começar
          </div>
        </div>

        <div className="hero-visual">
          <div className="stats-card">
            <div className="stats-header">
              <div>
                <span className="eyebrow">
                  FUTEBOL DE QUARTA
                </span>

                <h3>Artilharia</h3>
              </div>

              <div className="ball-icon">
                <Goal size={20} />
              </div>
            </div>

            <div className="player-list">
              <div className="player player-highlight">
                <span className="position">
                  01
                </span>

                <div className="avatar">
                  J
                </div>

                <div className="player-info">
                  <strong>João</strong>
                  <span>18 jogos</span>
                </div>

                <strong className="goals">
                  24{" "}
                  <Goal
                    size={13}
                    style={{
                      verticalAlign: "-2px",
                    }}
                  />
                </strong>
              </div>

              <div className="player">
                <span className="position">
                  02
                </span>

                <div className="avatar">
                  P
                </div>

                <div className="player-info">
                  <strong>Pedro</strong>
                  <span>17 jogos</span>
                </div>

                <strong className="goals">
                  18{" "}
                  <Goal
                    size={13}
                    style={{
                      verticalAlign: "-2px",
                    }}
                  />
                </strong>
              </div>

              <div className="player">
                <span className="position">
                  03
                </span>

                <div className="avatar">
                  L
                </div>

                <div className="player-info">
                  <strong>Lucas</strong>
                  <span>16 jogos</span>
                </div>

                <strong className="goals">
                  15{" "}
                  <Goal
                    size={13}
                    style={{
                      verticalAlign: "-2px",
                    }}
                  />
                </strong>
              </div>
            </div>

            <div className="stats-footer">
              <span>
                23 partidas registradas
              </span>

              <span className="online">
                <span />
                Ao vivo
              </span>
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span>
              <Trophy size={18} />
            </span>

            <div>
              <strong>Ranking</strong>

              <small>
                João assumiu a liderança
              </small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span>
              <Goal size={18} />
            </span>

            <div>
              <strong>+24 gols</strong>

              <small>
                nesta temporada
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span className="eyebrow">
            TUDO EM UM SÓ LUGAR
          </span>

          <h2>
            A pelada acaba.
            <br />
            <span>As estatísticas ficam.</span>
          </h2>

          <p>
            Registre o que acontece em campo e transforme cada jogo
            em parte da história da sua galera.
          </p>
        </div>

        <div className="feature-grid">
          <Feature
            icon={<Users size={22} />}
            title="Sua galera"
            description="Crie seu grupo, convide os amigos e mantenha todo mundo no mesmo lugar."
          />

          <Feature
            icon={<Trophy size={22} />}
            title="Rankings"
            description="Descubra quem é o artilheiro, garçom e destaque da sua pelada."
          />

          <Feature
            icon={<BarChart3 size={22} />}
            title="Estatísticas"
            description="Gols, assistências, vitórias e tudo que vocês decidirem acompanhar."
          />
        </div>
      </section>

      <section className="cta">
        <div>
          <span className="eyebrow">
            PRONTO PARA COMEÇAR?
          </span>

          <h2>
            A próxima partida
            <br />
            já pode valer história.
          </h2>
        </div>

        <button
          className="button button-primary"
          onClick={() => setLoginOpen(true)}
        >
          Criar meu grupo

          <ArrowRight size={18} />
        </button>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <img
            src="/LogoSuaPelada.png"
            alt=""
          />

          <strong>Sua Pelada</strong>
        </div>

        <span>
          Feito para quem joga com os amigos.
        </span>
      </footer>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="feature">
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </article>
  );
}

export default Home;