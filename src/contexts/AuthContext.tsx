import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
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
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    loading: true,
    loginWithGoogle: async () => {},
    logout: async () => {},
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

    useEffect(() => {
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

            await signInWithPopup(
                auth,
                provider,
            );
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