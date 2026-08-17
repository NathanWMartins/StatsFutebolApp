import { FirebaseError } from "firebase/app";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    return result.user;
  } catch (error) {
    // Se o popup não puder ser usado (bloqueado pelo navegador ou
    // ambiente sem suporte, como navegadores embutidos de apps),
    // caímos para o fluxo por redirecionamento.
    if (
      error instanceof FirebaseError &&
      (error.code === "auth/popup-blocked" ||
        error.code ===
          "auth/operation-not-supported-in-this-environment")
    ) {
      await signInWithRedirect(auth, googleProvider);

      return null;
    }

    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
