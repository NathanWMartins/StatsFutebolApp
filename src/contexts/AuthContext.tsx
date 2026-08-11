import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../config/firebase";

interface AuthContextData {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userRef);

          if (!userSnapshot.exists()) {
            await setDoc(userRef, {
              name: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Erro ao criar usuário:", error);
        }
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}