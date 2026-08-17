import { X } from "lucide-react";
import { loginWithGoogle } from "../../services/auth";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
}

function LoginModal({ open, onClose }: LoginModalProps) {
    const navigate = useNavigate();

    if (!open) {
        return null;
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();

            onClose();

            navigate("/groups");
        } catch (error) {
            console.error("Erro ao fazer login:", error);
        }
    };

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div
                className="login-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <X size={20} />
                </button>

                <div className="login-brand">
                    <img
                        src="/LogoSuaPelada.png"
                        alt="Sua Pelada"
                    />

                    <span>Sua Pelada</span>
                </div>

                <p>
                    Entre para criar seu grupo e começar a registrar
                    seus jogos.
                </p>

                <button
                    className="google-button"
                    onClick={handleGoogleLogin}
                >
                    <span className="google-icon">G</span>
                    <span>Continuar com Google</span>
                </button>

                <small>
                    Ao continuar, você concorda com nossos termos de uso.
                </small>
            </div>
        </div>
    );
}

export default LoginModal;