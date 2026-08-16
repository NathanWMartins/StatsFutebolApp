import { Copy, Check, X, Share2 } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import type { Group } from "../../services/groups";

interface InviteGroupModalProps {
    open: boolean;
    onClose: () => void;
    group: Group;
}

function InviteGroupModal({
    open,
    onClose,
    group,
}: InviteGroupModalProps) {
    const [copied, setCopied] = useState(false);

    if (!open) {
        return null;
    }

    const inviteUrl = `${window.location.origin}/join/${group.inviteCode}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Erro ao copiar convite:",
                error,
            );
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="invite-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <X size={20} />
                </button>

                <div className="invite-icon">
                    <Share2 size={20} />
                </div>

                <span className="eyebrow">
                    CONVIDAR JOGADORES
                </span>

                <h2>
                    Convide seus amigos
                </h2>

                <p>
                    Compartilhe o link abaixo ou
                    mostre o QR Code para seus
                    amigos entrarem em{" "}
                    <strong>{group.name}</strong>.
                </p>

                <div className="invite-link-section">
                    <label>
                        LINK DE CONVITE
                    </label>

                    <div className="invite-link-box">
                        <span>
                            {inviteUrl}
                        </span>

                        <button
                            onClick={handleCopy}
                            title="Copiar link"
                        >
                            {copied ? (
                                <Check size={17} />
                            ) : (
                                <Copy size={17} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="invite-qr">
                    <QRCodeSVG
                        value={inviteUrl}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="M"
                    />
                </div>

                <button
                    className="button button-primary invite-copy-button"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <Check size={17} />
                            Link copiado
                        </>
                    ) : (
                        <>
                            <Copy size={17} />
                            Copiar link
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default InviteGroupModal;