import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);

  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};