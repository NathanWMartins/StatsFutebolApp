import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { FirebaseError } from "firebase/app";

import {
    GoogleAuthProvider,
    getRedirectResult,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    type User,
} from "firebase/auth";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

interface AuthContextData {
    user: User | null;
    loading: boolean;
    isMaxAdmin: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    loading: true,
    isMaxAdmin: false,
    loginWithGoogle: async () => { },
    logout: async () => { },
});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const maxAdminEmail =
        import.meta.env.VITE_MAX_ADMIN;

    const isMaxAdmin =
        !!user?.email &&
        user.email.toLowerCase() ===
        maxAdminEmail?.toLowerCase();

    useEffect(() => {
        // Conclui o login por redirecionamento (se o usuário
        // acabou de voltar do Google) e captura eventuais erros
        // que não aparecem via onAuthStateChanged.
        getRedirectResult(auth).catch((error) => {
            console.error(
                "Erro ao concluir login com Google:",
                error,
            );
        });

        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (currentUser) => {
                    if (currentUser) {
                        try {
                            const userRef = doc(
                                db,
                                "users",
                                currentUser.uid,
                            );

                            const userSnapshot =
                                await getDoc(userRef);

                            if (
                                !userSnapshot.exists()
                            ) {
                                await setDoc(
                                    userRef,
                                    {
                                        name:
                                            currentUser.displayName,
                                        email:
                                            currentUser.email,
                                        photoURL:
                                            currentUser.photoURL,
                                        createdAt:
                                            serverTimestamp(),
                                    },
                                );
                            }
                        } catch (error) {
                            console.error(
                                "Erro ao criar usuário:",
                                error,
                            );
                        }
                    }

                    setUser(currentUser);
                    setLoading(false);
                },
            );

        return unsubscribe;
    }, []);

    const loginWithGoogle =
        async (): Promise<void> => {
            const provider =
                new GoogleAuthProvider();

            try {
                await signInWithPopup(
                    auth,
                    provider,
                );
            } catch (error) {
                // Se o popup não puder ser usado (bloqueado pelo
                // navegador ou ambiente sem suporte, como
                // navegadores embutidos de apps), caímos para o
                // fluxo por redirecionamento.
                if (
                    error instanceof FirebaseError &&
                    (error.code ===
                        "auth/popup-blocked" ||
                        error.code ===
                        "auth/operation-not-supported-in-this-environment")
                ) {
                    await signInWithRedirect(
                        auth,
                        provider,
                    );

                    return;
                }

                throw error;
            }
        };

    const logout =
        async (): Promise<void> => {
            await signOut(auth);
        };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isMaxAdmin,
                loginWithGoogle,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}